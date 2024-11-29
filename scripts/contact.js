let contacts = [];

function renderContactContent() {
    includeHTML();
    renderContactContentHTML();
}

async function getContacts() {
    try {
        let response = await fetch(BASE_URL + "/contacts/.json", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        });
        let responseToJson = await response.json();
        console.log(responseToJson);
        contacts = responseToJson;
        returnArrayContacts();
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

function returnArrayContacts() {
    if (!contacts) {
        console.error("No contacts found.");
        return;
    }

    let contactsContainer = document.getElementById('contacts');
    contactsContainer.innerHTML = ''; 

    for (let key in contacts) {
        let contact = contacts[key];
        if (!contact) continue;

        let firstname = contact.firstName;
        let lastname = contact.lastName;
        let email = contact.email;
        let phone = contact.phone;
        let id = contact.id;

        contactHTML(id, firstname, lastname, email, phone);
    }
}
function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}

function showContactDetails(id) {
    let contact = contacts[id];

    if (!contact) {
        console.error(`Contact with ID ${id} not found.`);
        return;
    }

    showContactDetailsHTML(contact.id, contact.firstName, contact.lastName, contact.email, contact.phone);
}

