//const BASE_URL = "https://test-e704d-default-rtdb.europe-west1.firebasedatabase.app/"
const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/"
let localContacts = [];
let testingContacts = [
    {
        firstName: "Anton",
        lastName: "Mayer",
        email: "antom@gmail.com"
    },
    {
        firstName: "Anja",
        lastName: "Schulz",
        email: "schulz@hotmail.com"
    },
    {
        firstName: "Benedikt",
        lastName: "Ziegler",
        email: "benedikt@gmail.com"
    },
    {
        firstName: "David",
        lastName: "Eisenberg",
        email: "davidberg@gmail.com"
    } 
];

async function testing() {
    let response = await fetch(BASE_URL + "/contacts" + "/.json", {
        method: "PUT",
        header: {
            "Content-type":"application/json",
        },
        body: JSON.stringify(testingContacts)
        });
        return responseToJson = await response.json();
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
    background.classList.add('d-none')
}

function processContactInfo() {
    let name = document.getElementById('add-contact-first-name');
    let email = document.getElementById('add-contact-last-name');
    let phone = document.getElementById('add-contact-email');

    if (name.value != "" && email.value != "" && phone.value != "") {
        getContactInfo()
        pushContactInfo(name.value, email.value, phone.value)
    }
    else {
        console.log("nicht alles ausgefüllt");
    }
}
async function getContactInfo () {
    let response = await fetch(BASE_URL + "/contacts" + "/.json", {
        method: "GET",
        header: {
            "Content-type":"application/json",
        },
        //body: JSON.stringify(testingContacts)
        });
        let responseToJson = await response.json();
        console.log(responseToJson);
        localContacts = responseToJson;
        
}


 function pushContactInfo(name, email, phone) {
    let path = "/contacts/"
    let localContact = {
        "firstName":name,
        "email":email,
        "phone":phone
    };
    localContacts.push(localContact);
    pushContactsToFirebase(path)
}
async function loadData() {
    let path = "/contacts/";
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        let responseToJson = await response.json();
        console.table(responseToJson);
    } catch (error) {
        console.error("Failed to load data:", error);
    }
}


async function pushContactsToFirebase(path) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        header: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(localContacts)
        });
        return responseToJson = await response.json();
}