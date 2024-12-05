let signedUsersArrayLogin="[]";

function init(){
    showStartSlide();
    loadSignedUsers("/signed_users");
    loadRememberedUser();
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

function loadRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const userData = JSON.parse(rememberedUser);
        document.getElementById('loginMailUser').value = userData.email;
        document.getElementById('loginPasswordUser').value = userData.password;
        document.getElementById('checkboxLogin').checked = true;
        console.log('User data loaded from Local Storage');
    }
}

async function loadSignedUsers(path){
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    if (responseToJson) {
        signedUsersArrayLogin = Object.values(responseToJson);  
        console.log(signedUsersArrayLogin); 
    }
}

function loginUser(event) {
    event.preventDefault();
    console.log(signedUsersArrayLogin);
    
    let userMail = document.getElementById('loginMailUser').value;
    let userPassword = document.getElementById('loginPasswordUser').value;
    let rememberMe = document.getElementById('checkboxLogin').checked;
    let signedUser = signedUsersArrayLogin.find(u => u.email === userMail && u.password === userPassword);

    if (signedUser) {
        console.log('User identified');
        console.log('Weiterleitung nach summary.html');
        if (rememberMe) {
            saveData(signedUser);
        }
        window.location.href = 'summary.html?welcomeMsg=' + encodeURIComponent('Willkommen bei Join');
    } else {
        console.log('User not found');
        showDomOfFailedLogin();
    }
}

function saveData(user) {
    localStorage.setItem('rememberedUser', JSON.stringify({
        email: user.email,
        password: user.password
    }));
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
}, 2000);
}

function validateSignUpForm(){}