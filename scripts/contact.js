const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let contactsData = [];

function fetchContactsFromFirebase() {
  const contactsRef = database.ref("contacts");

  contactsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("Daten aus Firebase:", data);

    if (data) {
      contactsData = Object.values(data);
      console.log("Konvertiertes Array:", contactsData);
      renderSortedContacts(contactsData);
      renderRightSideContainer();
    } else {
      console.log("Keine Kontakte gefunden.");
    }
  });
}

function renderSortedContacts(contacts) {
  const content = document.getElementById("contact-content");
  content.innerHTML = "";

  const sortedContacts = contacts.sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  const groupedContacts = sortedContacts.reduce((groups, contact) => {
    const firstLetter = contact.lastName[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
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

  content.innerHTML += `
    <div id="contact-big">
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
    </div>
  `;
}

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

document.addEventListener("DOMContentLoaded", () => {
  includeHTML();
  fetchContactsFromFirebase();
});
