function init(){
    includeHTML();
    fetchTasks("/tasks");
    loadBoardNavigator()
}

const BASE_URL= "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let taskArray=[];

async function fetchTasks(path=""){
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    console.log(responseToJson)
    if(responseToJson){
        taskArray = Object.values(responseToJson);
    }
    console.log(taskArray)
}

function loadBoardNavigator(){
    let content = document.getElementById('wholeBoard');
    content.innerHTML = '';
    content.innerHTML += getBoardNavigatorHTML();
    loadTitleOfBoardColumns(content);
}

function getBoardNavigatorHTML(){
    return /*html*/`
<section class="boardNavigator">
    <div class="searchAndAddTasks">
        <p class="boardFont">BOARD</p>
        <div class="inputAndButtonBoard">
            <div class="searchAreaBoard">
            <input class="inputBoard" type="text" placeholder="Find Task">
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

function loadTitleOfBoardColumns(content){
content.innerHTML+= showTitleOfBoardColumns();
getColumns(content);
}

function showTitleOfBoardColumns(){
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

function getColumns(content){
    content.innerHTML+= getColumnsHTML();
}

function getColumnsHTML(){
    return /*html*/`
    <section class="tasksContent">
    <div class="dragarea-todo" id="todo" ondrop="moveTo('todo')" ondragleave="removeHighlight('todo')" ondragover="allowDrop(event); highlight('todo')"></div>
    <div class="dragarea-inProgress" id="inProgress" ondrop="moveTo('inProgress')" ondragleave="removeHighlight('inProgress')" ondragover="allowDrop(event); highlight('inProgress')"></div>
    <div class="dragarea-feedback" id="feedback" ondrop="moveTo('feedback')" ondragleave="removeHighlight('feedback')" ondragover="allowDrop(event); highlight('feedback')"></div>
    <div class="dragarea-done" id="done" ondrop="moveTo('done')" ondragleave="removeHighlight('done')" ondragover="allowDrop(event); highlight('done')"></div>
    </section>
    `
}


function updateTaskHTML(){
let tasks = taskArray
console.log(tasks);
let tasksContent = document.getElementById('tasksContent');
tasksContent.innerHTML = '';
for(let i = 0; i < taskArray.length; i++){
    let taskTitle = taskArray[i].title;
    let taskDescription = taskArray[i].description;
    let dueDate = taskArray[i].dueDate;
    let taskstatus = taskArray[i].taskstatus;
    let taskCategory = taskArray[i].taskCategory;
    let priority = taskArray[i].prio;
}
}

function filterTasksByCategory(taskTitle, taskDescription, dueDate, taskstatus, taskCategory, priority){
const categories = ["todo", "inProgress", "feedback","done"]
for(task of taskArray){
    let filteredTodos = todos.filter((t) => t["category"] === taskCategory);
    document.getElementById(category).innerHTML = "";
}
}

