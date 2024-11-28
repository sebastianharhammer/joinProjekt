function onloadFunc(){
    console.log('test');
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
    let userId = await getNextUserId(path)
    let checkBox = document.getElementById('registerCheckbox')
    if(userPasswordConfirmed === userPassword && checkBox){
    let userData = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userMail,
        password: userPassword,
        id: userId
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
}
else{
    console.log('Bitte akzeptiere die Privacy policy')
}
    }


function comparePasswords(){
    let paramToCompare = document.getElementById('loginPassword').value;
    let passwordConfirmValue = document.getElementById('loginPasswordConfirm').value;
    let passWordBorder = document.getElementById('passWordBorder');
    let foundPassword = false;
    if(paramToCompare === passwordConfirmValue){
    foundPassword = true;
    passWordBorder.classList.remove('defaultBorderInputSignUp');
    passWordBorder.classList.add('greenBorder')
    }else{
    foundPassword = false;
    passWordBorder.classList.remove('defaultBorderInputSignUp');
    passWordBorder.classList.add('redBorder')
    }
showResultsMessage(foundPassword)
}

function showResultsMessage(foundPassword){
    let alertDiv = document.getElementById('alert-password');
    alertDiv.innerHTML = '';
    if(foundPassword){
        alertDiv.innerHTML += /*html*/`
            <p>Passswort stimmt</p>
        `
    }
    else{
        alertDiv.innerHTML += /*html*/`
            <p>Das Passwort stimmt nicht überein</p>
        `
    }
}

async function getNextUserId(path){
    let response = await fetch(BASE_URL + path + ".json");
    let data = await response.json();
    let nextId = 1;
    if(data){
        for (let key in data) {
            let userData = data[key];
            if (userData.id >= nextId) {
                nextId = userData.id + 1;
            }
        }
    }
    return nextId;
}




let users = [
    {'email': 'daniel@test.de', 'password': 'test 123'}
]

function addUser(){
    let email = document.getElementById('loginMail');
    let password = document.getElementById('loginPassword');
    users.push({email: email.value, password: password.value});
    window.location.href = 'login.html?msg=Du hast dich erfolgreich registriert'
}


