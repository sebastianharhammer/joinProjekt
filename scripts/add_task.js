const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let contacts = [];

function init() {
    getUsers();
    includeHTML(); 
    renderAddTaskHTML();
}

function createTask() {
    let title = document.getElementById('title');
    let description = document.getElementById('description');
    let date = document.getElementById('date');
    // let assingedUser = getUsers();
    // let category = getCategory();
    // let prio = getPrio();
    // let subtasks = getSubtasks();
    processTaskInformation(title.value, description.value, date.value)
}

function processTaskInformation(title, description, date) {

}

async function getUsers() {
    try {
        let response = await fetch(BASE_URL + "/contacts/.json", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        });
        let responseToJson = await response.json();
        contacts = responseToJson;
        returnArrayContacts();
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}
function returnArrayContacts() {
    if (!contacts) {
        console.error("No contacts found.");
        return;
    }
    const selectElement = document.getElementById('assigned-to');
    contacts.forEach(contact => {
        const option = document.createElement('option'); // Create a new option element
        option.value = contact.id; // Set the value to the contact's ID
        option.innerHTML = assignUserHTML(contact);
        selectElement.appendChild(option); // Append the option to the select element
    });
}


function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}
