const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let localContacts = [];
let testingContacts = [
    { id: 0, firstName: "Anton", lastName: "Ahrens", email: "anton.ahrens@gmail.com", phone: "123456" },
    { id: 1, firstName: "Anja", lastName: "Bauer", email: "anja.bauer@hotmail.com", phone: "234567" },
    { id: 2, firstName: "Benedikt", lastName: "Christ", email: "benedikt.christ@gmail.com", phone: "345678" },
    { id: 3, firstName: "David", lastName: "Drechsler", email: "david.drechsler@gmail.com", phone: "456789" },
    { id: 4, firstName: "Eva", lastName: "Eisenberg", email: "eva.eisenberg@yahoo.com", phone: "567890" },
    { id: 5, firstName: "Felix", lastName: "Fischer", email: "felix.fischer@gmail.com", phone: "678901" },
    { id: 6, firstName: "Greta", lastName: "Gruber", email: "greta.gruber@outlook.com", phone: "789012" },
    { id: 7, firstName: "Hannah", lastName: "Hartmann", email: "hannah.hartmann@gmail.com", phone: "890123" },
    { id: 8, firstName: "Isabella", lastName: "Ihde", email: "isabella.ihde@gmail.com", phone: "901234" },
    { id: 9, firstName: "Jakob", lastName: "Jansen", email: "jakob.jansen@gmail.com", phone: "012345" },
    { id: 10, firstName: "Klara", lastName: "Krüger", email: "klara.krueger@yahoo.com", phone: "123456" },
    { id: 11, firstName: "Lukas", lastName: "Lehmann", email: "lukas.lehmann@gmail.com", phone: "234567" },
    { id: 12, firstName: "Maria", lastName: "Meier", email: "maria.meier@gmail.com", phone: "345678" },
    { id: 13, firstName: "Nina", lastName: "Neumann", email: "nina.neumann@outlook.com", phone: "456789" },
    { id: 14, firstName: "Oscar", lastName: "Ott", email: "oscar.ott@gmail.com", phone: "567890" },
    { id: 15, firstName: "Paul", lastName: "Peters", email: "paul.peters@hotmail.com", phone: "678901" },
    { id: 16, firstName: "Quentin", lastName: "Quast", email: "quentin.quast@yahoo.com", phone: "789012" },
    { id: 17, firstName: "Sophia", lastName: "Schulz", email: "sophia.schulz@gmail.com", phone: "890123" },
    { id: 18, firstName: "Tom", lastName: "Thiele", email: "tom.thiele@outlook.com", phone: "901234" },
    { id: 19, firstName: "Ulrike", lastName: "Ullmann", email: "ulrike.ullmann@gmail.com", phone: "012345" },
    { id: 20, firstName: "Valentin", lastName: "Vogel", email: "valentin.vogel@gmail.com", phone: "123456" },
    { id: 21, firstName: "Xander", lastName: "Xaver", email: "xander.xaver@gmail.com", phone: "234567" },
    { id: 22, firstName: "Yasmin", lastName: "Yildiz", email: "yasmin.yildiz@hotmail.com", phone: "345678" },
    { id: 23, firstName: "Zoe", lastName: "Zimmermann", email: "zoe.zimmermann@yahoo.com", phone: "456789" }
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
            hideAddContact();
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
    getContactInfo();
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


