/**
 * Loads the currently logged-in user from Local Storage.
 */
function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) currentUser = JSON.parse(storedUser);
}

/**
 * Checks if the current user is a guest.
 * @returns {boolean} True if the user is a guest, otherwise false.
 */
function isGuestUser() {
  return (
    currentUser &&
    currentUser.firstName === "Guest" &&
    currentUser.lastName === "User"
  );
}

/**
 * Sets up form validation for the contact editing form.
 * Attaches event listeners and validates input fields.
 */
function setupEditValidation() {
  const nameInput = document.getElementById("edit-contact-name");
  const emailInput = document.getElementById("edit-contact-email");
  const phoneInput = document.getElementById("edit-contact-phone");
  const saveButton = document.getElementById("edit-contact-create");
  const nameError = document.getElementById("edit-name-error");
  const emailError = document.getElementById("edit-email-error");
  const phoneError = document.getElementById("edit-phone-error");
  if (!nameInput || !emailInput || !phoneInput || !saveButton) return;
  nameInput.addEventListener("input", () => validateEditInputs(nameInput, emailInput, phoneInput, saveButton));
  emailInput.addEventListener("input", () => validateEditInputs(nameInput, emailInput, phoneInput, saveButton));
  phoneInput.addEventListener("input", () => validateEditInputs(nameInput, emailInput, phoneInput, saveButton));
  validateEditInputs(nameInput, emailInput, phoneInput, saveButton);
}

/**
 * Validates the name input field.
 * @param {HTMLInputElement} nameInput The name input element.
 * @param {HTMLElement} nameError The error message element for name.
 * @returns {boolean} True if name is valid, false otherwise.
 */
function validateName(nameInput, nameError) {
  if (!nameInput.value.trim()) {
    nameError.textContent = "Name is required.";
    nameError.style.display = "block";
    return false;
  }
  nameError.textContent = "";
  nameError.style.display = "none";
  return true;
}

/**
 * Validates the email input field.
 * @param {HTMLInputElement} emailInput The email input element.
 * @param {HTMLElement} emailError The error message element for email.
 * @returns {boolean} True if email is valid, false otherwise.
 */
function validateEmail(emailInput, emailError) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim()) {
    emailError.textContent = "Email is required.";
    emailError.style.display = "block";
    return false;
  }
  if (!emailRegex.test(emailInput.value.trim())) {
    emailError.textContent = "Invalid Email Address.";
    emailError.style.display = "block";
    return false;
  }
  emailError.textContent = "";
  emailError.style.display = "none";
  return true;
}

/**
 * Validates the phone input field.
 * @param {HTMLInputElement} phoneInput The phone input element.
 * @param {HTMLElement} phoneError The error message element for phone.
 * @returns {boolean} True if phone number is valid, false otherwise.
 */
function validatePhone(phoneInput, phoneError) {
  const phoneRegex = /^[0-9+ ]*$/;
  if (!phoneInput.value.trim()) {
    phoneError.textContent = "Phone number is required.";
    phoneError.style.display = "block";
    return false;
  }
  if (!phoneRegex.test(phoneInput.value.trim())) {
    phoneError.textContent = "Only numbers and + are allowed.";
    phoneError.style.display = "block";
    return false;
  }
  phoneError.textContent = "";
  phoneError.style.display = "none";
  return true;
}

/**
 * Validates all input fields and enables/disables the save button accordingly.
 * @param {HTMLInputElement} nameInput The name input element.
 * @param {HTMLInputElement} emailInput The email input element.
 * @param {HTMLInputElement} phoneInput The phone input element.
 * @param {HTMLButtonElement} saveButton The save button element.
 */
function validateEditInputs(nameInput, emailInput, phoneInput, saveButton) {
  const nameError = document.getElementById("edit-name-error");
  const emailError = document.getElementById("edit-email-error");
  const phoneError = document.getElementById("edit-phone-error");

  const isValid = validateName(nameInput, nameError) && validateEmail(emailInput, emailError) && validatePhone(phoneInput, phoneError);
  saveButton.disabled = !isValid;
}


/**
 * Opens the contact editing overlay for a specific contact.
 * @param {string} firebaseKey - The Firebase key of the contact.
 */
function editContact(firebaseKey) {
  const contact = contactsData.find((c) => c.firebaseKey === firebaseKey);
  if (!contact) return;

  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");

  if (editContactTemplate && background) {
    editContactTemplate.classList.add("show-edit-contact");
    background.classList.remove("d-none");
    editContactTemplate.innerHTML = getEditContactHTML(contact);
    setupEditValidation();
    toggleMenu();
  }
}

/**
 * Hides the contact editing overlay.
 */
function hideEditContact() {
  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");

  if (editContactTemplate && background) {
    editContactTemplate.classList.remove("show-edit-contact");
    background.classList.add("d-none");
  }
}

/**
 * Saves the edited contact information.
 * @param {string} firebaseKey - The Firebase key of the contact.
 */
async function saveEditedContact(firebaseKey) {
  const updatedContact = getUpdatedContactData();
  if (!updatedContact) return;

  if (isGuestUser()) {
    updateLocalContact(firebaseKey, updatedContact);
  } else {
    const success = await updateFirebaseContact(firebaseKey, updatedContact);
    if (!success) return;
  }

  refreshContactView(firebaseKey);
}

/**
 * Collects updated contact data from the editing form.
 * @returns {Object|null} The updated contact data or null if invalid.
 */
function getUpdatedContactData() {
  const nameInput = document.getElementById("edit-contact-name").value.trim();
  const emailInput = document.getElementById("edit-contact-email").value.trim();
  const phoneInput = document.getElementById("edit-contact-phone").value.trim();
  if (!nameInput || !emailInput) {
    showEditErrorMessage("Name and email are required.");
    return null;
  }
  const [firstName, ...rest] = nameInput.split(" ");
  const lastName = rest.join(" ");
  return { firstName, lastName, email: emailInput, phone: phoneInput };
}

/**
 * Updates a contact locally.
 * @param {string} firebaseKey - The Firebase key of the contact.
 * @param {Object} updatedContact - The updated contact data.
 */
function updateLocalContact(firebaseKey, updatedContact) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index !== -1)
    contactsData[index] = { ...contactsData[index], ...updatedContact };
}
/**
 * Updates a contact in Firebase.
 * @param {string} firebaseKey - The Firebase key of the contact.
 * @param {Object} updatedContact - The updated contact data.
 * @returns {Promise<boolean>} Success or failure.
 */
async function updateFirebaseContact(firebaseKey, updatedContact) {
  const success = await tryUpdateFirebaseContact(firebaseKey, updatedContact);
  if (success) {
    const index = contactsData.findIndex(
      (c) => c.firebaseKey === firebaseKey
    );
    if (index !== -1)
      contactsData[index] = { ...contactsData[index], ...updatedContact };
    return true;
  }
  return false;
}

/**
 * Attempts to update a contact in Firebase.
 * @param {string} firebaseKey - The Firebase key of the contact.
 * @param {Object} updatedContact - The updated contact data.
 * @returns {Promise<boolean>} Success or failure.
 */
async function tryUpdateFirebaseContact(firebaseKey, updatedContact) {
  try {
    const response = await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Refreshes the contact view after editing.
 * @param {string} firebaseKey - The Firebase key of the contact.
 */
function refreshContactView(firebaseKey) {
  hideEditContact();
  renderSortedContacts(contactsData);
  toggleContactDetail(firebaseKey);
}

/**
 * Deletes a contact.
 * @param {string} firebaseKey - The Firebase key of the contact.
 */
async function deleteContact(firebaseKey) {
  clearDesktopDetailView();
  clearMobileDetailView();
  clearContactSelection();

  if (isGuestUser()) {
    deleteLocalContact(firebaseKey);
    renderSortedContacts(contactsData);
    attachContactEventListeners();
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "DELETE",
    });
    if (response.ok) fetchContactsFromFirebase();
  } catch {}
}

/**
 * Clears the mobile detail view.
 */
function clearMobileDetailView() {
  const mobileDetailView = document.getElementById("mobile-contact-detail");
  if (mobileDetailView) {
    mobileDetailView.innerHTML = "";
    mobileDetailView.style.display = "none";
  }
}

/**
 * Deletes a contact locally.
 * @param {string} firebaseKey - The Firebase key of the contact.
 */
function deleteLocalContact(firebaseKey) {
  const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
  if (index !== -1) contactsData.splice(index, 1);
}

/**
 * Clears the desktop detail view.
 */
function clearDesktopDetailView() {
  const desktopDetailView = document.getElementById("desktop-contact-detail");
  if (desktopDetailView) {
    desktopDetailView.innerHTML = "";
    desktopDetailView.style.display = "none";
  }
}

/**
 * Removes selection from all contacts.
 */
function clearContactSelection() {
  const contactItems = document.querySelectorAll(".contact-item.selected");
  contactItems.forEach((item) => item.classList.remove("selected"));
}

/**
 * Attaches event listeners to contact items.
 */
function attachContactEventListeners() {
  const contactItems = document.querySelectorAll(".contact-item");
  contactItems.forEach((item) => {
    const firebaseKey = item.getAttribute("data-key");
    item.addEventListener("click", () => toggleContactDetail(firebaseKey));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
  renderSortedContacts(contactsData);
  attachContactEventListeners();
});
