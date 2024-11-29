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

function contactHTML(id, firstname, lastname, email, phone) {
    let contactsContainer = document.getElementById('contacts');
    contactsContainer.innerHTML += `
        <div class="contact-item">
        <div class="full-name-short">
            <svg class="customCircle" width="50" height="50">
                <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="rgb(42,54,71)" stroke-width="2" fill="white"></circle>
                <text class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(firstname)}${getFirstLetter(lastname)}</text>
            </svg>
        </div>
        <div class="contact-info">
            <span>${firstname}${lastname}</span>
            <span>${email}
            </div>
        </div>        
    `;
}
