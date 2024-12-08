async function initSummary() {
    await includeHTML();
    let urlParams = new URLSearchParams(window.location.search);
    let firstName = urlParams.get('firstName');
    let lastName = urlParams.get('lastName');
    if (firstName && lastName) {
        showUserGreeting(firstName, lastName);
    } else {
        console.error("no registered user found");
    }
}


function showUserGreeting(firstName, lastName) {
    let greetingName = document.getElementById('nameOfUser');
    if (greetingName) {
        greetingName.innerHTML = `<p>${firstName} ${lastName}</p>`;
    } else {
        console.error("Das Element #nameOfUser wurde nicht gefunden.");
    }
}