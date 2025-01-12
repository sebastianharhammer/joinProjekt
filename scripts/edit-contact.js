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

document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();
});

function editContact(firebaseKey) {
  const contact = contactsData.find((c) => c.firebaseKey === firebaseKey);
  if (!contact) return;

  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");
  if (!editContactTemplate || !background) return;

  editContactTemplate.classList.add("show-edit-contact");
  background.classList.remove("d-none");
  editContactTemplate.innerHTML = getEditContactHTML(contact);
  setupEditValidation();
}

function hideEditContact() {
  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");

  if (editContactTemplate && background) {
    editContactTemplate.classList.remove("show-edit-contact");
    background.classList.add("d-none");
  }
}

async function saveEditedContact(firebaseKey) {
  const nameInput = document.getElementById("edit-contact-name").value.trim();
  const emailInput = document.getElementById("edit-contact-email").value.trim();
  const phoneInput = document.getElementById("edit-contact-phone").value.trim();

  const nameParts = nameInput.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const updatedContact = {
    firstName,
    lastName,
    email: emailInput,
    phone: phoneInput,
  };

  if (!firstName || !emailInput) {
    showEditErrorMessage("Name and email are required");
    return;
  }

  if (isGuestUser()) {
    const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
    if (index !== -1) {
      contactsData[index] = { ...contactsData[index], ...updatedContact };
    }
    hideEditContact();
    renderSortedContacts(contactsData);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContact),
    });

    if (response.ok) {
      hideEditContact();
      fetchContactsFromFirebase();
    }
  } catch (error) {
    console.error("Failed to update contact.");
  }
}

async function deleteContact(firebaseKey) {
  if (isGuestUser()) {
    const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
    if (index !== -1) {
      contactsData.splice(index, 1);
    }
    hideEditContact();
    renderSortedContacts(contactsData);
    return;
  }

  try {
    await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
      method: "DELETE",
    });
    hideEditContact();
    fetchContactsFromFirebase();
  } catch (error) {
    console.error("Failed to delete contact.");
  }
}

function showEditErrorMessage(message) {
  const errorContainer = document.getElementById("edit-contact-message");
  if (errorContainer) {
    errorContainer.classList.remove("d-none");
    errorContainer.innerHTML = `
      <div id="edit-contact-error-message-container">
        <span id="edit-contact-error-message">${message}</span>
      </div>
    `;
    setTimeout(() => {
      errorContainer.classList.add("d-none");
    }, 2500);
  }
}

function setupEditValidation() {
  const nameInput = document.getElementById("edit-contact-name");
  const emailInput = document.getElementById("edit-contact-email");
  const phoneInput = document.getElementById("edit-contact-phone");
  const saveButton = document.getElementById("edit-contact-create");

  const nameError = document.getElementById("edit-name-error");
  const emailError = document.getElementById("edit-email-error");
  const phoneError = document.getElementById("edit-phone-error");

  function validateEditInputs() {
    let isValid = true;

    if (!nameInput.value.trim()) {
      nameError.textContent = "Name ist erforderlich";
      nameError.style.display = "block";
      isValid = false;
    } else {
      nameError.textContent = "";
      nameError.style.display = "none";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      emailError.textContent = "Email ist erforderlich";
      emailError.style.display = "block";
      isValid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      emailError.textContent = "Ungültige Email-Adresse";
      emailError.style.display = "block";
      isValid = false;
    } else {
      emailError.textContent = "";
      emailError.style.display = "none";
    }

    const phoneRegex = /^[0-9+ ]*$/;
    if (!phoneInput.value.trim()) {
      phoneError.textContent = "Telefonnummer ist erforderlich";
      phoneError.style.display = "block";
      isValid = false;
    } else if (!phoneRegex.test(phoneInput.value.trim())) {
      phoneError.textContent = "Nur Zahlen und + sind erlaubt";
      phoneError.style.display = "block";
      isValid = false;
    } else {
      phoneError.textContent = "";
      phoneError.style.display = "none";
    }

    saveButton.disabled = !isValid;
  }

  nameInput.addEventListener("input", validateEditInputs);
  emailInput.addEventListener("input", validateEditInputs);
  phoneInput.addEventListener("input", validateEditInputs);

  validateEditInputs();
}
