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

  await pushContactInfo(firstName, lastName, email, phone);
  hideAddContact();
  setTimeout(() => showSuccessMessage(), 300);
}

function showSuccessMessage() {
  const message = document.createElement("div");
  message.id = "success-message-container";
  message.innerHTML = "Kontakt erfolgreich erstellt!";
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add("show");
  }, 10);

  setTimeout(() => {
    message.classList.remove("show");
    setTimeout(() => message.remove(), 500);
  }, 2500);
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
    localContacts = (await response.json()) || {};
  } catch {
    console.error("Failed to fetch contacts.");
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

function handleContactCreation() {
  const isValid = validateInputs();
  if (isValid) {
    processContactInfo();
  }
}

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
