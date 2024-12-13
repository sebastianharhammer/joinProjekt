
let categoriesContainerClick = false;
let contacts = [
    { id: 0, firstName: "Mario", lastName: "Plumber", email: "mario.plumber@nintendo.com", phone: "111111" },
    { id: 1, firstName: "Link", lastName: "Hyrule", email: "link.hero@zelda.com", phone: "222222" },
    { id: 2, firstName: "Samus", lastName: "Aran", email: "samus.aran@metroid.com", phone: "333333" },
    { id: 3, firstName: "Sonic", lastName: "Hedgehog", email: "sonic.speed@sega.com", phone: "444444" },
    { id: 4, firstName: "Lara", lastName: "Croft", email: "lara.croft@tombraider.com", phone: "555555" },
    { id: 5, firstName: "Geralt", lastName: "Rivia", email: "geralt.rivia@witcher.com", phone: "666666" },
    { id: 6, firstName: "Master", lastName: "Chief", email: "master.chief@halo.com", phone: "777777" },
    { id: 7, firstName: "Pikachu", lastName: "Electric", email: "pikachu.pokemon@kanto.com", phone: "888888" },
    { id: 8, firstName: "Cloud", lastName: "Strife", email: "cloud.strife@finalfantasy.com", phone: "999999" },
    { id: 9, firstName: "Kratos", lastName: "Spartan", email: "kratos.godwar@sparta.com", phone: "101010" },
    { id: 10, firstName: "Nathan", lastName: "Drake", email: "nathan.drake@uncharted.com", phone: "121212" },
    { id: 11, firstName: "Ellie", lastName: "Williams", email: "ellie.williams@tlou.com", phone: "131313" },
    { id: 12, firstName: "Chun", lastName: "Li", email: "chun.li@streetfighter.com", phone: "141414" },
    { id: 13, firstName: "Solid", lastName: "Snake", email: "solid.snake@metalgear.com", phone: "151515" },
    { id: 14, firstName: "Ryu", lastName: "Fighter", email: "ryu.fighter@streetfighter.com", phone: "161616" },
    { id: 15, firstName: "Zelda", lastName: "Princess", email: "zelda.princess@hyrule.com", phone: "171717" },
    { id: 16, firstName: "Arthur", lastName: "Morgan", email: "arthur.morgan@rdr.com", phone: "181818" },
    { id: 17, firstName: "Doom", lastName: "Slayer", email: "doom.slayer@hell.com", phone: "191919" },
    { id: 18, firstName: "Cortana", lastName: "AI", email: "cortana.ai@halo.com", phone: "202020" },
    { id: 19, firstName: "Ezio", lastName: "Auditore", email: "ezio.auditore@ac.com", phone: "212121" },
    { id: 20, firstName: "Bayonetta", lastName: "Witch", email: "bayonetta.witch@platinumgames.com", phone: "222222" },
    { id: 21, firstName: "Gordon", lastName: "Freeman", email: "gordon.freeman@halflife.com", phone: "232323" },
    { id: 22, firstName: "Shepard", lastName: "Commander", email: "shepard.commander@masseffect.com", phone: "242424" },
    { id: 23, firstName: "Tifa", lastName: "Lockhart", email: "tifa.lockhart@finalfantasy.com", phone: "252525" }
];
let selectedPriority = "";
let subtasksArr = [];
let assignedUserArr = [];
let localTasks = [];
let subtaskIdCounter = 0;
let subtasksEdit = [];
let subtasksEdit_done = [];
let subtasksArr_done = [];
let categoryObject = "";
let addTaskcategories = [
    { category: "User Story",
        "bg-color": "#0038FF",
      },
      {
        category: "Technical Task",
        "bg-color": "#1FD7C1",
      }];
  let assignedUser = [];


function init() {
    getTasks();
    //getUsers();
    
    includeHTML(); 
    renderAddTaskHTML();
    returnArrayContacts();
}

function getRandomColor() {
    const colors = ["orange", "purple", "blue", "red", "green", "teal"];
    return colors[Math.floor(Math.random() * colors.length)];
  }


async function createTask(status, event) {
    event.preventDefault();
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let date = document.getElementById('addTaskInputDueDate').value;
    const category = categoryObject;
    const priority = selectedPriority;
    const subtasks = [...subtasksArr];
    const assignedUsers = [...assignedUserArr];

    if (!title || !description || !date || !priority /*|| assignedUsers.length === 0) */ ){
        console.error("All fields are required!");
        return;
    }

    try {
        const nextId = await getNextTaskId();
        let newTask = {
            id: nextId,
            status: "todo",
            title: title,
            description: description,
            date: date,
            taskCategory: category || "Undefined Category",
            prio: priority,
            subtasks: subtasks,
            owner: assignedUsers
        };
        taskArray.push(newTask);
        await pushTaskToFirebase(newTask);
        showAddTaskSuccesMessage();
        setTimeout(() => {
            window.location.href = "testboard.html";
          }, 1500);
        
    } catch (error) {
        console.error("Failed to create the task:", error);
    }
}

function showAddTaskSuccesMessage() {
    let succes = document.getElementById('task-succes');
    succes.classList.add('show-add-task');
}




async function getNextTaskId() {
    try {
        const response = await fetch(BASE_URL + "/tasks.json", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Error! Status: ${response.status}`);
        }
        const tasks = await response.json();
        const taskIds = tasks ? Object.values(tasks).map(task => task.id) : [];
        const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0;
        return maxId + 1;
    } catch (error) {
        console.error("Failed to fetch tasks for ID generation:", error);
        return 20;
    }
}


async function pushTaskToFirebase(newTask) {
    try {
        let key = newTask.id;  
        let response = await fetch(BASE_URL + `/tasks/${key}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });
        let responseToJson = await response.json();
        console.log("Task added", responseToJson);
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
/*
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
*/
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
    assignedUserArr.push({
        firstName: firstName,
        lastName: lastName,
        initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`
    });
    showAssignedUsers();
}

function showAssignedUsers() {
    let assignUsers = document.getElementById('assigned-users-short');
    assignUsers.innerHTML = "";
    for (let i=0; i < assignedUserArr.length; i++) {
        assignUsers.innerHTML += showAssignedUsersHTML(assignedUserArr[i]);
    }
}


function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}


function openAddTaskCategories() {
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(180deg)";
    categoryList.innerHTML = "";
    if (!categoriesContainerClick) {
    categoriesContainerClick = true;
    categoryList.style.border = "1px solid #CDCDCD";
    renderAddTaskCategories();
    } else {
    categoriesContainerClick = false;
    categoryList.style.border = "0px";
    hideAddTaskCategories();
    }
    document.getElementById("categoryInput").classList.toggle("outline");}

function hideAddTaskCategories() {
    categoriesContainerClick = false;
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(0deg)";
    categoryList.innerHTML = "";
}

function renderAddTaskCategories() {
    let categoryContainer = document.getElementById("dropDownCategoryMenu");

    for (let i = 0; i < addTaskcategories.length; i++) {
    const category = addTaskcategories[i]["category"];

    categoryContainer.innerHTML += `
        <div class="addtask-category" onclick="selectAddTaskCategory('${category}')">
        ${category}
        </div>
        `;
    }
}
function selectAddTaskCategory(categoryTask) {
    let categoryInput = document.getElementById("categoryInput");
    let categoryList = document.getElementById("dropDownCategoryMenu");

    categoryInput.value = categoryTask;
    hideAddTaskCategories();
    categoryList.style.border = "0px";
    categoryObject = categoryTask;
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
    const subtaskInput = document.getElementById("subtaskInput");
    const subtasksContent = document.getElementById("subtasksContent");

    if (subtaskInput.value.trim() !== "") {
        subtaskIdCounter++;
        const liId = "subtask-" + subtaskIdCounter;
        const spanId = "span-" + subtaskIdCounter;
        const inputId = "input-" + subtaskIdCounter;

    
        const newSubtaskHTML = /*html*/ `
        <li id="${liId}" class="subtask-item">
            <div class="dot"></div>
            <div class="subtask-text">
                <span id="${spanId}" onclick="editSubtask('${liId}', '${spanId}', '${inputId}')">${subtaskInput.value}</span>
            </div>
            <div class="subtask-icon">
                <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="../img/edit.svg" alt="edit">
                <div class="divider"></div>
                <img onclick="deleteSubtask('${liId}')" src="../img/delete.svg" alt="delete">
            </div>
        </li>
        `;

        subtasksArr.push({
            subtask: subtaskInput.value,
            checkbox_img: "../assets/img/checkbox-empty.svg",
            checkbox: false
        });

        subtasksEdit.push({
            subtask: subtaskInput.value,
            checkbox_img: "../assets/img/checkbox-empty.svg",
            checkbox: false
        });

        subtasksContent.innerHTML += newSubtaskHTML;

        subtaskInput.value = "";
    }
    document.getElementById("clear-add-icons").classList.add("d-none");
    document.getElementById("subtasks-plus-icon").classList.remove("d-none");
}


function editSubtask(liId, spanId, inputId) {
    const spanElement = document.getElementById(spanId);
    const li = document.getElementById(liId);
    const currentText = spanElement.textContent;

    const editSubtaskHTML = /*html*/ `
        <div class="subtask-input-wrapper edit-mode">
            <input id="${inputId}" class="edit-subtask-input" type="text" value="${currentText}">
            <div class="input-icons-edit">
                <img src ="../assets/img/deletecopy.svg" onclick="deleteSubtask('${liId}')">
                <div class="divider"></div>
                <img src="../assets/img/check1.svg" onclick="saveSubtask('${liId}', '${inputId}', '${spanId}')">
            </div>
        </div>
    `;
}

function deleteSubtask(liId) {
    const li = document.getElementById(liId);
    li.remove();
}


function showClearButton() {
    document.getElementById("clear-add-icons").classList.remove("d-none");
    document.getElementById("subtasks-plus-icon").classList.add("d-none");
}

function clearSubtaskInput() {
    document.getElementById("subtaskInput").value = "";
}
