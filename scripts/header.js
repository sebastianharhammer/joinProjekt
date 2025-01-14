let headerFirstName = "";
let headerLastName = "";
let navSummary = 0;
let navAddTask = 0;
let navBoard = 0;
let navContacts = 0;
let navPolicy = 0;
let navLegalNotice = 0;

function showUserOptions() {
    let userOption = document.getElementById('header-user-overlay');
    userOption.classList.toggle('d-none');
    const handleOutsideClick = (event) => {
        const overlay = document.getElementById('header-user-overlay');
        const headerUser = document.querySelector('.header-user-icon');
        if (!overlay.classList.contains('d-none') && 
            !overlay.contains(event.target) && 
            !headerUser.contains(event.target)) {
            overlay.classList.add('d-none');
            document.removeEventListener('click', handleOutsideClick);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 0);
}


function waitForElement(selector, callback, interval = 100) {
    const checkExist = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(checkExist);
            callback();
        }
    }, interval);
}
waitForElement('#header-user-name', () => {
    headerGetUser();
});

function headerGetUser() {
    let object = localStorage.getItem("currentUser");
    let objectToJson = JSON.parse(object);
    headerFirstName = objectToJson.firstName;
    headerLastName = objectToJson.lastName;
    headerDisplayName(headerFirstName, headerLastName);
}


function headerDisplayName(firstName, lastName) {
        let headerFirstNameShort = firstName.trim().charAt(0).toUpperCase();
        let headerLastNameShort = lastName.trim().charAt(0).toUpperCase();
        let userId = document.getElementById('header-user-name');
        userId.style.fill = '#29ABE2';
        userId.innerHTML = `${headerFirstNameShort}${headerLastNameShort}`;
}

function headerUserLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeNav');
}

function removeActiveNav() {
    localStorage.removeItem('activeNav');
}

// NAV SCRIPT -- IST AUS EINFACHHEIT IN HEADER.JS DA DIE FUNKTIION SEHR SPÄT HINZUGEFÜGT WURDE UND ES NOCH KEINE NAV.JS GAB

function navLinksOnFocus(site) {
        let summary = document.getElementById('nav-summary');
        let addTask = document.getElementById('nav-add-task');
        let board = document.getElementById('nav-board');
        let contacts = document.getElementById('nav-contacts');
        let policy = document.getElementById('nav-privacy-policy');
        let legalNotice = document.getElementById('nav-legal-notice');
        
        localStorage.setItem('activeNav', site);

        let localStorageGetItem = localStorage.getItem('activeNav');

    
    if (localStorageGetItem === 'summary') {
        summary.classList.add('link-active');     
    }
    if (localStorageGetItem === 'addTask') {
        addTask.classList.add('link-active');
    }
    if (localStorageGetItem === 'board') {
        board.classList.add('link-active');
    }
    if (localStorageGetItem === 'contacts') {
        contacts.classList.add('link-active');
    }
    if (localStorageGetItem === 'policy') {
        policy.classList.add('link-active');
    }
    if (localStorageGetItem === 'legalNotice') {
        legalNotice.classList.add('link-active');
    }
}

function setLinkActive() {
    let localStorageGetItem = localStorage.getItem('activeNav');
    navLinksOnFocus(localStorageGetItem);
}