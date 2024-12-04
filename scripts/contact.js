import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

import { ref, onValue } from "firebase/database";

function fetchContactsFromFirebase() {
  const contactsRef = ref(database, "contacts"); // Realtime-Datenbank-Pfad

  onValue(contactsRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const contacts = Object.values(data); // Konvertiere die Firebase-Daten in ein Array
      renderSortedContacts(contacts); // Kontakte in der Liste darstellen
    } else {
      console.log("Keine Kontakte gefunden.");
    }
  });
}

function renderContactContent() {
  includeHTML();
  renderContactContentHTML();
}

function renderContactContentHTML() {
  const content = document.getElementById("contact-content");

  content.innerHTML = "";

  let contactsHTML = /*html*/ `
      <div id="contact-side-panel">
        <div id="add-new-contact-button-container">
            <button onclick="addContact()" id="add-contact-btn">
                Add new contact<img id="add-contact-img" src="./img/person_add.png">
            </button>
        </div>
        <ul id="contact-list-names">
    `;

  contacts.forEach((contact) => {
    contactsHTML += contactsTemplate(contact);
  });

  contactsHTML += `
          </ul>
      </div>
    `;

  content.innerHTML = contactsHTML;

  content.innerHTML += `
      <div id="contact-big">
          <div id="contact-headline-container">
              <h3 id="contact-headline">Contacts</h3>
              <h2 id="bwat-headline">Better with a team</h2>
          </div>
      </div>
    `;
}

function getInitials(forename, surname) {
  return `${forename.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

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

  // HTML-Struktur für die Kontaktliste erstellen
  let contactsHTML = `<div id="contact-side-panel">`;

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
