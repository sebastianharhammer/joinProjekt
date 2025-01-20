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

function sortContacts(contacts) {
  return contacts.sort((a, b) => a.firstName.localeCompare(b.firstName));
}

function groupContactsByLetter(contacts) {
  return contacts.reduce((groups, contact) => {
    const firstLetter = contact.firstName[0].toUpperCase();
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(contact);
    return groups;
  }, {});
}

function renderSortedContacts(contacts) {
  const content = document.getElementById("contact-content");
  content.innerHTML = "";

  const sortedContacts = sortContacts(contacts);
  const groupedContacts = groupContactsByLetter(sortedContacts);

  let contactsHTML = `<div id="contact-side-panel">`;
  contactsHTML += addContactButtonTemplate(); // Button aus contact-template.js

  for (const letter in groupedContacts) {
    const contactsForLetter = groupedContacts[letter]
      .map((contact) => contactsTemplate(contact)) // Template für jeden Kontakt
      .join("");
    contactsHTML += letterSectionTemplate(letter, contactsForLetter); // Template für Buchstabensektion
  }

  contactsHTML += `</div>`;
  content.innerHTML = contactsHTML;

  renderRightSideContainer();
}

/**
 * Toggles the display of contact details for the specified Firebase key.
 * @param {string} firebaseKey - The unique Firebase key of the contact.
 */
function toggleContactDetail(firebaseKey) {
  const contactItems = document.querySelectorAll(".contact-item");
  const detailViews = getDetailViews();

  const selectedContact = findContactByFirebaseKey(firebaseKey);
  const clickedItem = document.getElementById(`contact-item-${firebaseKey}`);

  if (!selectedContact || !clickedItem) return;

  if (isSelected(clickedItem)) {
    deselectContact(clickedItem, detailViews);
  } else {
    selectContact(clickedItem, contactItems);
    updateDetailViews(selectedContact, firebaseKey, detailViews);
    toggleViewMode(detailViews);
  }
}

/**
 * Gets the detail views for mobile and desktop.
 * @returns {Object} An object containing mobile and desktop detail view elements.
 */
function getDetailViews() {
  return {
    mobile: document.getElementById("mobile-contact-detail"),
    desktop: document.getElementById("desktop-contact-detail"),
  };
}

/**
 * Finds a contact by its Firebase key.
 * @param {string} firebaseKey - The unique Firebase key of the contact.
 * @returns {Object|null} The contact object or null if not found.
 */
function findContactByFirebaseKey(firebaseKey) {
  return contactsData.find((c) => c.firebaseKey === firebaseKey) || null;
}

/**
 * Checks if a contact item is already selected.
 * @param {HTMLElement} clickedItem - The contact item to check.
 * @returns {boolean} True if the contact is selected, otherwise false.
 */
function isSelected(clickedItem) {
  return clickedItem.classList.contains("selected");
}

/**
 * Deselects the currently selected contact and clears the detail views.
 * @param {HTMLElement} clickedItem - The currently selected contact item.
 * @param {Object} detailViews - The mobile and desktop detail views.
 */
function deselectContact(clickedItem, detailViews) {
  clickedItem.classList.remove("selected");
  clearDetailViews(detailViews);
}

/**
 * Selects the given contact item and removes the selection from all others.
 * @param {HTMLElement} clickedItem - The contact item to select.
 * @param {NodeList} contactItems - A list of all contact items.
 */
function selectContact(clickedItem, contactItems) {
  contactItems.forEach((item) => item.classList.remove("selected"));
  clickedItem.classList.add("selected");
}

/**
 * Updates the mobile and desktop detail views with the selected contact's details.
 * @param {Object} selectedContact - The selected contact data.
 * @param {string} firebaseKey - The Firebase key of the selected contact.
 * @param {Object} detailViews - The mobile and desktop detail views.
 */
function updateDetailViews(selectedContact, firebaseKey, detailViews) {
  if (detailViews.mobile) {
    detailViews.mobile.innerHTML = getMobileDetailHTML(
      selectedContact,
      firebaseKey
    );
  }
  if (detailViews.desktop) {
    detailViews.desktop.innerHTML = getDesktopDetailHTML(
      selectedContact,
      firebaseKey
    );
  }
}

/**
 * Toggles the visibility of mobile and desktop views based on the screen size.
 * @param {Object} detailViews - The mobile and desktop detail views.
 */
function toggleViewMode(detailViews) {
  const isMobileView = window.innerWidth <= 1256;
  if (detailViews.mobile) {
    detailViews.mobile.style.display = isMobileView ? "flex" : "none";
  }
  if (detailViews.desktop) {
    detailViews.desktop.style.display = isMobileView ? "none" : "block";
  }
}

/**
 * Clears the content and hides both mobile and desktop detail views.
 * @param {Object} detailViews - The mobile and desktop detail views.
 */
function clearDetailViews(detailViews) {
  Object.values(detailViews).forEach((view) => {
    if (view) {
      view.innerHTML = "";
      view.style.display = "none";
    }
  });
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
    content.innerHTML += getRightSideContainerHTML();
  }
}
