const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let localContacts = [];
let testingContacts = [
    { id: 0, firstName: "Mario", lastName: "Plumber", email: "mario.plumber@nintendo.com", phone: "111111" },
    { id: 1, firstName: "Link", lastName: "Hyrule", email: "link.hero@zelda.com", phone: "222222" },
    { id: 2, firstName: "Samus", lastName: "Aran", email: "samus.aran@metroid.com", phone: "333333" },
    { id: 3, firstName: "Sonic", lastName: "Hedgehog", email: "sonic.speed@sega.com", phone: "444444" },
    { id: 4, firstName: "Lara", lastName: "Croft", email: "lara.croft@tombraider.com", phone: "555555" },
    { id: 5, firstName: "Geralt", lastName: "Rivia", email: "geralt.rivia@witcher.com", phone: "666666" },
    { id: 6, firstName: "Master", lastName: "Chief", email: "master.chief@halo.com", phone: "777777" },
    { id: 7, firstName: "Pikachu", lastName: "Electric", email: "pikachu.pokemon@kanto.com", phone: "888888" },
    { id: 8, firstName: "Cloud", lastName: "Strife", email: "cloud.strife@finalfantasy.com", phone: "999999" },
    { id: 9, firstName: "Kratos", lastName: "Spartan", email: "kratos.godwar@sparta.com", phone: "101010" },
    { id: 10, firstName: "Nathan", lastName: "Drake", email: "nathan.drake@uncharted.com", phone: "121212" },
    { id: 11, firstName: "Ellie", lastName: "Williams", email: "ellie.williams@tlou.com", phone: "131313" },
    { id: 12, firstName: "Chun", lastName: "Li", email: "chun.li@streetfighter.com", phone: "141414" },
    { id: 13, firstName: "Solid", lastName: "Snake", email: "solid.snake@metalgear.com", phone: "151515" },
    { id: 14, firstName: "Ryu", lastName: "Fighter", email: "ryu.fighter@streetfighter.com", phone: "161616" },
    { id: 15, firstName: "Zelda", lastName: "Princess", email: "zelda.princess@hyrule.com", phone: "171717" },
    { id: 16, firstName: "Arthur", lastName: "Morgan", email: "arthur.morgan@rdr.com", phone: "181818" },
    { id: 17, firstName: "Doom", lastName: "Slayer", email: "doom.slayer@hell.com", phone: "191919" },
    { id: 18, firstName: "Cortana", lastName: "AI", email: "cortana.ai@halo.com", phone: "202020" },
    { id: 19, firstName: "Ezio", lastName: "Auditore", email: "ezio.auditore@ac.com", phone: "212121" },
    { id: 20, firstName: "Bayonetta", lastName: "Witch", email: "bayonetta.witch@platinumgames.com", phone: "222222" },
    { id: 21, firstName: "Gordon", lastName: "Freeman", email: "gordon.freeman@halflife.com", phone: "232323" },
    { id: 22, firstName: "Shepard", lastName: "Commander", email: "shepard.commander@masseffect.com", phone: "242424" },
    { id: 23, firstName: "Tifa", lastName: "Lockhart", email: "tifa.lockhart@finalfantasy.com", phone: "252525" }
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
    const { firstName, lastName } = extractNameParts();
    let email = document.getElementById('add-contact-email').value.trim();
    let phone = document.getElementById('add-contact-phone').value.trim();
    if (firstName && lastName && email) {
        showSuccesMessage();
        await getContactInfo();
        await pushContactInfo(firstName, lastName, email, phone);
        hideAddContact();
    } else {
        showErrorMessage();
        //clearAddContactInput();
    }
}
function showSuccesMessage() {
    let content = document.getElementById('add-contact-message');
    content.classList.remove('d-none');
    showSuccesMessageHTML();
    setTimeout(() => {
        content.classList.add('d-none');
    }, 2500);    
}
function showErrorMessage() {
    let content = document.getElementById('add-contact-message');
    content.classList.remove('d-none');
    showErrorMessageHTML();
    setTimeout(() => {
        content.classList.add('d-none');
    }, 2500);    
}

function clearAddContactInput() {
    let content = document.getElementById('add-contact-message');
    let nameInput = document.getElementById('add-contact-name');
    let emailInput = document.getElementById('add-contact-email');
    let phoneInput = document.getElementById('add-contact-phone');
    content.classList.remove('d-none');
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
}

function extractNameParts() {
    const input = document.getElementById('add-contact-name').value;
    const nameParts = input.trim().split(' ');
    const firstName = nameParts[0] || ''; 
    const lastName = nameParts.slice(1).join(' ') || '';
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