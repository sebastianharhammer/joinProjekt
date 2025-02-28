/**
 * Firebase configuration object.
 * @constant {Object}
 */
const firebaseConfig = {
  databaseURL:
    "https://eigenesjoin-default-rtdb.europe-west1.firebasedatabase.app/",
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
  contactsRef.on("value", handleContactsSnapshot);
}

/**
 * Handles the snapshot data from Firebase contacts.
 * @param {firebase.database.DataSnapshot} snapshot - Firebase data snapshot
 */
async function handleContactsSnapshot(snapshot) {
  const data = snapshot.val();
  if (data) {
    const updatedContacts = await processContactsData(data);
    updateContactsList(updatedContacts);
  } else {
    updateContactsList([]);
  }
}

/**
 * Processes raw contacts data and ensures each contact has a color.
 * @param {Object} data - Raw contacts data from Firebase
 * @returns {Promise<Array>} Array of processed contacts
 */
async function processContactsData(data) {
  const entries = Object.entries(data);
  const updatedContacts = [];
  for (const [firebaseKey, contact] of entries) {
    const updatedContact = await ensureContactHasColor(firebaseKey, contact);
    updatedContacts.push({ firebaseKey, ...updatedContact });
  }
  return updatedContacts;
}

/**
 * Updates the contacts list and renders the changes.
 * @param {Array} contacts - Array of contacts to update with
 */
function updateContactsList(contacts) {
  contactsData = contacts;
  renderSortedContacts(contactsData);
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
 * Collects contact information from user prompts.
 * @returns {Object|null} Contact information or null if required fields are missing.
 */
function collectContactInfo() {
  const firstName = prompt("First name of the new contact?");
  const lastName = prompt("Last name of the new contact?");
  if (!firstName || !lastName) return null;

  const email = prompt("Email of the new contact?");
  const phone = prompt("Phone number of the new contact?");

  return { firstName, lastName, email, phone };
}