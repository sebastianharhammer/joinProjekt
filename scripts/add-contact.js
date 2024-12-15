let localContacts = [];

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
  }, 2500);
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
    console.log("Fetched contacts:", localContacts);
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
  };

  try {
    let response = await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContact),
    });
    let responseToJson = await response.json();
    console.log("Contact added:", responseToJson);

    await getContactInfo();
    fetchContactsFromFirebase();
  } catch (error) {
    console.error("Failed to add contact:", error);
  }
}
