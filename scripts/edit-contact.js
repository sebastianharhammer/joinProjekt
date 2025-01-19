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

// Lädt den aktuellen Benutzer, sobald das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
});

/**
 * Bearbeitet einen bestehenden Kontakt, indem das Bearbeitungsformular angezeigt wird.
 * Bei Gastbenutzern wird der Kontakt lokal bearbeitet, ansonsten in Firebase.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des zu bearbeitenden Kontakts.
 */
function editContact(firebaseKey) {
  const contact = contactsData.find((c) => c.firebaseKey === firebaseKey);
  if (!contact) return;

  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");
  if (!editContactTemplate || !background) return;

  editContactTemplate.classList.add("show-edit-contact");
  background.classList.remove("d-none");
  editContactTemplate.innerHTML = getEditContactHTML(contact);
  setupEditValidation();
  toggleMenu();
}

/**
 * Verbirgt das Bearbeitungsformular für einen Kontakt.
 */
function hideEditContact() {
  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");

  if (editContactTemplate && background) {
    editContactTemplate.classList.remove("show-edit-contact");
    background.classList.add("d-none");
  }
}

/**
 * Speichert die bearbeitete Kontaktinformation und aktualisiert die Ansicht.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des zu speichernden Kontakts.
 */
async function saveEditedContact(firebaseKey) {
  const contactListContainer = document.getElementById("contact-side-panel");
  const detailViewContainer = document.getElementById("contact-big");
  const mobileDetailView = document.getElementById("mobile-contact-detail");
  if (mobileDetailView) {
    mobileDetailView.style.display = "none";
  }
  if (contactListContainer) {
    contactListContainer.style.removeProperty("display");
    contactListContainer.classList.remove("hidden");
  }
  if (detailViewContainer) {
    detailViewContainer.style.display = "none";
  }

  const nameInput = document.getElementById("edit-contact-name").value.trim();
  const emailInput = document.getElementById("edit-contact-email").value.trim();
  const phoneInput = document.getElementById("edit-contact-phone").value.trim();

  const nameParts = nameInput.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const updatedContact = {
    firstName,
    lastName,
    email: emailInput,
    phone: phoneInput,
  };

  if (!firstName || !emailInput) {
    showEditErrorMessage("Name and email are required");
    return;
  }
  if (isGuestUser()) {
    const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
    if (index !== -1) {
      contactsData[index] = { ...contactsData[index], ...updatedContact };
    }
    hideEditContact();
    renderSortedContacts(contactsData);
    toggleContactDetail(firebaseKey);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });

    if (response.ok) {
      hideEditContact();
      fetchContactsFromFirebase();
      toggleContactDetail(firebaseKey);
    }
  } catch (error) {
    console.error("Failed to update contact.");
  }
}

/**
 * Löscht einen Kontakt aus der Kontaktliste.
 * Bei Gastbenutzern wird der Kontakt lokal gelöscht, ansonsten in Firebase.
 * @param {string} firebaseKey - Der Firebase-Schlüssel des zu löschenden Kontakts.
 */
async function deleteContact(firebaseKey) {
  const contactListContainer = document.getElementById("contact-side-panel");
  const detailViewContainer = document.getElementById("contact-big");
  const mobileDetailView = document.getElementById("mobile-contact-detail");
  if (mobileDetailView) {
    mobileDetailView.style.display = "none";
  }
  if (contactListContainer) {
    contactListContainer.style.removeProperty("display");
    contactListContainer.classList.remove("hidden");
  }
  if (detailViewContainer) {
    detailViewContainer.style.display = "none";
  }
  if (isGuestUser()) {
    const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
    if (index !== -1) {
      contactsData.splice(index, 1);
    }
    showEditDeleteMessage();
    hideEditContact();
    renderSortedContacts(contactsData);
    return;
  }

  try {
    await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "DELETE",
    });
    hideEditContact();
    fetchContactsFromFirebase();
  } catch (error) {
    console.error("Failed to delete contact.");
  }
}

/**
 * Zeigt eine Fehlermeldung beim Bearbeiten eines Kontakts an.
 * @param {string} message - Die Fehlermeldung, die angezeigt werden soll.
 */
function showEditErrorMessage(message) {
  const errorContainer = document.getElementById("edit-contact-message");
  if (errorContainer) {
    errorContainer.classList.remove("d-none");
    errorContainer.innerHTML = `
      <div id="edit-contact-error-message-container">
        <span id="edit-contact-error-message">${message}</span>
      </div>
    `;
    setTimeout(() => {
      errorContainer.classList.add("d-none");
    }, 2500);
  }
}

/**
 * Zeigt eine Erfolgsmeldung nach dem Löschen eines Kontakts an.
 */
function showEditDeleteMessage() {
  const message = document.createElement("div");
  message.id = "success-message-container";
  message.innerHTML = "Kontakt erfolgreich gelöscht!";
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add("show");
  }, 10);

  setTimeout(() => {
    message.classList.remove("show");
    setTimeout(() => message.remove(), 500);
  }, 2500);
}

/**
 * Richtet die Validierung für das Bearbeitungsformular eines Kontakts ein.
 */
function setupEditValidation() {
  const nameInput = document.getElementById("edit-contact-name");
  const emailInput = document.getElementById("edit-contact-email");
  const phoneInput = document.getElementById("edit-contact-phone");
  const saveButton = document.getElementById("edit-contact-create");

  const nameError = document.getElementById("edit-name-error");
  const emailError = document.getElementById("edit-email-error");
  const phoneError = document.getElementById("edit-phone-error");

  /**
   * Validiert die Eingaben im Bearbeitungsformular.
   */
  function validateEditInputs() {
    let isValid = true;

    if (!nameInput.value.trim()) {
      nameError.textContent = "Name ist erforderlich";
      nameError.style.display = "block";
      isValid = false;
    } else {
      nameError.textContent = "";
      nameError.style.display = "none";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailError.textContent = "Email ist erforderlich";
      emailError.style.display = "block";
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = "Ungültige Email-Adresse";
      emailError.style.display = "block";
      isValid = false;
    } else {
      emailError.textContent = "";
      emailError.style.display = "none";
    }

    const phoneRegex = /^[0-9+ ]*$/;
    if (!phoneInput.value.trim()) {
      phoneError.textContent = "Telefonnummer ist erforderlich";
      phoneError.style.display = "block";
      isValid = false;
    } else if (!phoneRegex.test(phoneInput.value.trim())) {
      phoneError.textContent = "Nur Zahlen und + sind erlaubt";
      phoneError.style.display = "block";
      isValid = false;
    } else {
      phoneError.textContent = "";
      phoneError.style.display = "none";
    }

    saveButton.disabled = !isValid;
  }

  nameInput.addEventListener("input", validateEditInputs);
  emailInput.addEventListener("input", validateEditInputs);
  phoneInput.addEventListener("input", validateEditInputs);

  validateEditInputs();
}
