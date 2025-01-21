/**
 * Creates a contact object with the provided information.
 * @param {Object} contactInfo - Basic contact information
 * @returns {Object} Complete contact object with color
 */
function createContactObject(contactInfo) {
  return {
    firstName: contactInfo.firstName,
    lastName: contactInfo.lastName,
    email: contactInfo.email || "",
    phone: contactInfo.phone || "",
    color: getRandomColor(),
  };
}

/**
 * Adds contact for guest user locally.
 * @param {Object} newContact - The contact object to add
 */
function addGuestContact(newContact) {
  const pseudoKey = `guest-${Date.now()}`;
  contactsData.push({ firebaseKey: pseudoKey, ...newContact });
  renderSortedContacts(contactsData);
}

/**
 * Adds contact to Firebase database.
 * @param {Object} newContact - The contact object to add
 */
async function addFirebaseContact(newContact) {
  await fetch(`${BASE_URL}/contacts.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newContact),
  });
}

/**
 * Adds a new contact. For guest users, the contact is added locally; otherwise, it's added to Firebase.
 */
async function addContact() {
  const contactInfo = collectContactInfo();
  if (!contactInfo) return;
  const newContact = createContactObject(contactInfo);
  if (isGuestUser()) {
    addGuestContact(newContact);
  } else {
    await addFirebaseContact(newContact);
  }
}

/**
 * Gets updated contact information via prompts.
 * @param {Object} currentContact - The current contact data
 * @returns {Object|null} Updated contact info or null if cancelled
 */
function getUpdatedContactInfo(currentContact) {
  const newFirstName = prompt("New first name:", currentContact.firstName);
  const newLastName = prompt("New last name:", currentContact.lastName);
  if (!newFirstName || !newLastName) return null;
  return {
    firstName: newFirstName,
    lastName: newLastName,
    email: prompt("New email:", currentContact.email) || "",
    phone: prompt("New phone number:", currentContact.phone) || "",
  };
}

/**
 * Creates an updated contact object with all properties.
 * @param {Object} contact - Original contact
 * @param {Object} updates - Updated fields
 * @returns {Object} Complete updated contact
 */
function createUpdatedContact(contact, updates) {
  return {
    ...contact,
    ...updates,
  };
}

/**
 * Updates contact in Firebase database.
 * @param {string} firebaseKey - Contact's Firebase key
 * @param {Object} updatedContact - Updated contact data
 */
async function updateFirebaseContact(firebaseKey, updatedContact) {
  await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedContact),
  });
}

/**
 * Updates contact locally in contactsData array.
 * @param {number} index - Index in contactsData
 * @param {Object} updatedContact - Updated contact data
 */
function updateLocalContact(index, updatedContact) {
  contactsData[index] = updatedContact;
  renderSortedContacts(contactsData);
}

/**
 * Edits an existing contact. For guest users, the contact is updated locally; otherwise, it's updated in Firebase.
 * @param {string} firebaseKey - The Firebase key of the contact to edit.
 */
async function editContact(firebaseKey) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index === -1) return;
  const contact = contactsData[index];
  const updates = getUpdatedContactInfo(contact);
  if (!updates) return;
  const updatedContact = createUpdatedContact(contact, updates);
  if (isGuestUser()) {
    updateLocalContact(index, updatedContact);
  } else {
    await updateFirebaseContact(firebaseKey, updatedContact);
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
 * Sorts contacts alphabetically by first name.
 * @param {Array<Object>} contacts - Array of contact objects
 * @returns {Array<Object>} Sorted array of contacts
 */
function sortContacts(contacts) {
  return contacts.sort((a, b) => a.firstName.localeCompare(b.firstName));
}

/**
 * Groups contacts by the first letter of their first name.
 * @param {Array<Object>} contacts - Array of contact objects
 * @returns {Object} An object with letters as keys and arrays of contacts as values
 */
function groupContactsByLetter(contacts) {
  return contacts.reduce((groups, contact) => {
    const firstLetter = contact.firstName[0].toUpperCase();
    if (!groups[firstLetter]) groups[firstLetter] = [];
    groups[firstLetter].push(contact);
    return groups;
  }, {});
}

/**
 * Renders the sorted and grouped contacts to the DOM.
 * @param {Array<Object>} contacts - Array of contact objects to render
 * @returns {void}
 */
function renderSortedContacts(contacts) {
  const content = document.getElementById("contact-content");
  content.innerHTML = "";
  const sortedContacts = sortContacts(contacts);
  const groupedContacts = groupContactsByLetter(sortedContacts);
  let contactsHTML = `<div id="contact-side-panel">`;
  contactsHTML += addContactButtonTemplate();
  for (const letter in groupedContacts) {
    const contactsForLetter = groupedContacts[letter]
      .map((contact) => contactsTemplate(contact))
      .join("");
    contactsHTML += letterSectionTemplate(letter, contactsForLetter);
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
