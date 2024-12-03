const BASE_URL = "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let contacts = [];
let selectedPriority = "";
let subtasksArr = [];
let assignedUser = [];
let localTasks = [];

function init() {
    getTasks();
    getUsers();
    includeHTML(); 
    renderAddTaskHTML();
}



function createTask(status) {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let date = document.getElementById('due-date').value;

    const category = getCategory();
    const priority = selectedPriority;
    const subtasks = [...subtasksArr];
    const assignedUsers = assignedUser;

    if (!title || !description || !date || !priority || assignedUsers.length === 0) {
        console.error("All fields are required!");
        return;
    }

    let newTask = {
        id: localTasks.length,
        status: status,
        title: title,
        description:description,
        date:date,
        taskCategory:category,
        priority:priority,
        subtasks:subtasks,
        owner:assignedUser,
    };
    localTasks.push(newTask);
    pushTaskToFirebase(newTask);
    console.log('Task created:', newTask);
}

async function pushTaskToFirebase(newTask) {
    try {
        let key = newTask.id;  
        let response = await fetch(BASE_URL + `/testingTasks/${key}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });
        let responseToJson = await response.json();
        console.log("Task added or updated:", responseToJson);
    } catch (error) {
        console.error("Failed to add task:", error);
    }
}




function handleDropdownInteraction() {
    const dropdown = document.getElementById('custom-dropdown');
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    const selectedUsers = [];

    dropdown.addEventListener('click', () => {
        const isOpen = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isOpen ? 'none' : 'block';
    });
    optionsContainer.addEventListener('change', (event) => {
        const checkbox = event.target;
        const userName = checkbox.parentElement.querySelector('span').textContent;

        if (checkbox.checked) {
            selectedUsers.push(userName);
        } else {
            const index = selectedUsers.indexOf(userName);
            if (index > -1) {
                selectedUsers.splice(index, 1);
            }
        }

        console.log('Selected users:', selectedUsers);
    });
}

async function getTasks() {
    try {
        let response = await fetch(BASE_URL + "/testingTasks/.json", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let responseToJson = await response.json();
        localTasks = responseToJson;
        console.log("Array Tasks: " + localTasks)
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

async function getUsers() {
    try {
        let response = await fetch(BASE_URL + "/contacts/.json", {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let responseToJson = await response.json();
        contacts = responseToJson;
        returnArrayContacts();
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

function returnArrayContacts() {
    if (!contacts || contacts.length === 0) {
        console.error("No contacts found.");
        return;
    }

    const dropdown = document.getElementById('custom-dropdown');
    if (!dropdown) {
        console.error("Dropdown element not found.");
        return;
    }

    const optionsContainer = dropdown.querySelector('.dropdown-options');
    optionsContainer.innerHTML = ""; 

    contacts.forEach(contact => {

        if (!contact || !contact.firstName || !contact.lastName) {
            console.warn('Skipping invalid contact:', contact);
            return;
        }

        const option = document.createElement('div');
        option.classList.add('assigned-user');
        option.innerHTML = assignUserHTML(contact);
        optionsContainer.appendChild(option);
    });

    dropdown.addEventListener('click', () => {
        const isOpen = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isOpen ? 'none' : 'block';
    });


}
function assignUser(firstName, lastName) {
    assignedUser.push({
        "Firstname":firstName,
        "Lastname":lastName
    });
}

function showAssignedUsers() {
    let assignUsers = document.getElementById('assigned-users-short');
    for (let i=0; i < assignedUser.length; i++) {
        assignUsers.innerHTML += showAssignedUsersHTML(assignUsers[i]);
    }
}


function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}

function getCategory() {
    const category = document.getElementById('category');
    return category.value;
}

function setPriority(priority) {
    const priorities = ['urgent', 'medium', 'low'];
    priorities.forEach((prio) => {
        const btn = document.getElementById(`prio-${prio}`);
        btn.classList.remove(prio === 'urgent' ? 'red' : prio === 'medium' ? 'yellow' : 'green');
    });
    const selectedButton = document.getElementById(`prio-${priority}`);
    selectedButton.classList.add(priority === 'urgent' ? 'red' : priority === 'medium' ? 'yellow' : 'green');
    selectedPriority = priority;
}

function addSubtask() {
    let subtask = document.getElementById('subtasks');
    let tempSub = document.getElementById('temp-subtasks-container');
    tempSub.innerHTML += `<span class="subtasks">- ${subtask.value}</span><br>`;
    subtasksArr.push(subtask.value);
    subtask.value = "";
    
}

