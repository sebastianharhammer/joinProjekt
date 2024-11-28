function renderContactContentHTML() {
  let content = document.getElementById("contact-content");
  content.innerHTML += /*html*/ `
    
    <div id="contact-side-panel">

    <div id="add-new-contact-button-container">
        <button onclick="addContact()" id="add-contact-btn">Add new contact<img id="add-contact-img" src="./img/person_add.png"></button>
    </div>
        <ul id="contact-list">
        <li id="contact-item-1">
            <span id="avatar-1" style="background-color: orange;">AM</span>
            <div>
                <p id="contact-name-1">Anton Mayer</p>
                <a id="contact-email-1" href="mailto:antom@gmail.com">antom@gmail.com</a>
            </div>
        </li>
        <li id="contact-item-2">
            <span id="avatar-2" style="background-color: purple;">AS</span>
            <div>
                <p id="contact-name-2">Anja Schulz</p>
                <a id="contact-email-2" href="mailto:schulz@hotmail.com">schulz@hotmail.com</a>
            </div>
        </li>
        </ul>
    </div>
    `;

  content.innerHTML += /*html*/ `
    </div>
    <div id="contact-big">
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
    </div>
    `;
    content.innerHTML += /*html*/`
        <div id="add-contact-content" class="d-none"></div>
    `;
}
