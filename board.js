let todos = [{
    'id': 0,
    'title': 'HTML verbessern',
    'category': 'todo',
    'taskCategory': 'Technical Tasc',
    'description': 'test0'
}, {
    'id': 1,
    'title': 'Code kürzer gestalten',
    'category': 'inProgress',
    'taskCategory': 'User Story',
    'description': 'test1'
},
{
    'id': 2,
    'title': 'CSS anpassen',
    'category': 'inProgress',
    'taskCategory': 'Technical Tasc',
    'description': 'test2'
},
{
    'id': 3,
    'title': 'Header gestalten',
    'category': 'feedback',
    'taskCategory': 'Technical Tasc',
    'description': 'test3'
},
{
    'id': 4,
    'title': 'Schriften hinzufügen',
    'category': 'done',
    'taskCategory': 'User Story',
    'description': 'test4'
}];

let currentDraggedElement;

function init() {
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
        <div class="userNameCircles">
        <svg width="100" height="100">
            <circle cx="50" cy="50" r="16" stroke="white" stroke-width="1" fill="rgb(147,39,255)" />
            <text x="50" y="50" text-anchor="middle" alignment-baseline="central" font-size="11" fill="black">Text</text>
        </svg>
        <svg width="100" height="100">
            <circle cx="50" cy="50" r="16" stroke="white" stroke-width="1" fill="rgb(252,113,255)" />
            <text x="50" y="50" text-anchor="middle" alignment-baseline="central" font-size="11" fill="black">Text</text>
        </svg>
        <svg width="100" height="100">
            <circle cx="50" cy="50" r="16" stroke="white" stroke-width="1" fill="rgb(252,113,255)" />
            <text x="50" y="50" text-anchor="middle" alignment-baseline="central" font-size="11" fill="black">Text</text>
        </svg>
        </div>
        </div>
    `;
}


function updateHTML() {
    const categories = ['todo', 'inProgress', 'feedback', 'done',];
    for (let category of categories) {
        let filteredTodos = todos.filter(t => t['category'] === category);
        document.getElementById(category).innerHTML = '';
        for (let element of filteredTodos) {
            document.getElementById(category).innerHTML += generateToDoHTML(element);
        }
    }
    findClassOfTaskCat();
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