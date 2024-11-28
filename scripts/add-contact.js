

function addContact() {
    let addContactTemplate = document.getElementById('add-contact-content');
    addContactTemplate.classList.add('show-add-contact');
    addContactTemplate.innerHTML = getAddContactHTML();
}
function hideAddContact() {
    let addContactTemplate = document.getElementById('add-contact-content');
    addContactTemplate.classList.remove('show-add-contact');
}

function processContactInfo() {
    let name = document.getElementById('add-contact-first-name');
    let email = document.getElementById('add-contact-last-name');
    let phone = document.getElementById('add-contact-email');

    if (name.value != "" && email.value != "" && phone.value != "") {
        pushContactInfo(name.value, email.value, phone.value)
    }
}

async function pushContactInfo(name, email, phone) {
    
}
