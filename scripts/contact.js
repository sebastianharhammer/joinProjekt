/**
 * Firebase configuration object.
 * @constant {Object}
 */
const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/",
};

/**
 * Base URL for Firebase database operations.
 * @constant {string}
 */
const BASE_URL = firebaseConfig.databaseURL;

/**
 * Initializes the Firebase app.
 * @constant {firebase.app.App}
 */
const app = firebase.initializeApp(firebaseConfig);

/**
 * Reference to the Firebase database.
 * @constant {firebase.database.Database}
 */
const database = firebase.database();

/**
 * The currently logged-in user.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * Array for storing contact data.
 * @type {Array<Object>}
 */
let contactsData = [];

/**
 * Loads the currently logged-in user from Local Storage.
 */
function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

/**
 * Checks if the current user is a guest user.
 * @returns {boolean} Returns true if the user is a guest, otherwise false.
 */
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

/**
 * Retrieves contacts from Firebase and updates the local contact list.
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
 * Ensures that a contact has a color. Adds a random color if not present.
 * @param {string} firebaseKey - The Firebase key of the contact.
 * @param {Object} contact - The contact object.
 * @returns {Promise<Object>} The updated contact object.
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
 * Adds a new contact. For guest users, the contact is added locally; otherwise, it's added to Firebase.
 */
async function addContact() {
  const firstName = prompt("First name of the new contact?");
  const lastName = prompt("Last name of the new contact?");
  const email = prompt("Email of the new contact?");
  const phone = prompt("Phone number of the new contact?");
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
 * Edits an existing contact. For guest users, the contact is updated locally; otherwise, it's updated in Firebase.
 * @param {string} firebaseKey - The Firebase key of the contact to edit.
 */
async function editContact(firebaseKey) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index === -1) return;
  const contact = contactsData[index];
  const newFirstName = prompt("New first name:", contact.firstName);
  const newLastName = prompt("New last name:", contact.lastName);
  const newEmail = prompt("New email:", contact.email);
  const newPhone = prompt("New phone number:", contact.phone);
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
 * Deletes a contact. For guest users, the contact is deleted locally; otherwise, it's deleted from Firebase.
 * @param {string} firebaseKey - The Firebase key of the contact to delete.
 */
async function deleteContact(firebaseKey) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index === -1) return;
  const sure = confirm("Are you sure you want to delete this contact?");
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
 * Renders the contact list sorted by first names and grouped by initial letters.
 * @param {Array<Object>} contacts - The array of contacts.
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
 * Creates the HTML for a single contact.
 * @param {Object} contact - The contact.
 * @returns {string} The generated HTML for the contact.
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
 * Toggles the display of contact details for the specified Firebase key.
 * @param {string} firebaseKey - The unique Firebase key of the contact.
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

  if (!selectedContact || !clickedItem) return;

  if (clickedItem.classList.contains("selected")) {
    clickedItem.classList.remove("selected");
    if (mobileDetailView) mobileDetailView.innerHTML = "";
    if (desktopDetailView) desktopDetailView.innerHTML = "";
    return;
  }

  contactItems.forEach((item) => item.classList.remove("selected"));
  clickedItem.classList.add("selected");

  if (mobileDetailView) {
    mobileDetailView.innerHTML = getMobileDetailHTML(
      selectedContact,
      firebaseKey
    );
  }
  if (desktopDetailView) {
    desktopDetailView.innerHTML = getDesktopDetailHTML(
      selectedContact,
      firebaseKey
    );
  }

  const isMobileView = window.innerWidth <= 1256;
  if (isMobileView) {
    if (mobileDetailView) mobileDetailView.style.display = "flex";
    if (desktopDetailView) desktopDetailView.style.display = "none";
  } else {
    if (desktopDetailView) desktopDetailView.style.display = "block";
    if (mobileDetailView) mobileDetailView.style.display = "none";
  }
}

/**
 * Renders the contact list again and hides the detail view.
 */
function renderContactList() {
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
}

/**
 * Toggles the dropdown menu and closes it when clicking outside.
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
   * Closes the dropdown menu if clicked outside.
   * @param {Event} event - The triggering click event.
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
 * Generates a random color from a predefined list.
 * @returns {string} A randomly selected color in HEX format.
 */
function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Retrieves the initials of a user.
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function getInitials(firstName, lastName) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Renders the right side container for contact details if not already present.
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
