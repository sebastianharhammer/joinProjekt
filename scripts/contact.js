import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

let contactsData = []; // Globale Variable für Kontakte

// Firebase-Konfiguration
const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Kontakte aus Firebase abrufen
function fetchContactsFromFirebase() {
  const contactsRef = ref(database, "contacts");

  onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      contactsData = Object.values(data); // Konvertiere die Firebase-Daten in ein Array
      renderSortedContacts(contactsData); // Kontakte anzeigen
    } else {
      console.log("Keine Kontakte gefunden.");
    }
  });
}

// Kontakte alphabetisch sortieren und rendern
function renderSortedContacts(contacts) {
  const content = document.getElementById("contact-content");
  content.innerHTML = "";

  // Kontakte nach Nachnamen sortieren
  const sortedContacts = contacts.sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  // Kontakte nach Anfangsbuchstaben gruppieren
  const groupedContacts = sortedContacts.reduce((groups, contact) => {
    const firstLetter = contact.lastName[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(contact);
    return groups;
  }, {});

  // HTML-Struktur erstellen
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
}

// Detailansicht anzeigen
function showContactDetails(contactId) {
  const selectedContact = contactsData.find(
    (contact) => contact.id === contactId
  );

  if (selectedContact) {
    const detailView = document.getElementById("contact-detail");
    detailView.innerHTML = `
      <div class="contact-detail">
          <h2>${selectedContact.firstName} ${selectedContact.lastName}</h2>
          <p><strong>E-Mail:</strong> <a href="mailto:${selectedContact.email}">${selectedContact.email}</a></p>
          <p><strong>Telefon:</strong> ${selectedContact.phone}</p>
      </div>
    `;
  }
}

// Initialen und zufällige Farbe generieren
function getInitials(firstName, lastName) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Seite laden und Kontakte abrufen
document.addEventListener("DOMContentLoaded", () => {
  fetchContactsFromFirebase();
});
