let currentUser = null;

function init() {
    includeHTML();
    loadCurrentUser();
    fetchTasks("/tasks");
    loadBoardNavigator();
}



let currentDraggedElement;

function loadCurrentUser(){
    const storedUser = localStorage.getItem('currentUser');
    if(storedUser){
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
        if(currentUser.firstName === "Guest" && currentUser.lastName === "User"){
            console.log("Gastbenutzer verschiebt Aufgabe lokal.");
            updateTaskHTML(); 
        }
        else{
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
            <div class="addTaskButtonBoard">
                <p class="buttonBoardFont">Add Task +</p>
            </div>
        </div>
    </div>
</section>
    `
}

function filterTaskFunction(){
    let myFilter = document.getElementById('filterTask').value.toLowerCase();
    if (myFilter.length < 1){
        for(let i = 0; i < taskArray.length; i++){
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
<div class="columntitleToDo">
    <p class="columnTitleFont">To do</p>
    <img src="./img/plus button.png" alt="">
</div>
<div class="columntitleInProgress">
    <p class="columnTitleFont">In Progress</p>
    <img src="./img/plus button.png" alt="">
</div>
<div class="columntitleAwaitFeedback">
    <p class="columnTitleFont">Await Feedback</p>
    <img src="./img/plus button.png" alt="">
</div>
<div class="columntitleDone">
    <p class="columnTitleFont">Done</p>
    <img src="./img/plus button.png" alt="">
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
    if(todoColumn.children.length === 0){
        createNoToDosdiv()
    }
}

function createNoToDosdiv(){
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
                <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="rgb(255,122,0)" />
                <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
                    ${owner.initials}
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



function findPrioIcon(task){
    let prioIcon = document.getElementById(`priority-${task.id}`);
    if(task.prio === "medium"){
        prioIcon.src = "./img/prio-mid.png"
    }else if(task.prio === "urgent"){
        prioIcon.src = "./img/prio-high.png"
    }else{
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

function updateCompletedSubtasks(taskId){
let tasksCompleted = 0;
const subtasksList = document.getElementById(`subtaskslist-${taskId}`);
for(let i=0; i < subtasksList.querySelectorAll('input[type="checkbox"]').length; i++){
    const checkbox = document.getElementById(`subtask-${taskId}-${i}`);
    if(checkbox && checkbox.checked){
        tasksCompleted++;
    }
}
const renderCompleted = document.getElementById(`amountOfSubtasks-${taskId}`);
if(renderCompleted){
    renderCompleted.innerHTML = tasksCompleted;
}
}

function findAmountOfSubtasks(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return "";
    }
    return task.subtasks.length;
}



function createTaskHTML(task) {
    const owners = getOwners(task);
    const subtasks = getSubTasks(task)
    const amountOfSubtasks = findAmountOfSubtasks(task)
    return /*html*/`
        <div id="boardTask${task.id}" class="todo" draggable ="true" ondragstart="startDragging(${task.id})">
        <div id="taskButton-${task.id}">
        <p class="open-sans">${task.taskCategory}</p>
        </div>
        <p id="title${task.id}" class= "open-sans-bold">${task.title}</p>
        <p id="description${task.id}" class="inter-font">${task.description}</p>
        <div class="progressBarDiv">
        <progress value="32" max="100"> 32% </progress>
        <p id="amountOfSubtasks-${task.id}" class="inter-font">0</p>
        <p class="inter-font">/${amountOfSubtasks} Subtasks</p>
        </div>

        <section class="namesAndPrio">
        <div class="userNameCircles" id="userNameCircles-${task.id}">
        </div>
        <div >
        <img id="priority-${task.id}"  src="./img/prio-mid.png" alt="">
        </div>
        </section>
        </div>
        
    `
}

function highlight(id) {
    document.getElementById(id).classList.add("dragAreaHighlight");
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove("dragAreaHighlight");
}
