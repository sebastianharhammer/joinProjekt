const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};

const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app";

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let contactsData = [];

async function ensureContactHasColor(firebaseKey, contact) {
  if (!contact.color) {
    const updatedContact = {
      ...contact,
      color: getRandomColor(),
    };

    await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContact),
    });

    return updatedContact;
  }

  return contact;
}

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
      renderRightSideContainer();
    } else {
      console.log("Keine Kontakte gefunden.");
      contactsData = [];
      renderSortedContacts(contactsData);
      renderRightSideContainer();
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

function toggleContactDetail(firebaseKey) {
  const contactItems = document.querySelectorAll(".contact-item");
  const detailViewContainer = document.getElementById("contact-big");
  const contactListContainer = document.getElementById("contact-side-panel");
  const selectedContact = contactsData.find(
    (contact) => contact.firebaseKey === firebaseKey
  );
  const clickedItem = document.getElementById(`contact-item-${firebaseKey}`);

  if (!selectedContact) {
    console.error(`Contact with firebaseKey ${firebaseKey} not found.`);
    return;
  }

  // Überprüfen, ob die Ansicht mobil ist
  const isMobile = window.matchMedia("(max-width: 1300px)").matches;

  if (isMobile) {
    // Mobile Ansicht
    contactListContainer.style.display = "none"; // Kontaktliste ausblenden
    detailViewContainer.style.display = "flex"; // Detailansicht anzeigen
    detailViewContainer.innerHTML = /*html*/ `
      <div id="contact-headline-container">
          <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
      </div>
      <button id="back-button" class="back-button" onclick="renderContactList()"><img src="./img/arrow-left.png" alt="arrow left"></button>
      <div class="contact-detail">
          <div class="contact-detail-header">
              <div class="contact-avatar" style="background-color: ${
                selectedContact.color || getRandomColor()
              };">
                  ${getInitials(
                    selectedContact.firstName,
                    selectedContact.lastName
                  )}
              </div>
              <div class="contact-detail-header-right">
                  <div class="contact-detail-header-right-headline">
                      ${selectedContact.firstName} ${selectedContact.lastName}
                  </div>
              </div>
          </div>
          <div id="contact-information">Contact Information</div>
          <div id="contact-detail-bottom">
              <div id="contact-detail-email">
                  <strong>Email:</strong> 
                  <a href="mailto:${selectedContact.email}">
                      ${selectedContact.email}
                  </a>
              </div>
              <div id="contact-detail-phone">
                  <strong>Phone:</strong> ${selectedContact.phone}
              </div>
          </div>
          <button id="menu-button" class="menu-button" onclick="toggleMenu()">⋮</button>
          <div id="dropdown-menu" class="dropdown-menu hidden">
              <button onclick="editContact('${firebaseKey}')">
                  <img id="edit-contact-img" src="./img/edit.svg" alt="Edit"> Edit
              </button>
              <button onclick="deleteContact('${firebaseKey}')">
                  <img id="delete-contact-img" src="./img/delete.svg" alt="Delete"> Delete
              </button>
          </div>
      </div>
    `;
  } else {
    // Desktop Ansicht (bestehendes Verhalten bleibt)
    if (clickedItem && clickedItem.classList.contains("selected")) {
      clickedItem.classList.remove("selected");
      renderRightSideContainer();
    } else {
      contactItems.forEach((item) => item.classList.remove("selected"));
      if (clickedItem) clickedItem.classList.add("selected");

      detailViewContainer.innerHTML = `
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
        <div class="contact-detail">
            <div class="contact-detail-header">
                <div class="contact-avatar" style="background-color: ${
                  selectedContact.color || getRandomColor()
                };">
                    ${getInitials(
                      selectedContact.firstName,
                      selectedContact.lastName
                    )}
                </div>
                <div class="contact-detail-header-right">
                    <div class="contact-detail-header-right-headline">
                        ${selectedContact.firstName} ${selectedContact.lastName}
                    </div>
                    <div class="detail-actions">
                        <button onclick="editContact('${firebaseKey}')"><img id="edit-contact-img" src="./img/edit.svg">Edit</button>
                        <button onclick="deleteContact('${firebaseKey}')"><img id="delete-contact-img" src="./img/delete.svg">Delete</button>
                    </div>
                </div>
            </div>
            <div id="contact-information">Contact Information</div>
            <div id="contact-detail-bottom">
                <div id="contact-detail-email">
                    <strong>Email:</strong> 
                    <a href="mailto:${selectedContact.email}">
                        ${selectedContact.email}
                    </a>
                </div>
                <div id="contact-detail-phone">
                    <strong>Phone:</strong> ${selectedContact.phone}
                </div>
            </div>
        </div>
      `;
    }
  }
}

function renderContactList() {
  const contactListContainer = document.getElementById("contact-side-panel");
  const detailViewContainer = document.getElementById("contact-big");

  // Entferne den Inline-Stil für Display
  contactListContainer.style.removeProperty("display");

  // Setze die Klasse zurück
  contactListContainer.classList.remove("hidden");

  // Detailansicht ausblenden
  detailViewContainer.style.display = "none";
}

function toggleMenu() {
  const menu = document.getElementById("dropdown-menu");
  if (menu) {
    menu.classList.toggle("hidden");
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

  content.innerHTML += `
    <div id="contact-big">
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  includeHTML();
  fetchContactsFromFirebase();
});
