let contacts = [
  {
    "id": 0,
    "forename": "Axel",
    "surname": "Fowler",
    "email": "axel.fowler@gmail.com",
  },
  {
    "id": 1,
    "forename": "Leonardo",
    "surname": "Tornado",
    "email": "leonardo.tornado@gmx.de",
  },
  {
    "id": 2,
    "forename": "Frank",
    "surname": "Hoppla",
    "email": "frank.hoppla@web.de",
  },
  {
    "id": 4,
    "forename": "Alexandra",
    "surname": "Goldschmidt",
    "email": "alexandra.goldschmidt@yahoo.com",
  },
  {
    "id": 5,
    "forename": "Rick",
    "surname": "James",
    "email": "rick.james@yahoo.com",
  },
  {
    "id": 6,
    "forename": "Hulk",
    "surname": "Hogan",
    "email": "hulk.hogan@icloud.com",
  },
  {
    "id": 7,
    "forename": "Joe",
    "surname": "Biden",
    "email": "joe.biden@icloud.com",
  },
  {
    "id": 8,
    "forename": "Kamala",
    "surname": "Harris",
    "email": "kamala.harris@me.com",
  },
  {
    "id": 9,
    "forename": "June",
    "surname": "Rider",
    "email": "june.rider@yahoo.com",
  },
  {
    "id": 10,
    "forename": "Jim",
    "surname": "Powell",
    "email": "jim.powell@gmx.com",
  },
];

function renderContactContent() {
  includeHTML();
  renderContactContentHTML();
}

function renderContactContentHTML() {
  const content = document.getElementById("contact-content");

  content.innerHTML = "";

  let contactsHTML = /*html*/ `
      <div id="contact-side-panel">
        <div id="add-new-contact-button-container">
            <button onclick="addContact()" id="add-contact-btn">
                Add new contact<img id="add-contact-img" src="./img/person_add.png">
            </button>
        </div>
        <ul id="contact-list-names">
    `;

  contacts.forEach((contact) => {
    contactsHTML += contactsTemplate(contact);
  });

  contactsHTML += `
          </ul>
      </div>
    `;

  content.innerHTML = contactsHTML;

  content.innerHTML += `
      <div id="contact-big">
          <div id="contact-headline-container">
              <h3 id="contact-headline">Contacts</h3>
              <h2 id="bwat-headline">Better with a team</h2>
          </div>
      </div>
    `;
}

function getInitials(forename, surname) {
  return `${forename.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}
