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

// Loads the current user as soon as the DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadCurrentUser);

/**
 * Displays the form to add a new contact.
 */
function addContact() {
  const addContactTemplate = document.getElementById("add-contact-content");
  const background = document.getElementById("add-contact-background");

  if (addContactTemplate && background) {
    addContactTemplate.classList.add("show-add-contact");
    background.classList.remove("d-none");
    addContactTemplate.innerHTML = getAddContactHTML();
  }
}

/**
 * Hides the form to add a new contact and loads the contact information.
 */
function hideAddContact() {
  const addContactTemplate = document.getElementById("add-contact-content");
  const background = document.getElementById("add-contact-background");

  if (addContactTemplate && background) {
    addContactTemplate.classList.remove("show-add-contact");
    background.classList.add("d-none");
    getContactInfo();
  }
}

/**
 * Processes the information of a new contact and saves it.
 */
async function processContactInfo() {
  const { firstName, lastName } = extractNameParts();
  const email = document.getElementById("add-contact-email").value.trim();
  const phone = document.getElementById("add-contact-phone").value.trim();

  await pushContactInfo(firstName, lastName, email, phone);
  hideAddContact();
  setTimeout(() => showSuccessMessage(), 300);
}

/**
 * Displays a success message after a contact has been successfully created.
 */
function showSuccessMessage() {
  const message = document.createElement("div");
  message.id = "success-message-container";
  message.innerHTML = "Contact successfully created!";
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add("show");
  }, 10);

  setTimeout(() => {
    message.classList.remove("show");
    setTimeout(() => message.remove(), 500);
  }, 2500);
}

/**
 * Clears the input fields in the contact form.
 */
function clearAddContactInput() {
  const nameInput = document.getElementById("add-contact-name");
  const emailInput = document.getElementById("add-contact-email");
  const phoneInput = document.getElementById("add-contact-phone");

  if (nameInput && emailInput && phoneInput) {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
  }
}

/**
 * Extracts the first and last names from the input field.
 * @returns {Object} An object containing firstName and lastName fields.
 */
function extractNameParts() {
  const input = document.getElementById("add-contact-name").value.trim();
  const nameParts = input.split(" ");
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
  };
}

/**
 * Fetches contact information from the server API and stores it locally.
 */
async function getContactInfo() {
  try {
    const response = await fetch(`${BASE_URL}/contacts/.json`);
    localContacts = (await response.json()) || {};
  } catch {
    console.error("Failed to fetch contacts.");
  }
}

/**
 * Adds a new contact to the database.
 * @param {string} firstName - The first name of the contact.
 * @param {string} lastName - The last name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 */
async function pushContactInfo(firstName, lastName, email, phone) {
  const newContact = {
    firstName,
    lastName,
    email,
    phone,
    color: getRandomColor(),
  };

  if (isGuestUser()) {
    const pseudoKey = `guest-${Date.now()}`;
    if (contactsData) {
      contactsData.push({ firebaseKey: pseudoKey, ...newContact });
      if (typeof renderSortedContacts === "function")
        renderSortedContacts(contactsData);
      if (typeof renderRightSideContainer === "function")
        renderRightSideContainer();
    }
    return;
  }

  try {
    await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    if (typeof fetchContactsFromFirebase === "function")
      fetchContactsFromFirebase();
  } catch {
    console.error("Failed to add contact.");
  }
}

/**
 * Generates a random color from a predefined list.
 * @returns {string} A randomly selected color in HEX format.
 */
function getRandomColor() {
  const colors = [
    "#FF5733",
    "#33A1FF",
    "#33FF99",
    "#FF33A8",
    "#FFC300",
    "#8C33FF",
    "#FF6F61",
    "#33FFC6",
    "#FF9F1C",
    "#5CDB95",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Handles the creation of a new contact by validating and processing the inputs.
 */
function handleContactCreation() {
  const isValid = validateInputs();
  if (isValid) {
    processContactInfo();
  }
}

/**
 * Validates the input fields of the contact form.
 * @returns {boolean} Returns true if all inputs are valid, otherwise false.
 */
function validateInputs() {
  const nameInput = document.getElementById("add-contact-name");
  const emailInput = document.getElementById("add-contact-email");
  const phoneInput = document.getElementById("add-contact-phone");
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const phoneError = document.getElementById("phone-error");

  let isValid = true;

  if (!nameInput.value.trim()) {
    nameError.style.display = "block";
    isValid = false;
  } else {
    nameError.style.display = "none";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
    emailError.style.display = "block";
    isValid = false;
  } else {
    emailError.style.display = "none";
  }

  const phoneRegex = /^[0-9+ ]*$/;
  if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value)) {
    phoneError.style.display = "block";
    isValid = false;
  } else {
    phoneError.style.display = "none";
  }

  return isValid;
}
