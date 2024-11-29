<<<<<<< HEAD
function contactsTemplate(contact) {
  return `
      <li id="contact-item-${contact.id}">
          <span id="avatar-${
            contact.id
          }" style="background-color: ${getRandomColor()};">
              ${getInitials(contact.forename, contact.surname)}
          </span>
          <div>
              <p id="contact-name-${contact.id}">${contact.forename} ${
    contact.surname
  }</p>
              <a id="contact-email-${contact.id}" href="mailto:${
    contact.email
  }">${contact.email}</a>
          </div>
      </li>
=======
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
    <div id="contact-detail-short-name">
        <svg class="customCircle" width="200" height="200">
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="75" stroke="rgb(42,54,71)" stroke-width="2" fill="white"></circle>
            <text class="textInCircle-big" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(firstname)}${getFirstLetter(lastname)}</text>
        </svg>
    </div>
    <div id="contact-detail-contact-interactions">
        <span id="contact-detail-name">${firstname} ${lastname}</span>
        <div id="contact-detail-btn-container">
            <div class="contact-detail-btn-wrapper">
                <img id="edit-pencil-icon" src="../img/edit-pencil.png">
            <button class="contact-detail-btn" id="contact-detail-delete-btn" onclick="deleteContact('${id}')">Delete</button>
            </div>
            <div class="contact-detail-btn-wrapper">
                <img id="delete-icon" src="../img/delete.png">
            <button class="contact-detail-btn" id="contact-detail-edit-btn"onclick="editConctact('${id}')">Edit</button>
            </div>
        </div>
        <div id="contact-detail-more-info-container">
            <h5 id="ci-headline">Contact Information</h5>
            <span id="email-description">Email</span>
            <span id="contact-detail-email">${email}</span>
            <span id="phone-description">Phone</span>
            <span id="contact-detail-phone">${phone}</span>
    </div>
>>>>>>> 73f89e16c5932f6f626273b0241b8b71164ca770
    `;
}
