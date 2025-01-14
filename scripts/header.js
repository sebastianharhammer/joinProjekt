let headerFirstName = "";
let headerLastName = "";

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