async function getUser() {
    let userLocalStorage = localStorage.getItem("localUser");
    if (!userLocalStorage) {
        console.warn("No user found in localStorage.");
        return;
    }
    let userHTML = document.getElementById('current-user');
    if (!userHTML) {
        console.error("Element with id 'current-user' not found.");
        return;
    }
    userHTML.innerHTML = `${userLocalStorage}`;
}
