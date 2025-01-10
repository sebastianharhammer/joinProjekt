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
}

async function saveEditedContact(firebaseKey) {
  const nameInput = document.getElementById("edit-contact-name").value.trim();
  const emailInput = document.getElementById("edit-contact-email").value.trim();
  const phoneInput = document.getElementById("edit-contact-phone").value.trim();

  if (!nameInput || !emailInput) {
    return;
  }

  const nameParts = nameInput.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");
  const updatedContact = {
    firstName,
    lastName,
    email: emailInput,
    phone: phoneInput,
  };

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
      toggleContactDetail(firebaseKey);
    }
  } catch (error) {}
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
  } catch (error) {}
}

function hideEditContact() {
  const editContactTemplate = document.getElementById("edit-contact-content");
  const background = document.getElementById("edit-contact-background");
  editContactTemplate.classList.remove("show-edit-contact");
  background.classList.add("d-none");
}
