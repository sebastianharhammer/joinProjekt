let signedUsersArrayLogin="[]";

function init(){
    showStartSlide();
    loadSignedUsers("/signed_users");
}

let urlParams = new URLSearchParams(window.location.search);
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


async function loadSignedUsers(path){
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    if (responseToJson) {
        signedUsersArrayLogin = Object.values(responseToJson);  
        console.log(signedUsersArrayLogin); 
    }
}

function loginUser(event){
    event.preventDefault();
    console.log(signedUsersArrayLogin);
    let userMail = document.getElementById('loginMailUser');
    let userPassword = document.getElementById('loginPasswordUser');
    let signedUser = signedUsersArrayLogin.find(u => u.email == userMail.value && u.password == userPassword.value)
    if(signedUser){
        console.log('user identified');
        console.log('Weiterleitung nach summary.html');
        showRememberMeBox();
        window.location.href = 'summary.html?welcomeMsg=' + encodeURIComponent('Willkommen bei Join');
        getUser(signedUser);
    }else{
        console.log('user not found')
        showDomOfFailedLogin()
    }
}

function showRememberMeBox(){

}

function showDomOfFailedLogin(){
let failedLoginDiv = document.getElementById('failedLoginDiv');
let changeBorders = document.getElementsByClassName('loginNameInput');
failedLoginDiv.classList.remove('d-none')
for (let i = 0; i < changeBorders.length; i++) {
    changeBorders[i].style.border = '1px solid red';
}
setTimeout(function() {
    failedLoginDiv.classList.add('d-none');
    for (let i = 0; i < changeBorders.length; i++) {
        changeBorders[i].style.border = '1px solid rgb(168, 168, 168)';
    }
}, 1200);
}

function validateSignUpForm(){}