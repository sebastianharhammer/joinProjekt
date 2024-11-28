const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');
const msgBox = document.getElementById('msgBox')
if (msg) {
msgBox.innerHTML = msg;
}

function showStartSlide(){
    let startOverlay = document.getElementById('logo');
    startOverlay.classList.remove('d-none');
    setTimeout(function() {
        startOverlay.classList.add('animate');
    }, 100);
}