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

    if (data) {
      contactsData = Object.values(data);
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

function toggleContactDetail(contactId) {
  const contactItems = document.querySelectorAll(".contact-item");
  const detailViewContainer = document.getElementById("contact-big");
  const selectedContact = contactsData.find(
    (contact) => contact.id === contactId
  );
  const clickedItem = document.getElementById(`contact-item-${contactId}`);

  if (clickedItem.classList.contains("selected")) {
    clickedItem.classList.remove("selected");
    detailViewContainer.innerHTML = `
      <div id="contact-headline-container">
        <h3 id="contact-headline">Contacts</h3>
        <h2 id="bwat-headline">Better with a team</h2>
      </div>
    `;
  } else {
    contactItems.forEach((item) => item.classList.remove("selected"));
    clickedItem.classList.add("selected");

    detailViewContainer.innerHTML = /*html*/ `
      <div id="contact-headline-container">
        <h3 id="contact-headline">Contacts</h3>
        <h2 id="bwat-headline">Better with a team</h2>
      </div>
      <div class="contact-detail">
      <div class="contact-detail-header">
          <div class="contact-avatar" style="background-color: ${getRandomColor()};">
              ${getInitials(
                selectedContact.firstName,
                selectedContact.lastName
              )}
          </div>
          <div class="contact-detail-header-right">
            <div class="contact-detail-header-right-headline">
            ${selectedContact.firstName} ${selectedContact.lastName}</div>
            <div class="detail-actions">
              <button onclick="editContact(${contactId})"><img id="edit-contact-img" src="./img/edit.svg">Edit</button>
              <button onclick="deleteContact(${contactId})"><img id="delete-contact-img" src="./img/delete.svg">Delete</button>
            </div>
          </div>
      </div>

          <div>
          <div>
          <p><strong>Email:</strong> <a href="mailto:${
            selectedContact.email
          }">${selectedContact.email}</a></p>
          </div>
          <div>
          <p><strong>Phone:</strong> ${selectedContact.phone}</p>
          </div>
          </div>
      </div>
    `;
  }
}

function editContact(contactId) {
  alert(`Edit contact with ID: ${contactId}`);
}

function deleteContact(contactId) {
  alert(`Delete contact with ID: ${contactId}`);
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
