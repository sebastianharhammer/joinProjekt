let signedUsersArrayLogin="[]";
let currentUser = null;

function init() {
    loadLoginContent();
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

function loadLoginContent(){
    let loginContent = document.getElementById('wholeLoginContent');
    loginContent.innerHTML = '';
    loginContent.innerHTML += getLoginTemplate();
}

function showStartSlide() {
    const logo = document.getElementById('logo');
    const headerLogo = document.querySelector('.v-hidden');
    setTimeout(() => {
        logo.classList.add('animate');
    }, 700);
    logo.classList.remove('d-none');
    setTimeout(() => {
        headerLogo.style.transition = 'none';
        headerLogo.offsetHeight;
        headerLogo.style.transition = 'opacity 2.5s ease-in-out';
        headerLogo.classList.remove('v-hidden');
        headerLogo.classList.add('fade-in');
    }, 1200);
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

function loginGuest(event){
    event.preventDefault();
    let guestUser = {
        firstName: "Guest",
        lastName: "User"
    }
    localStorage.setItem('currentUser',JSON.stringify(guestUser));
    currentUser = guestUser
    console.log("Gastbenutzer erfolgreich gesetzt:", currentUser);
    window.location.href = 'summary.html';
}

async function loginUser(event) {
    event.preventDefault();
    let userMail = document.getElementById('loginMailUser').value;
    let userPassword = document.getElementById('loginPasswordUser').value;
    let rememberMe = document.getElementById('checkboxLogin').checked;
    let signedUser = signedUsersArrayLogin.find(u => u.email === userMail && u.password === userPassword);
    if (signedUser) {
        try {
            await changeLoginStatus(signedUser);
            localStorage.setItem('currentUser', JSON.stringify(signedUser));
            currentUser = signedUser;
            console.log("Aktueller Benutzer:", currentUser);
            if (rememberMe) {
                saveData(signedUser);
            }
            forwardToSummary(signedUser);
        } catch (error) {
            console.error('Fehler beim Ändern des Login-Status:', error);
        }
    } else {
        console.log('User not found');
        showDomOfFailedLogin();
    }
}

function forwardToSummary(user) {
    const url = `summary.html?firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}`;
    window.location.href = url;
}



async function changeLoginStatus(signedUser) {
    try {
        const userPath = `/signed_users/user${signedUser.id}`;
        const response = await fetch(BASE_URL + userPath + ".json", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({isLoggedin: true})
        });
        
        if (response.ok) {
            console.log(`Login-Status für Benutzer ${signedUser.email} erfolgreich geändert.`);
        } else {
            console.error("fehler");
        }
    } catch (error) {
        console.error("Fehler beim Ändern des Login-Status:", error);
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