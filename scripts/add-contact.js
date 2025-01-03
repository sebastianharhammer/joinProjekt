function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    console.log("[add-contact.js] currentUser =", currentUser);
  }
}

function isGuestUser() {
  return (
    currentUser &&
    currentUser.firstName === "Guest" &&
    currentUser.lastName === "User"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
});

function addContact() {
  let addContactTemplate = document.getElementById("add-contact-content");
  let background = document.getElementById("add-contact-background");
  addContactTemplate.classList.add("show-add-contact");
  background.classList.remove("d-none");
  addContactTemplate.innerHTML = getAddContactHTML();
}

function hideAddContact() {
  let addContactTemplate = document.getElementById("add-contact-content");
  let background = document.getElementById("add-contact-background");
  addContactTemplate.classList.remove("show-add-contact");
  background.classList.add("d-none");
  getContactInfo();
}

async function processContactInfo() {
  const { firstName, lastName } = extractNameParts();
  let email = document.getElementById("add-contact-email").value.trim();
  let phone = document.getElementById("add-contact-phone").value.trim();

  if (firstName && lastName && email) {
    showSuccesMessage();
    await getContactInfo();
    await pushContactInfo(firstName, lastName, email, phone);
    hideAddContact();
  } else {
    showErrorMessage();
  }
}

function showSuccesMessage() {
  let content = document.getElementById("add-contact-message");
  content.classList.remove("d-none");
  showSuccesMessageHTML();
  setTimeout(() => {
    content.classList.add("d-none");
  }, 20500);
}

function showErrorMessage() {
  let content = document.getElementById("add-contact-message");
  content.classList.remove("d-none");
  showErrorMessageHTML();
  setTimeout(() => {
    content.classList.add("d-none");
  }, 2500);
}

function clearAddContactInput() {
  let content = document.getElementById("add-contact-message");
  let nameInput = document.getElementById("add-contact-name");
  let emailInput = document.getElementById("add-contact-email");
  let phoneInput = document.getElementById("add-contact-phone");
  content.classList.remove("d-none");
  nameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
}

function extractNameParts() {
  const input = document.getElementById("add-contact-name").value;
  const nameParts = input.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

async function getContactInfo() {
  try {
    let response = await fetch(BASE_URL + "/contacts/.json", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let responseToJson = await response.json();
    localContacts = responseToJson || {};
    console.log("[add-contact.js] Fetched contacts:", localContacts);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    localContacts = {};
  }
}

async function pushContactInfo(firstName, lastName, email, phone) {
  let newContact = {
    firstName,
    lastName,
    email,
    phone,
    color: getRandomColor(),
  };

  if (isGuestUser()) {
    const pseudoKey = `guest-${Date.now()}`;
    if (typeof contactsData === "undefined") {
      console.warn("[add-contact.js] Kein globales contactsData gefunden!");
      return;
    }
    contactsData.push({ firebaseKey: pseudoKey, ...newContact });
    if (typeof renderSortedContacts === "function") {
      renderSortedContacts(contactsData);
    }
    if (typeof renderRightSideContainer === "function") {
      renderRightSideContainer();
    }
    return;
  }

  try {
    let response = await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContact),
    });
    let responseToJson = await response.json();
    console.log("[add-contact.js] Contact added (Firebase):", responseToJson);
    await getContactInfo();
    if (typeof fetchContactsFromFirebase === "function") {
      fetchContactsFromFirebase();
    }
  } catch (error) {
    console.error("Failed to add contact:", error);
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
