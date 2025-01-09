function getTaskHTML(task, completedSubtasks, totalSubtasks) {
    return /*html*/ `
    <div onclick="showTaskCard(${task.id})" id="boardTask${task.id
        }" class="todo" draggable="true" ondragstart="startDragging(${task.id})">
    <div id="taskButton-${task.id}">
        <p class="open-sans">${task.taskCategory}</p>
    </div>
    <p id="title${task.id}" class="open-sans-bold">${task.title}</p>
    <p id="description${task.id}" class="inter-font">${task.description}</p>
    <div class="progressBarDiv">
        <progress id="progress-${task.id}" class="progressBarBoard" value="${(completedSubtasks / totalSubtasks) * 100
        }" max="100"></progress>
        <p id="amountOfSubtasks-${task.id
        }" class="inter-font">${completedSubtasks} / ${totalSubtasks} Subtasks</p>
    </div>
    <section class="namesAndPrio">
        <div class="userNameCircles" id="userNameCircles-${task.id}"></div>
        <div>
            <img id="priority-${task.id}" src="./img/prio-mid.png" alt="">
        </div>
    </section>
    <div class="mobile-arrows">
        <button class="arrow-btn arrow-up" 
                onclick="moveTaskUp(${task.id}, event)">
            <img src="./img/arrow-up.png" alt="Up">
        </button>
        <button class="arrow-btn arrow-down" 
                onclick="moveTaskDown(${task.id}, event)">
            <img src="./img/arrow-down.png" alt="Down">
        </button>
    </div>
</div>
`;
}

function getBoardNavigatorHTML() {
    return /*html*/ `
<section class="boardNavigator">
    <div class="searchAndAddTasks">
        <p class="boardFont">BOARD</p>
        <div class="inputAndButtonBoard">
            <div class="searchAreaBoard">
            <input id="filterTask" onkeyup="filterTaskFunction()" class="inputBoard" type="text" placeholder="Find Task">
            <p id="noResults" style="display: none; color: red; font-size: 14px; margin-top: 5px;">Kein Task gefunden</p>
            <span class="verticalLine">|</span>
            <img src="./img/search.png" alt="">
            </div>
            <div class="addTaskButtonBoard" onclick="showAddTask('todo')">
                <p class="buttonBoardFont">Add Task +</p>
            </div>
        </div>
    </div>
</section>
    `;
}

function generateNoOwnerCircle() {
    return /*html*/`
    <svg width="34" height="34">
        <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="gray" />
        <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">N/A</text>
    </svg>
    `;
}

function generateOwnerCircle(owner) {
    const color = getRandomColor(owner.firstName, owner.lastName); // Nutzt getRandomColor
    return /*html*/`
    <svg width="34" height="34">
        <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${color}" />
        <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
        ${owner.initials || "N/A"}
        </text>
    </svg>
    `;
}

function createSubTaskHTML(task, index) {
    return /*html*/ `
    <div class="eachSubtaskBox">
        <input type="checkbox" id="subtask-${task.id}-${index}" onchange="updateCompletedSubtasks(${task.id})">
        <label for="subtask-${task.id}-${index}">${task.subtasks[index]}</label>
    </div>
    `;
}

function getSubtasksHTML(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
    return `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
    }
    let subtasksHTML = "";
    task.subtasks.forEach((subtask, index) => {
    subtasksHTML += /*html*/ `
            <div class="subtaskItem">
                <input 
                    type="checkbox" 
                    id="subtask-${task.id}-${index}" 
                    class="styledCheckbox"
                    ${subtask.checkbox ? "checked" : ""} 
                    onchange="toggleSubtaskCheckbox(${task.id}, ${index}); updateCompletedSubtasks(${task.id})"
                >
                <label for="subtask-${
                    task.id
                }-${index}" class="styledCheckboxLabel">
                    <span class="checkboxSquare"></span>
                    <p class="subtaskText">${
                        subtask.subtask || "Unnamed Subtask"
                    }</p>
            </label>
            </div>
            `;
    });
    return subtasksHTML;
}