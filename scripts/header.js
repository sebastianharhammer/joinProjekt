let firstName = "";
let lastName = "";

window.addEventListener("load", function() {
    HeaderGetUser();
});

function showUserOptions() {
    let userOption = document.getElementById('user-overlay');
    userOption.classList.toggle('d-none')
}


function HeaderGetUser() {
    let object = localStorage.getItem("currentUser");
    let objectToJson = JSON.parse(object);
    firstName = objectToJson.firstName;
    lastName = objectToJson.lastName;
    console.log("Header Local Storage Name: " + firstName + " - " + lastName);
    headerDisplayName(firstName, lastName);
}


function headerDisplayName(firstName, lastName) {
        firstNameShort = firstName.trim().charAt(0).toUpperCase();
        lastNameShort = lastName.trim().charAt(0).toUpperCase();
        let userId = document.getElementById('header-user-name');
        userId.innerHTML = `${firstNameShort}${lastNameShort}`;
}
