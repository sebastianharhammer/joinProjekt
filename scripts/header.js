let headerFirstName = "";
let headerLastName = "";

function showUserOptions() {
    let userOption = document.getElementById('header-user-overlay');
    userOption.classList.toggle('d-none')
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
    HeaderGetUser();
});

function HeaderGetUser() {
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