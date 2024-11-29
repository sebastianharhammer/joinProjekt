document.addEventListener('DOMContentLoaded', function () {
    const urlParams2 = new URLSearchParams(window.location.search);
    const welcomeMsg = urlParams2.get('welcomeMsg');
    if (welcomeMsg) {
        const welcomeDiv = document.getElementById('welcomeMsg');
        if (welcomeDiv) {
            welcomeDiv.innerHTML = welcomeMsg;
        }
    }
});