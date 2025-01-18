function contactsTemplate(contact) {
  return `
    <li id="contact-item-${
      contact.firebaseKey
    }" class="contact-item" onclick="toggleContactDetail('${
    contact.firebaseKey
  }')">
      <span id="avatar-${contact.firebaseKey}" style="background-color: ${
    contact.color || getRandomColor()
  }">
          ${getInitials(contact.firstName, contact.lastName)}
      </span>
      <div id="contact-item-right">
        <p id="contact-name-${contact.firebaseKey}">${contact.firstName} ${
    contact.lastName
  }</p>
        <a id="contact-email-${contact.firebaseKey}" href="mailto:${
    contact.email
  }">${contact.email}</a>
      </div>
    </li>
  `;
}

function getMobileDetailHTML(contact, firebaseKey) {
  return /*html*/`
  <section class="mobile-info-contact">
    <div class="contact-headline-container-mobile">
            <h3 class="contact-headline-mobile">Contacts</h3>
            <h2 class="bwat-headline-mobile">Better with a team</h2>
    </div>
    <button id="back-button" class="back-button" onclick="renderContactList()">
      <img src="./img/arrow-left-line.svg" alt="arrow left">
    </button>
    <div class="contact-detail">
      <div class="contact-detail-header">
        <div class="contact-avatar" style="background-color: ${
          contact.color || getRandomColor()
        }">
          ${getInitials(contact.firstName, contact.lastName)}
        </div>
        <div class="contact-detail-header-right">
          <div class="contact-detail-header-right-headline">
            ${contact.firstName} ${contact.lastName}
          </div>
        </div>
      </div>
      <div id="contact-information">Contact Information</div>
      <div id="contact-detail-bottom">
        <div id="contact-detail-email">
          <strong>Email:</strong>
          <a href="mailto:${contact.email}">${contact.email}</a>
        </div>
        <div id="contact-detail-phone">
          <strong>Phone:</strong> ${contact.phone}
        </div>
      </div>
    </div>
    <button id="menu-button" class="menu-button" onclick="toggleMenu()">⋮</button>
    <div id="dropdown-menu" class="dropdown-menu hidden">
      <button class="edit-button-mobile" onclick="editContact('${firebaseKey}')">
        <img id="edit-contact-img" src="./img/edit.svg" alt="Edit"> Edit
      </button>
      <button class="delete-button-mobile" onclick="deleteContact('${firebaseKey}')">
        <img id="delete-contact-img" src="./img/delete.svg" alt="Delete"> Delete
      </button>
    </div>
    </section>
    `;
}

function getDesktopDetailHTML(contact, firebaseKey) {
  return `
    <div class="contact-detail">
      <div class="contact-detail-header">
        <div class="contact-avatar" style="background-color: ${
          contact.color || getRandomColor()
        }">
          ${getInitials(contact.firstName, contact.lastName)}
        </div>
        <div class="contact-detail-header-right">
          <div class="contact-detail-header-right-headline">
            ${contact.firstName} ${contact.lastName}
          </div>
          <div class="detail-actions">
            <button onclick="editContact('${firebaseKey}')">
              <img id="edit-contact-img" src="./img/edit.svg">Edit
            </button>
            <button onclick="deleteContact('${firebaseKey}')">
              <img id="delete-contact-img" src="./img/delete.svg">Delete
            </button>
          </div>
        </div>
      </div>
      <div id="contact-information">Contact Information</div>
      <div id="contact-detail-bottom">
        <div id="contact-detail-email">
          <strong>Email:</strong>
          <a href="mailto:${contact.email}">${contact.email}</a>
        </div>
        <div id="contact-detail-phone">
          <strong>Phone:</strong> ${contact.phone}
        </div>
      </div>
    </div>
  `;
}

