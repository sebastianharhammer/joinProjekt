let currentUser = null;

function init() {
    includeHTML();
    loadCurrentUser();
    fetchTasks("/tasks");
    loadBoardNavigator();
}



let currentDraggedElement;

function loadCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        console.log(currentUser)
    }
}

async function fetchTasks(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    console.log(responseToJson)
    if (responseToJson) {
        taskArray = Object.values(responseToJson);
    }
    console.log(taskArray)
    updateTaskHTML();
}

function startDragging(id) {
    currentDraggedElement = id;
}

function allowDrop(event) {
    event.preventDefault();
}

async function moveTo(category) {
    const taskIndex = taskArray.findIndex(task => task.id === currentDraggedElement);
    if (taskIndex !== -1) {
        taskArray[taskIndex].status = category;
        if (currentUser.firstName === "Guest" && currentUser.lastName === "User") {
            console.log("Gastbenutzer verschiebt Aufgabe lokal.");
            updateTaskHTML();
        }
        else {
            console.log("Registrierter Benutzer aktualisiert Firebase.");
            await updateTaskInFirebase(taskArray[taskIndex]);
            updateTaskHTML();
        }
    }
}

async function updateTaskInFirebase(task) {
    const taskId = task.id;
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        });
        console.log(`Task ${taskId} erfolgreich aktualisiert.`);
    } catch (error) {
        console.error(`Fehler beim Aktualisieren des Tasks ${taskId}:`, error);
    }
}


function loadBoardNavigator() {
    let content = document.getElementById('wholeBoard');
    content.innerHTML = '';
    content.innerHTML += getBoardNavigatorHTML();
    loadTitleOfBoardColumns(content);
}

function getBoardNavigatorHTML() {
    return /*html*/`
<section class="boardNavigator">
    <div class="searchAndAddTasks">
        <p class="boardFont">BOARD</p>
        <div class="inputAndButtonBoard">
            <div class="searchAreaBoard">
            <input id="filterTask" onkeyup="filterTaskFunction()" class="inputBoard" type="text" placeholder="Find Task">
            <span class="verticalLine">|</span>
            <img src="./img/search.png" alt="">
            </div>
            <div class="addTaskButtonBoard" onclick="showAddTask('to-do')">
                <p class="buttonBoardFont">Add Task +</p>
            </div>
        </div>
    </div>
</section>
    `
}

function filterTaskFunction() {
    let myFilter = document.getElementById('filterTask').value.toLowerCase();
    if (myFilter.length < 1) {
        for (let i = 0; i < taskArray.length; i++) {
            let wholeTask = document.getElementById(`boardTask${taskArray[i].id}`);
            if (wholeTask) {
                wholeTask.style.display = '';
            }
        }
        return;
    }
    for (let i = 0; i < taskArray.length; i++) {
        let paramToFind = document.getElementById(`title${taskArray[i].id}`);
        let param2ToFind = document.getElementById(`description${taskArray[i].id}`);
        let wholeTask = document.getElementById(`boardTask${taskArray[i].id}`);
        if (paramToFind || param2ToFind && wholeTask) {
            if (paramToFind.innerText.toLowerCase().includes(myFilter) || param2ToFind.innerText.toLowerCase().includes(myFilter)) {
                wholeTask.style.display = '';
            } else {
                wholeTask.style.display = 'none';
            }
        }
    }
}

function loadTitleOfBoardColumns(content) {
    content.innerHTML += showTitleOfBoardColumns();
    getColumns(content);
}

function showTitleOfBoardColumns() {
    return /*html*/`
        <section id="titleOfBoardColumns" class="titleOfBoardColumns">
<div onclick=addTaskToColumnOverlay() class="columntitleToDo">
    <p class="columnTitleFont">To do</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('todo')">
</div>
<div onclick=addTaskToColumnOverlay() class="columntitleInProgress">
    <p class="columnTitleFont">In Progress</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('inProgress')">
</div>
<div onclick=addTaskToColumnOverlay() class="columntitleAwaitFeedback">
    <p class="columnTitleFont">Await Feedback</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('feedback')">
</div>
<div onclick=addTaskToColumnOverlay() class="columntitleDone">
    <p class="columnTitleFont">Done</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('done')">
</div>
</section>
    `
}

function getColumns(content) {
    content.innerHTML += getColumnsHTML();
}

function getColumnsHTML() {
    return /*html*/ `
        <section class="tasksContent">
            <div class="dragarea-todo" id="todo" 
                ondrop="moveTo('todo')" 
                ondragleave="removeHighlight('todo')" 
                ondragover="allowDrop(event); highlight('todo')"></div>
            
            <div class="dragarea-inProgress" id="inProgress" 
                ondrop="moveTo('inProgress')" 
                ondragleave="removeHighlight('inProgress')" 
                ondragover="allowDrop(event); highlight('inProgress')"></div>
            
            <div class="dragarea-feedback" id="feedback" 
                ondrop="moveTo('feedback')" 
                ondragleave="removeHighlight('feedback')" 
                ondragover="allowDrop(event); highlight('feedback')"></div>
            
            <div class="dragarea-done" id="done" 
                ondrop="moveTo('done')" 
                ondragleave="removeHighlight('done')" 
                ondragover="allowDrop(event); highlight('done')"></div>
        </section>
    `;
}



function updateTaskHTML() {
    let todoColumn = document.getElementById("todo");
    let inProgressColumn = document.getElementById("inProgress");
    let feedbackColumn = document.getElementById("feedback");
    let doneColumn = document.getElementById("done");
    todoColumn.innerHTML = '';
    inProgressColumn.innerHTML = '';
    feedbackColumn.innerHTML = '';
    doneColumn.innerHTML = '';
    let todos = taskArray.filter(task => task.status === "todo");
    let inProgress = taskArray.filter(task => task.status === "inProgress");
    let feedback = taskArray.filter(task => task.status === "feedback");
    let done = taskArray.filter(task => task.status === "done");
    for (const task of todos) {
        todoColumn.innerHTML += createTaskHTML(task);
        createOwnerCircles(task);
        findClassOfTaskCat(task);
        findPrioIcon(task)
        findAmountOfSubtasks(task)
    }
    for (const task of inProgress) {
        inProgressColumn.innerHTML += createTaskHTML(task);
        createOwnerCircles(task);
        findClassOfTaskCat(task);
        findPrioIcon(task)
        findAmountOfSubtasks(task)
    }
    for (const task of feedback) {
        feedbackColumn.innerHTML += createTaskHTML(task);
        createOwnerCircles(task);
        findClassOfTaskCat(task);
        findPrioIcon(task)
        findAmountOfSubtasks(task)
    }
    for (const task of done) {
        doneColumn.innerHTML += createTaskHTML(task);
        createOwnerCircles(task);
        findClassOfTaskCat(task);
        findPrioIcon(task)
        findAmountOfSubtasks(task)
    }
    if (todoColumn.children.length === 0) {
        createNoToDosdiv()
    }
}

function createNoToDosdiv() {
    document.getElementById('todo').innerHTML += /*html*/`
        <div class="noTasks">
            <p class="font-no-tasks">NO TASKS TO DO</p>
        </div>
    `
}

function createOwnerCircles(task) {
    let userNameCircles = document.getElementById(`userNameCircles-${task.id}`);
    userNameCircles.innerHTML = '';

    if (!task.owner || !Array.isArray(task.owner) || task.owner.length === 0) {
        userNameCircles.innerHTML = `
            <svg width="34" height="34">
                <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="gray" />
                <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">N/A</text>
            </svg>
        `;
        return;
    }

    for (let owner of task.owner) {
        userNameCircles.innerHTML += `
            <svg width="34" height="34">
                <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${getRandomColor()}" />
                <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
                    ${owner.initials || "N/A"}
                </text>
            </svg>
        `;
    }
}



function findClassOfTaskCat(task) {
    const taskButton = document.getElementById(`taskButton-${task.id}`);
    const category = task.taskCategory || "Undefined Category";

    taskButton.classList.remove("task-category-technicalTask", "task-category-userExperience", "task-category-undefined");
    if (category === "Technical Task") {
        taskButton.classList.add("task-category-technicalTask");
    } else if (category === "User Story") {
        taskButton.classList.add("task-category-userExperience");
    } else {
        taskButton.classList.add("task-category-undefined");
    }
    taskButton.textContent = category;
}



function findPrioIcon(task) {
    let prioIcon = document.getElementById(`priority-${task.id}`);
    if (task.prio === "medium") {
        prioIcon.src = "./img/prio-mid.png"
    } else if (task.prio === "urgent") {
        prioIcon.src = "./img/prio-high.png"
    } else {
        prioIcon.src = "./img/prio-low.png"
    }
}



function getSubTasks(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return "";
    }
    let subtTasksHTML = "";
    for (let i = 0; i < task.subtasks.length; i++) {
        let subtask = task.subtasks[i];
        subtTasksHTML += /*html*/ `
            <div class="eachSubtaskBox">
                <input type="checkbox" id="subtask-${task.id}-${i}" onchange="updateCompletedSubtasks(${task.id})">
                <label for="subtask-${task.id}-${i}">${subtask}</label>
            </div>
        `;
    }
    return subtTasksHTML;
}

function updateCompletedSubtasks(taskId) {
    const task = taskArray.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const completedCount = task.subtasks.filter(subtask => subtask.checkbox).length;
    const totalSubtasks = task.subtasks.length;

    const renderCompleted = document.getElementById(`amountOfSubtasks-${taskId}`);
    if (renderCompleted) {
        renderCompleted.innerHTML = `${completedCount} / ${totalSubtasks} Subtasks`;
    }

    const progressBar = document.getElementById(`progress-${taskId}`);
    if (progressBar) {
        progressBar.value = (completedCount / totalSubtasks) * 100;
    }
}


function findAmountOfSubtasks(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return "0";
    }
    return task.subtasks.length;
}



function createTaskHTML(task) {
    const owners = getOwners(task);
    const subtasks = getSubTasks(task);
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const completedSubtasks = task.subtasks ? task.subtasks.filter(subtask => subtask.checkbox).length : 0;

    return /*html*/`
        <div onclick=showTaskCard(${task.id}) id="boardTask${task.id}" class="todo" draggable ="true" ondragstart="startDragging(${task.id})">
        <div id="taskButton-${task.id}">
        <p class="open-sans">${task.taskCategory}</p>
        </div>
        <p id="title${task.id}" class= "open-sans-bold">${task.title}</p>
        <p id="description${task.id}" class="inter-font">${task.description}</p>
        <div class="progressBarDiv">
        <progress id="progress-${task.id}" class="progressBarBoard" value="${(completedSubtasks / totalSubtasks) * 100}" max="100"></progress>
        <p id="amountOfSubtasks-${task.id}" class="inter-font">${completedSubtasks} / ${totalSubtasks} Subtasks</p>
        </div>

        <section class="namesAndPrio">
        <div class="userNameCircles" id="userNameCircles-${task.id}">
        </div>
        <div >
        <img id="priority-${task.id}"  src="./img/prio-mid.png" alt="">
        </div>
        </section>
        </div>
    `;
}


function showTaskCard(id) {
    const task = taskArray.find(task => task.id === id);
    if (!task) {
        console.error(`Task mit ID ${id} nicht gefunden.`);
        return;
    }
    let taskCardOverlay = document.getElementById('taskDetailView');
    taskCardOverlay.innerHTML = '';
    taskCardOverlay.classList.remove('d-none');
    taskCardOverlay.innerHTML += showTaskCardHTML(task);
}

function showTaskCardHTML(task) {
    return /*html*/`
        <div id="currentTaskCard${task.id}" class="currentTaskCard">
            ${getTaskCategoryButtonHTML(task)}
            ${getTaskDetailsHTML(task)}
            <div class="taskOwnersSection">
                <p class="firstTableColumnFont">Assigned To:</p>
                <div class="assignedOwnersContainer">
                    ${getAssignedOwnersHTML(task)}
                </div>
            </div>
        </div>
    `;
}


function getTaskCategoryButtonHTML(task) {
    return /*html*/`
        <div class="headAreaTaskcard">
            <div id="taskButton-${task.id}" class="${getTaskCategoryClass(task.taskCategory)}">
                ${task.taskCategory}
            </div>
            <div class="closeCardParent">
                <img class="closeCard" onclick="closeDetailView()" src="./img/close.svg" alt="">
            </div>
        </div>
    `;
}

function getTaskDetailsHTML(task) {
    return /*html*/`
        <p class="boardFontDetail">${task.title}</p>
        <p class="description-taskCard">${task.description}</p>
        <table class="dueDateAndPrio">
            <tbody>
                <tr>
                    <td class="firstTableColumnFont">Due date:</td>
                    <td>${task.date}</td>
                </tr>
                <tr>
                    <td class="firstTableColumnFont">Priority:</td>
                    <td>${task.prio} <img class="prioIconCard" src="${getPrioIcon(task.prio)}" alt=""></td>                   
                </tr>
            </tbody>
        </table>
        <div class="cardSubtasks">
            <p class="firstTableColumnFont">Subtasks</p>
            ${getSubtasksHTML(task)}
        </div>
        <div class="editAndDelete">
            <div class="deleteCard" onclick="askFordeleteTask()">
                <img class="deleteIcon" src="./img/delete.svg" alt="">
                <p class="editDeleteFont">Delete</p>
            </div>
            <div onclick="showEditTaskTempl(${task.id})" class="deleteCard">
            <img class="editIcon" src="./img/edit.svg" alt="">
            <p class="editDeleteFont">Edit</p>
            </div>
        </div>
            <div class="deleteConfirmation d-none" id="deleteConfirmation">
            <p class="deleteHeaderFont">Bist du dir sicher?</p>
            <div class="confirmation-delete-buttons">
                <button class="deleteTaskButtons" onclick="deleteTask(${task.id})">Ja, löschen</button>
                <button class="deleteTaskButtons" onclick="closeQuestionDelete()">Nein, zurück</button>
            </div>
        </div>
    `;
}

function askFordeleteTask() {
    let deleteDiv = document.getElementById('deleteConfirmation');
    deleteDiv.classList.remove('d-none');
}


async function deleteTask(taskId) {
    const taskIndex = taskArray.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        console.error(`Task mit ID ${taskId} nicht gefunden.`);
        return;
    }
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
            method: "DELETE"
        });
        console.log(`Task ${taskId} erfolgreich gelöscht.`);

        taskArray.splice(taskIndex, 1);
        closeDetailView()
        updateTaskHTML();
    } catch (error) {
        console.error(`Fehler beim Löschen des Tasks ${taskId}:`, error);
    }
}

function closeDetailView() {
    let overlay = document.getElementById('taskDetailView');
    overlay.classList.add('d-none');
}

function closeQuestionDelete() {
    let deleteQuestDiv = document.getElementById('deleteConfirmation');
    deleteQuestDiv.classList.add('d-none')
}

function getSubtasksHTML(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
    }
    let subtasksHTML = "";
    task.subtasks.forEach((subtask, index) => {
        subtasksHTML += /*html*/`
            <div class="subtaskItem">
                <input 
                    type="checkbox" 
                    id="subtask-${task.id}-${index}" 
                    class="styledCheckbox"
                    ${subtask.checkbox ? "checked" : ""} 
                    onchange="toggleSubtaskCheckbox(${task.id}, ${index}); updateCompletedSubtasks(${task.id})"
                >
                <label for="subtask-${task.id}-${index}" class="styledCheckboxLabel">
                    <span class="checkboxSquare"></span>
                    <p class="subtaskText">${subtask.subtask || "Unnamed Subtask"}</p>
                </label>
            </div>
            `
            ;
    });
    return subtasksHTML;
}



async function toggleSubtaskCheckbox(taskId, subtaskIndex) {
    const task = taskArray.find(task => task.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
        console.error("Task oder Subtask nicht gefunden.");
        return;
    }

    const subtask = task.subtasks[subtaskIndex];
    subtask.checkbox = !subtask.checkbox;

    try {
        await updateTaskInFirebase(task);
        console.log(`Subtask ${subtaskIndex} von Task ${taskId} erfolgreich aktualisiert.`);
    } catch (error) {
        console.error(`Fehler beim Aktualisieren des Subtasks: ${error}`);
    }
    updateTaskHTML();
}



function getAssignedOwnersHTML(task) {
    if (!task.owner || task.owner.length === 0) {
        return `<p class="noOwners">Keine Owner zugewiesen</p>`;
    }
    let ownerHTML = "";
    task.owner.forEach(owner => {
        const circleColor = getRandomColor();
        ownerHTML += `
            <div class="ownerItem">
                <svg width="34" height="34">
                    <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${circleColor}" />
                    <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
                        ${owner.initials || "N/A"}
                    </text>
                </svg>
                <p>${owner.firstName} ${owner.lastName}</p>
            </div>
        `;
    });
    return ownerHTML;
}


function getRandomColor() {
    const colors = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#FFC300",
        "#8E44AD",
        "#16A085",
        "#E74C3C",
        "#2ECC71",
        "#3498DB",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getPrioIcon(prio) {
    if (prio === "medium") {
        return "./img/prio-mid.png";
    } else if (prio === "urgent") {
        return "./img/prio-high.png";
    } else {
        return "./img/prio-low.png";
    }
}

function getTaskCategoryClass(taskCategory) {
    if (taskCategory === "Technical Task") return "task-category-technicalTask-taskCard";
    if (taskCategory === "User Story") return "task-category-userExperience-taskCard";
    return "task-category-undefined";
}



function addTaskToColumnOverlay(id) {
    let overlayDetailedTask = document.getElementById('overlayDetailedSite');
    overlayDetailedTask.innerHTML = '';
    overlayDetailedTask.classList.remove('d-none')
    overlayDetailedTask.innerHTML += addTaskOverlayHTML(id)
}

function closeDetailView() {
    let taskCardOverlay = document.getElementById('taskDetailView');
    taskCardOverlay.classList.add('d-none');
}


function highlight(id) {
    document.getElementById(id).classList.add("dragAreaHighlight");
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove("dragAreaHighlight");
}


// edit task 

function showEditTaskTempl(taskId) {
    const task = taskArray.find(t => t.id === taskId);
    if (!task) {
        console.error("Task nicht gefunden!");
        return;
    }
    let detailView = document.getElementById('taskDetailView');
    let editView = document.getElementById('editTaskTempl');
    detailView.classList.add('d-none');
    editView.classList.remove('d-none');
    editView.innerHTML = '';
    editView.innerHTML += getEditTemplate(task);
    getUsersForEditDropDown()
}

async function getUsersForEditDropDown() {
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
        finalContactsForEdit = responseToJson || {};
        console.log(finalContactsForEdit);
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
    returnArrayContactsEdit();
    setupEditDropdownInteraction(); // Dropdown-Interaktion nach Rendern initialisieren
}

function setupEditDropdownInteraction() {
    const editDropdown = document.getElementById("custom-dropdown-edit");
    const editOptionsContainer = editDropdown.querySelector(".dropdown-options-edit");

    // Klick auf das Dropdown öffnet/schließt die Optionen
    editDropdown.addEventListener("click", () => {
        const isOpen = editOptionsContainer.style.display === "flex";
        editOptionsContainer.style.display = isOpen ? "none" : "block";
    });
}


function returnArrayContactsEdit() {
    if (!finalContactsForEdit || Object.keys(finalContactsForEdit).length === 0) {
        console.error("No contacts found.");
        return;
    }

    const editDropdown = document.getElementById('custom-dropdown-edit');
    if (!editDropdown) {
        console.error("Edit Dropdown element not found.");
        return;
    }

    const editOptionsContainer = editDropdown.querySelector('.dropdown-options-edit');
    editOptionsContainer.innerHTML = ""; // Optionen im Dropdown leeren

    Object.keys(finalContactsForEdit).forEach((key) => {
        const contact = finalContactsForEdit[key];
        if (!contact || !contact.firstName || !contact.lastName) return;

        const optionHTML = assignUserEditHTML(contact);
        console.log(`Rendering contact: ${contact.firstName} ${contact.lastName}`); // Debug-Ausgabe

        const optionElement = document.createElement("div");
        optionElement.classList.add("dropdown-contact-edit");
        optionElement.innerHTML = optionHTML;

        editOptionsContainer.appendChild(optionElement);
    });
}


function assignUserEditHTML(contact) {
    const initials = `${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}`;
    return `
        <div class="contact-circle-edit" style="background-color: ${getRandomColor()}">${initials}</div>
        <span>${contact.firstName} ${contact.lastName}</span>
        <input type="checkbox" class="contact-checkbox-edit" onchange="handleEditContactSelection('${contact.firstName}', '${contact.lastName}')">
    `;
}


function handleEditContactSelection(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`;
    const checkbox = document.querySelector(`input[onchange*="${fullName}"]`);

    if (checkbox.checked) {
        assignedUserArr.push({ firstName, lastName });
    } else {
        assignedUserArr = assignedUserArr.filter(user => user.firstName !== firstName || user.lastName !== lastName);
    }

    console.log("Assigned users:", assignedUserArr);
    updateAssignedUsersDisplay();
}

function updateAssignedUsersDisplay() {
    const assignedUsersContainer = document.getElementById('assigned-users-short-edit');
    assignedUsersContainer.innerHTML = "";

    assignedUserArr.forEach(user => {
        const initials = `${getFirstLetter(user.firstName)}${getFirstLetter(user.lastName)}`;
        assignedUsersContainer.innerHTML += `
            <div class="assigned-user-circle" style="background-color: ${getRandomColor()}">
                ${initials}
            </div>
        `;
    });
}

function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}

function getRandomColor() {
    const colors = ["orange", "purple", "blue", "red", "green", "teal"];
    return colors[Math.floor(Math.random() * colors.length)];
}



function getEditTemplate(task) {
    return /*html*/`
        <div id="editTaskCard" class="editTaskCard">
            <div class="closeEditView">
                <img class="closeCard" onclick="closeEditTask()" src="./img/close.svg" alt="">
            </div>
            <p class="firstTableColumnFont">Title:</p>
            <input value="${task.title}" type="text">
            <p class="firstTableColumnFont">Description:</p>
            <textarea id="editDescription" class="editTaskTextarea">${task.description}</textarea>
            <p class="firstTableColumnFont">Priorität:</p>
            <div class="prio-btn-content">
                <button id="prio-urgent" class="prio-button" onclick="setPriority('urgent')" type="button">
                    Urgent
                    <img id="urgentImg" src="../img/Prio_urgent_color.png" alt=""/>
                </button>
                <button id="prio-medium" class="prio-button" onclick="setPriority('medium')" type="button">
                    Medium
                    <img id="mediumImg" src="../img/Prio_medium_color.png" alt=""/>
                </button>
                <button id="prio-low" class="prio-button" onclick="setPriority('low')" type="button">
                    Low
                    <img id="lowImg" src="../img/Prio_low_color.png" alt=""/>
                </button>
            </div>

            <div class="field-text-flex-edit" id="addTaskAssignedTo-edit">
                <div class="form-group-edit">
                    <label for="assigned-to-edit">Assigned to</label>
                    <div id="custom-dropdown-edit" class="custom-dropdown-edit input-addtask-edit">
                    <div class="dropdown-placeholder-edit">Select contacts to assign</div>
                    <div class="dropdown-options-edit"></div>
                    </div>
                    <div id="assigned-users-short-edit"></div>
                </div>
            </div>



        </div>
    `;
}


function closeEditTask() {
    let overlayEdit = document.getElementById('editTaskTempl');
    overlayEdit.classList.add('d-none');
}


