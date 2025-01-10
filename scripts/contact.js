const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};
const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app";
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentUser = null;
let contactsData = [];

function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

function isGuestUser() {
  return (
    currentUser &&
    currentUser.firstName === "Guest" &&
    currentUser.lastName === "User"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  includeHTML();
  loadCurrentUser();
  fetchContactsFromFirebase();
});

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

function toggleContactDetail(firebaseKey) {
  const contactItems = document.querySelectorAll(".contact-item");
  const detailViewContainer = document.getElementById("contact-big");
  const contactListContainer = document.getElementById("contact-side-panel");
  const selectedContact = contactsData.find(
    (c) => c.firebaseKey === firebaseKey
  );
  const clickedItem = document.getElementById(`contact-item-${firebaseKey}`);
  if (!selectedContact) return;
  if (!detailViewContainer) return;

  const isMobile = window.matchMedia("(max-width: 1300px)").matches;
  if (isMobile) {
    contactListContainer.style.display = "none";
    detailViewContainer.style.display = "flex";
    detailViewContainer.innerHTML = getMobileDetailHTML(
      selectedContact,
      firebaseKey
    );
  } else {
    if (clickedItem && clickedItem.classList.contains("selected")) {
      clickedItem.classList.remove("selected");
      detailViewContainer.innerHTML = "";
      return;
    }
    contactItems.forEach((item) => item.classList.remove("selected"));
    if (clickedItem) clickedItem.classList.add("selected");
    detailViewContainer.innerHTML = getDesktopDetailHTML(
      selectedContact,
      firebaseKey
    );
  }
}

function renderContactList() {
  const contactListContainer = document.getElementById("contact-side-panel");
  const detailViewContainer = document.getElementById("contact-big");
  if (contactListContainer) {
    contactListContainer.style.removeProperty("display");
    contactListContainer.classList.remove("hidden");
  }
  if (detailViewContainer) detailViewContainer.style.display = "none";
}

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

function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getInitials(firstName, lastName) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

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
