function onloadFunc(){
    loadUsers("signed_users");
}


const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/"
let signedUsersArray="[]";

async function loadUsers(path){
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    if (responseToJson) {
        signedUsersArray = Object.values(responseToJson);  
        console.log(signedUsersArray); 
    }
}

async function postSignUpData(path){
    let userFirstName = document.getElementById('loginFirstName').value;
    let userLastName = document.getElementById('loginLastName').value;
    let userMail = document.getElementById('loginMail').value;
    let userPassword = document.getElementById('loginPassword').value;
    let userPasswordConfirmed = document.getElementById('loginPasswordConfirm').value
    let userId = await getNextUserId(path);
    let checkBox = document.getElementById('registerCheckbox')
    if(userPasswordConfirmed === userPassword && checkBox.checked){
    let userData = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userMail,
        password: userPassword,
        id: userId,
        isLoggedin: false
    }
    let response = await fetch(BASE_URL + path + '/user' + userId + ".json",{
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData)
    })
    const responseToJson = await response.json();
    signedUsersArray.push(responseToJson);
    console.log(signedUsersArray);
    showSuccessOverlay();
    setTimeout(function() {
        window.location.href = 'login.html';
    }, 900);
}
else{
    console.log('Bitte akzeptiere die Privacy policy')
}
    }

function showSuccessOverlay(){
    let overlay = document.getElementById('overlaySignUpSuccess');
    overlay.classList.remove('d-none');
    overlay.classList.add('overlaySignUpSuccess-show');
    setTimeout(function(){
        overlay.classList.remove('overlaySignUpSuccess-show');
        overlay.classList.add('d-none');
    },900)

}

    function addUser(){
        let email = document.getElementById('loginMail');
        let password = document.getElementById('loginPassword');
        users.push({email: email.value, password: password.value});
        window.location.href = 'login.html?msg=Du hast dich erfolgreich registriert'
    }
    

function comparePasswords(){
    let paramToCompare = document.getElementById('loginPassword').value;
    let passwordConfirmValue = document.getElementById('loginPasswordConfirm').value;
    let passWordBorder = document.getElementById('passWordBorder');
    passWordBorder.classList.remove('defaultBorderInputSignUp', 'greenBorder');
    let foundPassword = false;
    if(paramToCompare === passwordConfirmValue){
    foundPassword = true;
    passWordBorder.classList.add('greenBorder');
    }else{
    foundPassword = false;
    passWordBorder.classList.add('redBorder');
    }
showResultsMessage(foundPassword)
validate();
}

function validate(){ 
    let userFirstName = document.getElementById('loginFirstName').value;
    let userLastName = document.getElementById('loginLastName').value;
    let userMail = document.getElementById('loginMail').value;
    let userPassword = document.getElementById('loginPassword').value;
    let userPasswordConfirmed = document.getElementById('loginPasswordConfirm').value;
    let checkBox = document.getElementById('registerCheckbox').checked;
    let signUpButton = document.getElementById('signUpButton');
    if (userFirstName && userLastName && userMail && userPassword && userPasswordConfirmed &&
        userPassword === userPasswordConfirmed && checkBox){
            signUpButton.disabled = false;
        }else{
            signUpButton.disabled = true;
        }
}



function showResultsMessage(foundPassword){
    let alertDiv = document.getElementById('alert-password');
    alertDiv.innerHTML = '';
    if(foundPassword){
        alertDiv.innerHTML += /*html*/`
            <p class="correctPasswordFont">Your password matches and is correct.</p>
            <p class="correctPasswordFontNotice">Accept the privacy policy and sign up to become a member.</p>
        `
    }
    else{
        alertDiv.innerHTML += /*html*/`
            <p class="alertPasswordFont">Your passwords don't match, please try again</p>
        `
    }
}

async function getNextUserId(path) {
    let response = await fetch(BASE_URL + path + ".json");
    let data = await response.json();
    let nextId = 1;

    if (data) {
        for (let key in data) {
            let userData = data[key];
            if (userData.id && !isNaN(userData.id)) {
                let idNumber = parseInt(userData.id, 10);
                if (idNumber >= nextId) {
                    nextId = idNumber+1;
                }
            }
        }
    }
    return nextId;
}




