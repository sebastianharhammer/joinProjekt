//const BASE_URL = "https://test-e704d-default-rtdb.europe-west1.firebasedatabase.app/"
const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/"
let localContacts = [];
let testingContacts = [
    {   
        id: 0,
        firstName: "Anton",
        lastName: "Mayer",
        email: "antom@gmail.com",
        phone: "012345"
    },
    {   
        id: 1,
        firstName: "Anja",
        lastName: "Schulz",
        email: "schulz@hotmail.com",
        phone: "012345"
    },
    {   
        id: 2,
        firstName: "Benedikt",
        lastName: "Ziegler",
        email: "benedikt@gmail.com",
        phone: "012345"
    },
    {   
        id: 3,
        firstName: "David",
        lastName: "Eisenberg",
        email: "davidberg@gmail.com",
        phone: "012345"
    } 
];

async function testing() {
    for (let i = 0; i < testingContacts.length; i++) {
        let key = testingContacts[i].id;
        try {
            let response = await fetch(BASE_URL + `/contacts/${key}.json`, {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(testingContacts[i]),
            });

            let responseToJson = await response.json();
            console.log(`Contact with ID ${key} added:`, responseToJson);
        } catch (error) {
            console.error(`Failed to add contact with ID ${key}:`, error);
        }
    }
    console.log("All contacts processed.");
}



function addContact() {
    let addContactTemplate = document.getElementById('add-contact-content');
    let background = document.getElementById('add-contact-background');
    addContactTemplate.classList.add('show-add-contact');
    background.classList.remove('d-none');
    addContactTemplate.innerHTML = getAddContactHTML();
}

function hideAddContact() {
    let addContactTemplate = document.getElementById('add-contact-content');
    let background = document.getElementById('add-contact-background');
    addContactTemplate.classList.remove('show-add-contact');
    background.classList.add('d-none');
    getContacts();
}

async function processContactInfo() {
    let name = document.getElementById('add-contact-first-name').value.trim();
    let lastName = document.getElementById('add-contact-last-name').value.trim();
    let email = document.getElementById('add-contact-email').value.trim();
    let phone = document.getElementById('add-contact-phone').value.trim();

    if (name && lastName && email && phone) {
        await getContactInfo();
        await pushContactInfo(name, lastName, email, phone);
        hideAddContact();
    } else {
        console.log("Not all fields are filled.");
    }
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
        //localContacts = responseToJson ? Object.values(responseToJson) : [];
        localContacts = responseToJson;
        console.log("Fetched contacts:", localContacts);
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
    }
}

async function pushContactInfo(name, lastname, email, phone) {
    let newContact = {
        id: localContacts.length,
        firstName: name,
        lastName: lastname,
        email: email,
        phone: phone,
    };

    try {
        let key = newContact.id; 
        let response = await fetch(BASE_URL + `/contacts/${key}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newContact),
        });
        let responseToJson = await response.json();
        console.log("Contact added or updated:", responseToJson);
    } catch (error) {
        console.error("Failed to add contact:", error);
    }
}


