function getTaskHTML(task, completedSubtasks, totalSubtasks) {
return /*html*/ `
    <div onclick="showTaskCard(${task.id})" id="boardTask${
task.id
}" class="todo" draggable="true" ondragstart="startDragging(${task.id})">
    <div id="taskButton-${task.id}">
        <p class="open-sans">${task.taskCategory}</p>
    </div>
    <p id="title${task.id}" class="open-sans-bold">${task.title}</p>
    <p id="description${task.id}" class="inter-font">${task.description}</p>
    <div class="progressBarDiv">
        <progress id="progress-${task.id}" class="progressBarBoard" value="${
(completedSubtasks / totalSubtasks) * 100
}" max="100"></progress>
        <p id="amountOfSubtasks-${
            task.id
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