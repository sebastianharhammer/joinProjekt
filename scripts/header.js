let headerFirstName = "";
let headerLastName = "";

function showUserOptions() {
    let userOption = document.getElementById('user-overlay');
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
    console.log("Header Local Storage Name: " + headerFirstName + " - " + headerLastName);
    headerDisplayName(headerFirstName, headerLastName);
}


function headerDisplayName(firstName, lastName) {
        let headerFirstNameShort = firstName.trim().charAt(0).toUpperCase();
        let headerLastNameShort = lastName.trim().charAt(0).toUpperCase();
        let userId = document.getElementById('header-user-name');
        userId.innerHTML = `${headerFirstNameShort}${headerLastNameShort}`;
}
function headerGetColor() {
        const colors = ["orange", "purple", "blue", "red", "green", "teal"];
        return colors[Math.floor(Math.random() * colors.length)];
}