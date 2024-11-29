function renderContactContentHTML() {
  let content = document.getElementById("contact-content");
  content.innerHTML += /*html*/ `
    
    <div id="contact-side-panel">

    <div id="add-new-contact-button-container">
        <button onclick="addContact()" id="add-contact-btn">Add new contact<img id="add-contact-img" src="./img/person_add.png"></button>
    </div>
    <div id="contacts">
        ${getContacts()}
    </div>
    </div>
    `;

  content.innerHTML += /*html*/ `
    </div>
    <div id="contact-big">
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
        <div id="detailed-contact-info">
            
        </div>
    </div>
    `;
}


function contactHTML(id, firstname, lastname, email, phone) {
    let contactsContainer = document.getElementById('contacts');
    contactsContainer.innerHTML += /*html*/`
        <div class="contact-item" onclick="showContactDetails('${id}')">
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

function showContactDetailsHTML(id, firstname, lastname, email, phone) {
    console.log(id, firstname, lastname, email, phone);
    let contactDetailContent = document.getElementById('detailed-contact-info');
    contactDetailContent.innerHTML = /*html*/`
    <div id="contact-detail-short-name>
        <svg class="customCircle" width="50" height="50">
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="rgb(42,54,71)" stroke-width="2" fill="white"></circle>
            <text class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(firstname)}${getFirstLetter(lastname)}</text>
        </svg>
    </div>
    <div id="contact-detail-contact-interactions">
        <span id="contact-detail-email">${email}</span>
        <div id="contact-detail-btn-container">
            <button class="contact-detail-btn" id="contact-detail-delete-btn" onclick="deleteContact('${id}')">Delete</button>
            <button class="contact-detail-btn" id="contact-detail-edit-btn"onclick="editConctact('${id}')">Edit</button>
        </div>
    </div>
    `;
}
