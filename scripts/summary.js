async function initSummary() {
    await includeHTML();
    let storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        console.log("Aktueller Benutzer aus Local Storage:", currentUser);
        showUserGreeting(currentUser.firstName, currentUser.lastName);
    } else {
        console.error("Kein Benutzer im Local Storage gefunden.");
        window.location.href = 'login.html?msg=' + encodeURIComponent('Bitte melden Sie sich erneut an.');
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