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
    `;
}
