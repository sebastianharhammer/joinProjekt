function loadCurrentUser() {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      console.log("[edit-contact.js] currentUser =", currentUser);
    } else {
      console.log("[edit-contact.js] Kein currentUser im localStorage.");
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
    if (!contact) {
      console.error(`[edit-contact.js] Contact with firebaseKey ${firebaseKey} not found.`);
      return;
    }
    let editContactTemplate = document.getElementById("edit-contact-content");
    let background = document.getElementById("edit-contact-background");
    if (!editContactTemplate || !background) {
      console.error("[edit-contact.js] Required overlay elements not found in the DOM.");
      return;
    }
    editContactTemplate.classList.add("show-edit-contact");
    background.classList.remove("d-none");
    editContactTemplate.innerHTML = getEditContactHTML(contact);
  }
  
  async function saveEditedContact(firebaseKey) {
    const nameInput = document.getElementById("edit-contact-name").value.trim();
    const emailInput = document.getElementById("edit-contact-email").value.trim();
    const phoneInput = document.getElementById("edit-contact-phone").value.trim();
    if (!nameInput || !emailInput) {
      alert("Name and Email are required!");
      return;
    }
    const nameParts = nameInput.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    const updatedContact = { firstName, lastName, email: emailInput, phone: phoneInput };
    if (isGuestUser()) {
      console.log("[edit-contact.js] Gast-User => Speichern nur lokal, kein Firebase-Update.");
      const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
      if (index !== -1) {
        contactsData[index] = { ...contactsData[index], ...updatedContact };
        console.log(`[edit-contact.js] Lokal Kontakt aktualisiert (Gast), key=${firebaseKey}.`);
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
        console.log(`[edit-contact.js] Contact with firebaseKey ${firebaseKey} updated (Firebase).`);
        hideEditContact();
        fetchContactsFromFirebase();
        toggleContactDetail(firebaseKey);
      } else {
        console.error(`Failed to update contact: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
    }
  }
  
  async function deleteContact(firebaseKey) {
    if (isGuestUser()) {
      console.log("[edit-contact.js] Gast-User => Nur lokal löschen, kein Firebase.");
      const index = contactsData.findIndex((c) => c.firebaseKey === firebaseKey);
      if (index !== -1) {
        contactsData.splice(index, 1);
        console.log(`[edit-contact.js] Lokal Kontakt gelöscht (Gast), key=${firebaseKey}.`);
      }
      hideEditContact();
      renderSortedContacts(contactsData);
      return;
    }
    try {
      await fetch(`${BASE_URL}/contacts/${firebaseKey}.json`, {
        method: "DELETE",
      });
      console.log(`[edit-contact.js] Contact with firebaseKey ${firebaseKey} deleted (Firebase).`);
      hideEditContact();
      fetchContactsFromFirebase();
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  }
  
  function hideEditContact() {
    let editContactTemplate = document.getElementById("edit-contact-content");
    let background = document.getElementById("edit-contact-background");
    editContactTemplate.classList.remove("show-edit-contact");
    background.classList.add("d-none");
  }
  