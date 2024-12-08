function getAddContactHTML() {
  return /*html*/ `
    <div id="contact-panel">
        <div id="add-contact-side-panel">
            <div id="add-contact-logo">
            <svg width="50" height="50" viewBox="0 0 102 122" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M72.655 0H50.4972V25.4923H72.655V0Z" fill="white"/>
                <path d="M50.4971 46.2251H72.655V82.1779C72.7562 90.8292 70.2941 99.3153 65.5815 106.557C60.9284 113.594 51.9459 121.966 35.3275 121.966C17.2263 121.966 6.67577 113.406 0.98291 108.715L14.9594 91.4743C20.5159 96.0112 25.8679 99.7435 35.4128 99.7435C42.6396 99.7435 45.5202 96.7988 47.2076 94.2307C49.5015 90.6637 50.6881 86.4923 50.6165 82.2464L50.4971 46.2251Z" fill="white"/>
                <path d="M39.1967 30.1318H17.0388V52.3884H39.1967V30.1318Z" fill="#29ABE2"/>
                <path d="M84.2622 111.522C84.2622 116.265 81.859 118.815 78.5012 118.815C75.1434 118.815 72.9447 115.785 72.9447 111.762C72.9447 107.739 75.2116 104.554 78.6887 104.554C82.1658 104.554 84.2622 107.687 84.2622 111.522ZM75.5184 111.711C75.5184 114.57 76.6604 116.675 78.6205 116.675C80.5806 116.675 81.6885 114.45 81.6885 111.539C81.6885 108.988 80.6659 106.592 78.6205 106.592C76.5752 106.592 75.5184 108.903 75.5184 111.711Z" fill="white"/>
                <path d="M88.6597 104.76V118.593H86.2053V104.76H88.6597Z" fill="white"/>
                <path d="M91.3187 118.593V104.76H94.0458L96.9775 110.461C97.7322 111.952 98.4036 113.483 98.9887 115.049C98.8353 113.337 98.7672 111.368 98.7672 109.177V104.76H101.017V118.593H98.4774L95.5117 112.772C94.7265 111.243 94.0266 109.671 93.4152 108.064C93.4152 109.776 93.5345 111.711 93.5345 114.09V118.576L91.3187 118.593Z" fill="white"/>
            </svg>
            </div>
            <span id="add-contact-headline">Add contact</span>
            <span id="add-contact-second">Tasks are better with a team!</span>
            <img src="../img/vector5.png" id="vector-line">
        </div>
        <div id="add-contact-interactions-container">
            <div id="add-contact-btn-close-container">
                <div src="../img/close.svg" id="add-contact-btn-close" onclick="hideAddContact()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
            </div>
            <div id="add-contact-interactions">
                <div id="add-contact-icon-container">
                    <img id="add-contact-icon" src="../img/add_contact.png">
                </div>
                <form id="input-fields">
                    <div class="input-wrapper">
                        <input required class="add-contact-input" id="add-contact-name" placeholder="Name" required>
                        <img src="../img/person.png" class="add-contact-input-icon">
                    </div>
                    <div class="input-wrapper">
                        <input required class="add-contact-input" id="add-contact-email" placeholder="Email" type="email" required>
                        <img src="../img/login-mail.png" class="add-contact-input-icon">
                    </div>
                    <div class="input-wrapper">
                        <input required class="add-contact-input" id="add-contact-phone" placeholder="Phone">
                        <img src="../img/call.png" class="add-contact-input-icon">
                    </div>
                </form>

            </div>
            <div id="add-contact-btn-wrapper">
            <div id="add-contact-btn-placeholder"></div>
                <div id="add-contact-btn-container">
                    <button id="add-contact-cancel" onclick="hideAddContact()">Cancel X</button>
                    <button id="add-contact-create" onclick="processContactInfo()">Create contact ✓</button>
                </div>
            </div>  
            <button id="test-btn" onclick="testing()">Fügt 23 Kontakte zu Firebase hinzu (überschreibt die Firebase Kontakte)</button>
        </div>
        <div id="add-contact-message" class="d-none"></div>
    </div>`;
}

function showErrorMessageHTML() {
  let content = document.getElementById("add-contact-message");
  content.innerHTML = `
    <div id="add-contact-error-message-container">
    <span id="add-contact-error-message">Vor- und nachname sowie Email sind notwendig</span>
    </div>
    `;
}

function showSuccesMessageHTML() {
  let content = document.getElementById("add-contact-message");
  content.innerHTML = `
    <div id="add-contact-succes-message-container">
    <span id="add-contact-succes-message">Kontakt erfolgreich erstellt</span>
    </div>
    `;
}
