async function initSummary() {
    await includeHTML();
    const urlParams = new URLSearchParams(window.location.search);
    const firstName = urlParams.get('firstName');
    const lastName = urlParams.get('lastName');
    if (firstName && lastName) {
        showUserGreeting(firstName, lastName);
    } else {
        console.error("no registered user found");
    }
}


async function fetchUser(userId) {
    try {
        const userPath = `/signed_users/user${userId}.json`;
        const response = await fetch(BASE_URL + userPath);
        const userData = await response.json();
        if (userData) {
            console.log("Benutzerdaten erfolgreich abgerufen:", userData);
        } else {
            console.error("Benutzer nicht gefunden in Firebase");
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Benutzerdaten aus Firebase:", error);
    }
    
}

function showUserGreeting(firstName, lastName) {
    const greetingName = document.getElementById('nameOfUser');
    if (greetingName) {
        greetingName.innerHTML = `<p>${firstName} ${lastName}</p>`;
    } else {
        console.error("Das Element #nameOfUser wurde nicht gefunden.");
    }
}