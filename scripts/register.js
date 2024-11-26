function onloadFunc(){
    console.log('test');
    loadUsers("signed_users");
}


const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/"
const signedUsersArray="";

async function loadUsers(path){
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    console.log(responseToJson)
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

