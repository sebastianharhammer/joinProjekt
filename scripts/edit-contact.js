function editContact(contactId) {
    const contact = contactsData.find((c) => c.id === contactId);

    if (!contact) {
        console.error(`Contact with ID ${contactId} not found.`);
        return;
    }

    let editContactTemplate = document.getElementById("edit-contact-content");
    let background = document.getElementById("edit-contact-background");

    if (!editContactTemplate || !background) {
        console.error("Required overlay elements not found in the DOM.");
        return;
    }

    editContactTemplate.classList.add("show-edit-contact");
    background.classList.remove("d-none");

    editContactTemplate.innerHTML = getEditContactHTML(contact);
}

async function saveEditedContact(contactId) {
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


    const updatedContact = {
        id: contactId,
        firstName,
        lastName,
        email: emailInput,
        phone: phoneInput,
    };

    try {
        const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedContact),
        });

        if (response.ok) {
            console.log(`Contact with ID ${contactId} updated.`);
            hideEditContact(); 
            toggleContactDetail(contactId); 
        } else {
            console.error(`Failed to update contact: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Failed to update contact:", error);
    }
}

async function deleteContact(contactId) {
    try {
      await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
        method: "DELETE",
      });

      console.log(`Contact with ID ${contactId} deleted.`);
      hideEditContact();
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
