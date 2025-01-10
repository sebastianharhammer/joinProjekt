function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

function isGuestUser() {
  return (
    currentUser &&
    currentUser.firstName === "Guest" &&
    currentUser.lastName === "User"
  );
}

document.addEventListener("DOMContentLoaded", loadCurrentUser);

function addContact() {
  const addContactTemplate = document.getElementById("add-contact-content");
  const background = document.getElementById("add-contact-background");

  if (addContactTemplate && background) {
    addContactTemplate.classList.add("show-add-contact");
    background.classList.remove("d-none");
    addContactTemplate.innerHTML = getAddContactHTML();
  }
}

function hideAddContact() {
  const addContactTemplate = document.getElementById("add-contact-content");
  const background = document.getElementById("add-contact-background");

  if (addContactTemplate && background) {
    addContactTemplate.classList.remove("show-add-contact");
    background.classList.add("d-none");
    getContactInfo();
  }
}

async function processContactInfo() {
  const { firstName, lastName } = extractNameParts();
  const email = document.getElementById("add-contact-email").value.trim();
  const phone = document.getElementById("add-contact-phone").value.trim();

  if (firstName && lastName && email) {
    showSuccessMessage();
    await pushContactInfo(firstName, lastName, email, phone);
    hideAddContact();
  } else {
    showErrorMessage();
  }
}

function showSuccessMessage() {
  const content = document.getElementById("add-contact-message");
  if (content) {
    content.classList.remove("d-none");
    showSuccessMessageHTML();
    setTimeout(() => content.classList.add("d-none"), 2500);
  }
}

function showErrorMessage() {
  const content = document.getElementById("add-contact-message");
  if (content) {
    content.classList.remove("d-none");
    showErrorMessageHTML();
    setTimeout(() => content.classList.add("d-none"), 2500);
  }
}

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

function extractNameParts() {
  const input = document.getElementById("add-contact-name").value.trim();
  const nameParts = input.split(" ");
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
  };
}

async function getContactInfo() {
  try {
    const response = await fetch(`${BASE_URL}/contacts/.json`);
    const responseToJson = await response.json();
    localContacts = responseToJson || {};
  } catch {
    localContacts = {};
  }
}

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

function getRandomColor() {
  const colors = [
    "orange",
    "purple",
    "blue",
    "red",
    "green",
    "teal",
    "yellow",
    "pink",
    "cyan",
    "brown",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
