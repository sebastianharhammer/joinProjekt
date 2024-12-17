function contactsTemplate(contact) {
  return `
      <li id="contact-item-${
        contact.firebaseKey
      }" class="contact-item" onclick="toggleContactDetail('${
    contact.firebaseKey
  }')">
          <span id="avatar-${contact.firebaseKey}" style="background-color: ${
    contact.color || getRandomColor()
  };">
              ${getInitials(contact.firstName, contact.lastName)}
          </span>
          <div id="contact-item-right">
              <p id="contact-name-${contact.firebaseKey}">${
    contact.firstName
  } ${contact.lastName}</p>
              <a id="contact-email-${contact.firebaseKey}" href="mailto:${
    contact.email
  }">${contact.email}</a>
          </div>
      </li>
    `;
}
