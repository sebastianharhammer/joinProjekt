/**
 * Firebase-Konfigurationsobjekt.
 * @constant {Object}
 */
const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};

/**
 * Basis-URL für Firebase-Datenbankoperationen.
 * @constant {string}
 */
const BASE_URL = firebaseConfig.databaseURL;

/**
 * Initialisiert die Firebase-App.
 * @constant {firebase.app.App}
 */
const app = firebase.initializeApp(firebaseConfig);

/**
 * Referenz zur Firebase-Datenbank.
 * @constant {firebase.database.Database}
 */
const database = firebase.database();

/**
 * Der aktuell angemeldete Benutzer.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * Array zur Speicherung von Kontaktdaten.
 * @type {Array<Object>}
 */
let contactsData = [];

/**
 * Lädt den aktuell angemeldeten Benutzer aus dem Local Storage.
 */
function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

/**
 * Überprüft, ob der aktuelle Benutzer ein Gastbenutzer ist.
 * @returns {boolean} Gibt true zurück, wenn der Benutzer ein Gast ist, sonst false.
 */
function isGuestUser() {
  return (
    currentUser &&
    currentUser.firstName === "Guest" &&
    currentUser.lastName === "User"
  );
}

// Lädt den aktuellen Benutzer und kontaktiert Firebase, sobald das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
  includeHTML();
  loadCurrentUser();
  fetchContactsFromFirebase();
});

/**
 * Holt die Kontakte von Firebase und aktualisiert die lokale Kontaktliste.
 */
function fetchContactsFromFirebase() {
  const contactsRef = database.ref("contacts");
  contactsRef.on("value", async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const entries = Object.entries(data);
      const updatedContacts = [];
      for (const [firebaseKey, contact] of entries) {
        const updatedContact = await ensureContactHasColor(
          firebaseKey,
          contact
        );
        updatedContacts.push({ firebaseKey, ...updatedContact });
      }
      contactsData = updatedContacts;
      renderSortedContacts(contactsData);
    } else {
      contactsData = [];
      renderSortedContacts(contactsData);
    }
  });
}

/**
 * Stellt sicher, dass ein Kontakt eine Farbe hat. Fügt eine zufällige Farbe hinzu, falls nicht vorhanden.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des Kontakts.
 * @param {Object} contact - Das Kontaktobjekt.
 * @returns {Promise<Object>} Das aktualisierte Kontaktobjekt.
 */
async function ensureContactHasColor(firebaseKey, contact) {
  if (isGuestUser()) {
    if (!contact.color) contact.color = getRandomColor();
    return contact;
  }
  if (!contact.color) {
    const updatedContact = { ...contact, color: getRandomColor() };
    await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });
    return updatedContact;
  }
  return contact;
}

/**
 * Fügt einen neuen Kontakt hinzu. Bei Gastbenutzern wird der Kontakt lokal hinzugefügt, ansonsten in Firebase.
 */
async function addContact() {
  const firstName = prompt("Vorname des neuen Kontakts?");
  const lastName = prompt("Nachname des neuen Kontakts?");
  const email = prompt("E-Mail des neuen Kontakts?");
  const phone = prompt("Telefonnummer des neuen Kontakts?");
  if (!firstName || !lastName) return;
  const newContact = {
    firstName,
    lastName,
    email: email || "",
    phone: phone || "",
    color: getRandomColor(),
  };
  if (isGuestUser()) {
    const pseudoKey = `guest-${Date.now()}`;
    contactsData.push({ firebaseKey: pseudoKey, ...newContact });
    renderSortedContacts(contactsData);
  } else {
    await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
  }
}

/**
 * Bearbeitet einen bestehenden Kontakt. Bei Gastbenutzern wird der Kontakt lokal aktualisiert, ansonsten in Firebase.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des zu bearbeitenden Kontakts.
 */
async function editContact(firebaseKey) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index === -1) return;
  const contact = contactsData[index];
  const newFirstName = prompt("Neuer Vorname:", contact.firstName);
  const newLastName = prompt("Neuer Nachname:", contact.lastName);
  const newEmail = prompt("Neue E-Mail:", contact.email);
  const newPhone = prompt("Neue Telefonnummer:", contact.phone);
  if (!newFirstName || !newLastName) return;
  const updatedLocalContact = {
    ...contact,
    firstName: newFirstName,
    lastName: newLastName,
    email: newEmail || "",
    phone: newPhone || "",
  };
  if (isGuestUser()) {
    contactsData[index] = updatedLocalContact;
    renderSortedContacts(contactsData);
  } else {
    await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedLocalContact),
    });
  }
  const item = document.getElementById(`contact-item-${firebaseKey}`);
  if (item) item.classList.remove("selected");
}

/**
 * Löscht einen Kontakt. Bei Gastbenutzern wird der Kontakt lokal gelöscht, ansonsten in Firebase.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des zu löschenden Kontakts.
 */
async function deleteContact(firebaseKey) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index === -1) return;
  const sure = confirm("Kontakt wirklich löschen?");
  if (!sure) return;
  if (isGuestUser()) {
    contactsData.splice(index, 1);
    renderSortedContacts(contactsData);
  } else {
    await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "DELETE",
    });
  }
}

/**
 * Rendert die Kontaktliste sortiert nach Vornamen und gruppiert nach Anfangsbuchstaben.
 * @param {Array<Object>} contacts - Das Array der Kontakte.
 */
function renderSortedContacts(contacts) {
  const content = document.getElementById("contact-content");
  content.innerHTML = "";
  const sortedContacts = contacts.sort((a, b) =>
    a.firstName.localeCompare(b.firstName)
  );
  const groupedContacts = sortedContacts.reduce((groups, contact) => {
    const firstLetter = contact.firstName[0].toUpperCase();
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(contact);
    return groups;
  }, {});
  let contactsHTML = `<div id="contact-side-panel">
    <div id="add-new-contact-button-container">
        <button onclick="addContact()" id="add-contact-btn">
            Add new contact<img id="add-contact-img" src="./img/person_add.png">
        </button>
    </div>`;
  for (const letter in groupedContacts) {
    contactsHTML += `
      <div class="letter-section">
        <h2 class="letter-header">${letter}</h2>
        <hr />
        <ul class="contact-list">
    `;
    groupedContacts[letter].forEach((contact) => {
      contactsHTML += contactsTemplate(contact);
    });
    contactsHTML += `</ul></div>`;
  }
  contactsHTML += `</div>`;
  content.innerHTML = contactsHTML;
  renderRightSideContainer();
}

/**
 * Erstellt das HTML für einen einzelnen Kontakt.
 * @param {Object} contact - Der Kontakt.
 * @returns {string} Das generierte HTML für den Kontakt.
 */
function contactsTemplate(contact) {
  return `
    <li 
      class="contact-item" 
      id="contact-item-${contact.firebaseKey}"
      onclick="toggleContactDetail('${contact.firebaseKey}')"
    >
      <div class="contact-avatar" style="background-color: ${
        contact.color || getRandomColor()
      }">
        ${getInitials(contact.firstName, contact.lastName)}
      </div>
      <div class="contact-info">
        <div class="contact-name">${contact.firstName} ${contact.lastName}</div>
        <div class="contact-email">${contact.email}</div>
      </div>
    </li>
  `;
}

/**
 * Schaltet die Detailansicht eines Kontakts um.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des Kontakts.
 */
function toggleContactDetail(firebaseKey) {
  const contactItems = document.querySelectorAll(".contact-item");
  const detailViewContainer = document.getElementById("contact-big");
  const mobileDetailView = document.getElementById("mobile-contact-detail");
  const desktopDetailView = document.getElementById("desktop-contact-detail");

  const selectedContact = contactsData.find(
    (c) => c.firebaseKey === firebaseKey
  );
  const clickedItem = document.getElementById(`contact-item-${firebaseKey}`);

  if (!selectedContact) return;

  if (clickedItem && clickedItem.classList.contains("selected")) {
    clickedItem.classList.remove("selected");
    return;
  }

  contactItems.forEach((item) => item.classList.remove("selected"));
  if (clickedItem) clickedItem.classList.add("selected");
  mobileDetailView.innerHTML = getMobileDetailHTML(
    selectedContact,
    firebaseKey
  );
  desktopDetailView.innerHTML = getDesktopDetailHTML(
    selectedContact,
    firebaseKey
  );

  // Überprüfen, ob wir uns in der mobilen Ansicht befinden
  if (window.innerWidth <= 1256) {
    // Sicherstellen, dass das mobile Template angezeigt wird
    mobileDetailView.style.display = "flex"; // oder "block" je nach Layout
  }

  // Sicherstellen, dass die Desktop-Ansicht ausgeblendet bleibt, wenn auf einem mobilen Gerät
  if (window.innerWidth > 1256) {
    desktopDetailView.style.display = "block";
    mobileDetailView.style.display = "none";
  }
}

/**
 * Rendert die Kontaktliste erneut und versteckt die Detailansicht.
 */
function renderContactList() {
  const contactListContainer = document.getElementById("contact-side-panel");
  const detailViewContainer = document.getElementById("contact-big");
  const mobileDetailView = document.getElementById("mobile-contact-detail");

  // Sicherstellen, dass der mobile Detailbereich ausgeblendet wird
  if (mobileDetailView) {
    mobileDetailView.style.display = "none"; // Hier wird der mobile Detailbereich versteckt
  }

  // Kontaktliste sichtbar machen
  if (contactListContainer) {
    contactListContainer.style.removeProperty("display");
    contactListContainer.classList.remove("hidden");
  }

  // Sicherstellen, dass der Desktop-Detailbereich (falls sichtbar) ausgeblendet wird
  if (detailViewContainer) {
    detailViewContainer.style.display = "none";
  }
}

/**
 * Schaltet das Dropdown-Menü um und schließt es bei Klick außerhalb.
 */
function toggleMenu() {
  const menu = document.getElementById("dropdown-menu");
  const button = document.getElementById("menu-button");
  if (!menu) return;
  if (menu.classList.contains("hidden")) {
    menu.style.display = "block";
    setTimeout(() => {
      menu.classList.remove("hidden");
    }, 10);
    document.addEventListener("click", closeMenuOnOutsideClick);
  } else {
    menu.classList.add("hidden");
    setTimeout(() => {
      menu.style.display = "none";
    }, 300);
    document.removeEventListener("click", closeMenuOnOutsideClick);
  }
  /**
   * Schließt das Dropdown-Menü, wenn außerhalb geklickt wird.
   * @param {Event} event - Das auslösende Klick-Ereignis.
   */
  function closeMenuOnOutsideClick(event) {
    if (!menu.contains(event.target) && !button.contains(event.target)) {
      menu.classList.add("hidden");
      setTimeout(() => {
        menu.style.display = "none";
      }, 300);
      document.removeEventListener("click", closeMenuOnOutsideClick);
    }
  }
}

/**
 * Generiert eine zufällige Farbe aus einer vordefinierten Liste.
 * @returns {string} Eine zufällig ausgewählte Farbe im Hex-Format.
 */
function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Holt die Initialen eines Benutzers.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @returns {string} Die Initialen des Benutzers in Großbuchstaben.
 */
function getInitials(firstName, lastName) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Rendert den rechten Seitenbereich für Kontaktdetails, falls nicht bereits vorhanden.
 */
function renderRightSideContainer() {
  const content = document.getElementById("contact-content");
  if (!document.getElementById("contact-big")) {
    content.innerHTML += `
      <div id="contact-big">
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
      </div>
    `;
  }
}
