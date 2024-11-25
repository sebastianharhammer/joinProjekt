let todos = [{
    'id': 0,
    'title': 'HTML verbessern',
    'category': 'todo',
    'taskCategory': 'Technical Tasc',
    'description': 'Dieser Text dient zur visuellen Veranschaulichung, wie es aussieht wenn viel Text in der Beschreibung steht. Ich glaube ich muss hier noch ein bisschen was anpassen',
    'prio': 'low'
}, {
    'id': 1,
    'title': 'Code kürzer gestalten',
    'category': 'inProgress',
    'taskCategory': 'User Story',
    'description': 'test1',
    'prio': 'medium'
},
{
    'id': 2,
    'title': 'CSS anpassen',
    'category': 'inProgress',
    'taskCategory': 'Technical Tasc',
    'description': 'test2',
    'prio': 'medium'
},
{
    'id': 3,
    'title': 'Header gestalten',
    'category': 'feedback',
    'taskCategory': 'Technical Tasc',
    'description': 'test3',
    'prio': 'high'
},
{
    'id': 4,
    'title': 'Schriften hinzufügen',
    'category': 'done',
    'taskCategory': 'User Story',
    'description': 'test4',
    'prio': 'high'
}];

let currentDraggedElement;

function init() {
    includeHTML();
    updateHTML()
}


function generateToDoHTML(element) {
return /*html*/`
<div draggable="true" class="todo" ondragstart="startDragging(${element['id']})">
<div id="taskButton-${element['id']}">
<p class="open-sans">${element['taskCategory']}</p>
</div>
<p class= "open-sans-bold">${element['title']}</p>
<p class="inter-font">${element['description']}</p>
<progress value="32" max="100"> 32% </progress>
<section class="namesAndPrio">
<div class="userNameCircles">
<svg width="34" height="34">
    <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="rgb(255,122,0)" />
    <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">DL</text>
</svg>
<svg class="addMarginToOverlay" width="34" height="34">
    <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="rgb(31,215,193)" />
    <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">EN</text>
</svg>
<svg class="addMarginToOverlay" width="34" height="34">
    <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="rgb(110,82,255)" />
    <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">AR</text>
</svg>
        </div>
<div id="prio-${element['id']}">
        <p>${element['prio']}</p>
        <div id = "prioIcon"></div>
<img src="./img/prio-mid.png" alt="">
</div>
</section>
</div>
    `;
}


function updateHTML() {
    const categories = ['todo', 'inProgress', 'feedback', 'done'];
    for (let category of categories) {
        let filteredTodos = todos.filter(t => t['category'] === category);
        document.getElementById(category).innerHTML = '';
        for (let element of filteredTodos) {
            document.getElementById(category).innerHTML += generateToDoHTML(element);
        }
    }
    findClassOfTaskCat();
    setPriorityIcon();
}


function findClassOfTaskCat() {
    for (let task of todos) {
        const button = document.getElementById(`taskButton-${task.id}`)
        if (task.taskCategory === "Technical Tasc") {
            button.classList.add('task-category-technicalTask')
        }
        else if (task.taskCategory === "User Story") {
            button.classList.add('task-category-userExperience')
        }
    }
}

function setPriorityIcon() {
    for (let prio of todos) {
        let prioDiv = document.getElementById(`prio-${prio.id}`);
        if (prioDiv) {
            if (prio.prio === "low") {
                prioDiv.innerHTML = /*html*/`
                    <img src="./img/prio-low.png" alt="">
                `;
            }
            else if (prio.prio === "medium") {
                prioDiv.innerHTML = /*html*/`
                    <img src="./img/prio-mid.png" alt="">
                `;
            }
            else if (prio.prio === "high") {
                prioDiv.innerHTML = /*html*/`
                    <img src="./img/prio-high.png" alt="">
                `;
            }
    }
}
}



function startDragging(id) {
    currentDraggedElement = id;
}


function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(category) {
    todos[currentDraggedElement]['category'] = category;
    updateHTML();
}

function highlight(id) {
    document.getElementById(id).classList.add('dragAreaHighlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('dragAreaHighlight');
}