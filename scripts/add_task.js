let categoriesContainerClick = false;
let contacts = [];
let selectedPriority = "medium";
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
    getUsers();
    includeHTML();
    renderAddTaskHTML();
    handleDropdownInteraction();
    setPriority('medium');
}


async function createTask(event) {
    event.preventDefault();
    let title = document.getElementById('title').value;
    const button = document.getElementById('add-task-create');
    let description = document.getElementById('description').value;
    let date = document.getElementById('addTaskInputDueDate').value;
        const category = categoryObject;
        const priority = selectedPriority;
        const subtasks = [...subtasksArr];
        const assignedUsers = [...assignedUserArr];
    if (validateTask(title, date, category)) {
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

function handleCancel(event) {
    event.preventDefault();
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('addTaskInputDueDate').value = '';
    document.getElementById('categoryInput').value = '';
    document.getElementById('subtaskInput').value = '';
    document.getElementById('subtasksContent').innerHTML = '';
    subtasksArr = [];
    assignedUserArr = [];
    categoryObject = '';
    selectedPriority = '';
    document.getElementById('assigned-users-short').innerHTML = '';
    setPriority('medium');
}


function validateTask(title, date, category) { 
    let exits = false;
    const button = document.getElementById('add-task-create');
    if (!title) {
        document.getElementById('addTitleError').innerHTML = "Title is required!";
        button.disabled = true;
        button.style.backgroundColor = "#000000";
        button.style.color = "#2B3647";
        setTimeout(() => {
            button.disabled = false;
            button.style.backgroundColor = "#2B3647";
            button.style.color = "#FFFFFF";
            document.getElementById('addTitleError').innerHTML = "";
        }, 3000);
        exits = true;
    }
    if (date < new Date().toISOString().split('T')[0]) {
        document.getElementById('addDateError').innerHTML = "Date can´t be in the past!";
        button.disabled = true;
        button.style.backgroundColor = "#000000";
        button.style.color = "#2B3647";
        setTimeout(() => {
            document.getElementById('addDateError').innerHTML = "";
            button.disabled = false;
            button.style.backgroundColor = "#2B3647";
            button.style.color = "#FFFFFF";
        }, 3000);
        exits = true;
    }
    if (!date) {
        document.getElementById('addDateError').innerHTML = "Date is required!";
        button.disabled = true;
        button.style.backgroundColor = "#000000";
        button.style.color = "#2B3647";
        setTimeout(() => {
            button.disabled = false;
            button.style.backgroundColor = "#2B3647";
            button.style.color = "#FFFFFF";
            document.getElementById('addDateError').innerHTML = "";
        }, 3000);
        exits = true;
    }
    if (!category) {
        document.getElementById('addCategoryError').innerHTML = "Category is required!";
        button.disabled = true;
        button.style.backgroundColor = "#000000";
        button.style.color = "#2B3647"; 
        setTimeout(() => {
            button.disabled = false;
            button.style.backgroundColor = "#2B3647";
            button.style.color = "#FFFFFF";
            document.getElementById('addCategoryError').innerHTML = "";
        }, 3000);
        exits = true;
    }
    return exits; 
}


function showAddTaskSuccesMessage() {
    let succes = document.getElementById('task-succes');
    let messageContainer = document.getElementById('task-message-container');
    messageContainer.classList.remove('d-none');
    succes.classList.add('show-add-task');
    setTimeout(() => {
        messageContainer.classList.add('d-none');
        succes.classList.remove('show-add-task');
    }, 750);
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
    } catch (error) {
        console.error("Failed to add task:", error);
    }
}


function handleDropdownInteraction() {
    const dropdown = document.getElementById('custom-dropdown');
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    dropdown.addEventListener('click', (e) => {
        const userContainer = e.target.closest('.assigned-user-container');
        if (userContainer) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        const isOpen = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isOpen ? 'none' : 'block';
    });
    optionsContainer.addEventListener('click', (event) => {
        const userContainer = event.target.closest('.assigned-user-container');
        if (!userContainer) return;
        event.stopPropagation();
        const checkbox = userContainer.querySelector('input[type="checkbox"]');
        const firstName = userContainer.dataset.firstname;
        const lastName = userContainer.dataset.lastname;
        const color = userContainer.dataset.color;
        const userIndex = assignedUserArr.findIndex(user => 
            user.firstName === firstName && 
            user.lastName === lastName
        );
        const isSelected = userIndex > -1;
        if (isSelected) {
            assignedUserArr.splice(userIndex, 1);
            checkbox.checked = false;
            userContainer.style.backgroundColor = '';
            userContainer.style.color = '';
            userContainer.style.borderRadius = '';
        } else {
            assignedUserArr.push({
                firstName,
                lastName,
                initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
                color
            });
            checkbox.checked = true;
            userContainer.style.backgroundColor = '#2b3647';
            userContainer.style.color = 'white';
            userContainer.style.borderRadius = '10px';
        }
        showAssignedUsers();
    });
}
function closeDropdown() {
    const optionsContainer = document.getElementById('dropdown-options');
    optionsContainer.style.display = 'none';
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
        finalContacts = responseToJson || {};
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
    returnArrayContacts()
}


function returnArrayContacts() {
    if (!finalContacts || Object.keys(finalContacts).length === 0) {
        console.error("No contacts found.");
        return;
    }
    const dropdown = document.getElementById('custom-dropdown');
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    optionsContainer.innerHTML = "";
    const contactsArray = Object.values(finalContacts);
    contactsArray.forEach(contactInDrop => {
        if (!contactInDrop || !contactInDrop.firstName || !contactInDrop.lastName) return;
        const optionHTML = assignUserHTML(contactInDrop);
        const optionElement = document.createElement("div");
        optionElement.classList.add("dropdown-contact");
        optionElement.innerHTML = optionHTML;
        optionsContainer.appendChild(optionElement);
    });
}


function assignUser(firstName, lastName, color) {
    const userExists = assignedUserArr.some(user => 
        user.firstName === firstName && 
        user.lastName === lastName
    );
    if (!userExists) {
        assignedUserArr.push({
            firstName: firstName,
            lastName: lastName,
            initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
            color: color
        });
        showAssignedUsers();
    }
}


function showAssignedUsers() {
    let assignUsersContainer = document.getElementById("assigned-users-short");
    assignUsersContainer.innerHTML = "";
    assignedUserArr.forEach((contact) => {
        assignUsersContainer.innerHTML += showAssignedUsersHTML(contact);
    });
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

function hideAddTaskCategoriesCategory() {
    categoriesContainerClick = true;
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(0deg)";
    categoryList.innerHTML = "";
}


function renderAddTaskCategories() {
    let categoryContainer = document.getElementById("dropDownCategoryMenu");
    for (let i = 0; i < addTaskcategories.length; i++) {
    const category = addTaskcategories[i]["category"];
    categoryContainer.innerHTML += renderAddTaskCategoriesHTML(category);
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
        const img = document.getElementById(`prio-image-${prio}`);
        btn.classList.remove(prio === 'urgent' ? 'red' : prio === 'medium' ? 'yellow' : 'green');
        img.classList.remove('sat-0');
    });
    const selectedButton = document.getElementById(`prio-${priority}`);
    const selectedImg = document.getElementById(`prio-image-${priority}`);
    selectedButton.classList.add(priority === 'urgent' ? 'red' : priority === 'medium' ? 'yellow' : 'green');
    selectedImg.classList.add('sat-0');
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
    const newSubtaskHTML = addSubtaskHTML(liId, spanId, inputId, subtaskInput);
    subtasksArr.push({
        checkbox_img: "../img/checkbox-empty.svg",
        subtask: `${subtaskInput.value}`,
        });
    subtasksEdit.push({
        checkbox_img: "../img/checkbox-empty.svg",
        subtask: `${subtaskInput.value}`,
    });
    subtasksContent.innerHTML += newSubtaskHTML;
    subtaskInput.value = "";
    }
    else {
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
            errorMessageSubtasks.innerHTML = "";
        }, 1500);
    }
    document.getElementById("clear-add-icons").classList.add("d-none");
    document.getElementById("subtasks-plus-icon").classList.remove("d-none");    
}


function editSubtask(liId, spanId, inputId) {
    const spanElement = document.getElementById(spanId);
    const li = document.getElementById(liId);
    const currentText = spanElement.textContent;
    const errorMessageSubtasks = document.getElementById("errorMessageSubtasks");
    if ( currentText.trim() !== "") {
        li.innerHTML = editSubtaskHTML(liId, spanId, inputId, currentText);
        li.classList.add("subtask-item-on-focus");
        li.classList.remove("subtask-item");
    } else {
        errorMessage
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
            errorMessageSubtasks.innerHTML = "";
        }, 3000);
    }
}


function deleteSubtask(liId) {
    const li = document.getElementById(liId);
    li.remove();
}


function saveSubtask(liId, inputId, spanId) {
    const li = document.getElementById(liId);
    const input = document.getElementById(inputId);
    if (input.value.trim() !== "") {
        li.innerHTML = saveSubtaskHTML(liId, inputId, spanId, input);
        li.classList.remove("subtask-item-on-focus");
        li.classList.add("subtask-item");
    } else {
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
            errorMessageSubtasks.innerHTML = "";
        }, 1500);
    }
}

  
function clearSubtaskInput() {
    const input = document.getElementById("subtaskInput");
    input.value = "";
    
}


function showClearButton() {
        document.getElementById("clear-add-icons").classList.remove("d-none");
        document.getElementById("subtasks-plus-icon").classList.add("d-none");
}
