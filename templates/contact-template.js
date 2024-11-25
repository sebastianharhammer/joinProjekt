function renderContactContentHTML () {
    let content = document.getElementById('contact-content');
    content.innerHTML += /*html*/`
    
    <div id="contact-side-panel">
        <div id="add-new-contact-button-container">
            
            <button id="add-contact-btn">Add new contact<img id="add-contact-img" src="./img/person_add.png"></button>
        </div>`;
        

    content.innerHTML += /*html*/`
    </div>
    <div id="contact-big">
        <div id="contact-headline-container">
            <h3 id="contact-headline">Contacts</h3>
            <h2 id="bwat-headline">Better with a team</h2>
        </div>
    </div>
    `;
}