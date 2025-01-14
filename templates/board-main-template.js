function getTaskHTML(task, completedSubtasks, totalSubtasks) {
    return /*html*/ `
      <div onclick="showTaskCard(${task.id})" id="boardTask${task.id}" class="todo" draggable="true" ondragstart="startDragging(${task.id})">
        <div id="taskButton-${task.id}">
          <p class="open-sans">${task.taskCategory}</p>
        </div>
        <p id="title${task.id}" class="open-sans-bold">${task.title}</p>
        <p id="description${task.id}" class="inter-font">${task.description}</p>
        ${totalSubtasks > 0 ? getProgressBarHTML(task, completedSubtasks, totalSubtasks) : ""}
        <section class="namesAndPrio">
          <div class="userNameCircles" id="userNameCircles-${task.id}"></div>
          <div>
            <img id="priority-${task.id}" src="./img/prio-mid.png" alt="">
          </div>
        </section>
        <div class="mobile-arrows">
          <button class="arrow-btn arrow-up" onclick="moveTaskUp(${task.id}, event)">
            <img src="./img/arrow-up.png" alt="Up">
          </button>
          <button class="arrow-btn arrow-down" onclick="moveTaskDown(${task.id}, event)">
            <img src="./img/arrow-down.png" alt="Down">
          </button>
        </div>
      </div>
    `;
  }
  
  function getProgressBarHTML(task, completedSubtasks, totalSubtasks) {
    return /*html*/ `
      <div class="progressBarDiv">
        <progress id="progress-${task.id}" class="progressBarBoard" value="${(completedSubtasks / totalSubtasks) * 100}" max="100"></progress>
        <p id="amountOfSubtasks-${task.id}" class="inter-font">${completedSubtasks} / ${totalSubtasks} Subtasks</p>
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

<section class="boardNavigator-mobile">
    <div class="navig-mobile-first-line">
        <p class="boardFont-mobile">BOARD</p>
        <img onclick="showAddTask('todo')" class="btn-board-mobile" src="./img/plus-mobile-task.png" alt="">
    </div>

    <div class="mobile-input-search">
    <input class="inputBoard-mobile" id="filterTask-mobile" onkeyup="filterTaskFunctionMobile()" type="text" placeholder="Find Task">
    <p id="noResults" style="display: none; color: red; font-size: 12px; margin-top: 2px;">Kein Task gefunden</p>
    <div class="icon-input-mobile">
    <span class="verticalLine-mobile">|</span>
    <img class="lens" src="./img/search.png" alt="">
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

function getNoOwnersHTML() {
    return `<p class="noOwners">Keine Owner zugewiesen</p>`;
}

function getOwnerItemHTML(owner) {
    const color = getRandomColor(owner.firstName, owner.lastName); // Nutzt getRandomColor
    return `
    <div class="ownerItem">
        ${getOwnerCircleHTML(owner, color)}
        <p>${owner.firstName} ${owner.lastName}</p>
    </div>
    `;
}

function getOwnerCircleHTML(owner, color) {
    return /*html*/`
    <svg width="34" height="34">
        <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${color}" />
        <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
        ${owner.initials || "N/A"}
        </text>
    </svg>
    `;
}

function getTaskDetailsHTML(task) {
    return /*html*/ `
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
                      <td>${
                        task.prio
                      } <img class="prioIconCard" src="${getPrioIcon(
      task.prio
    )}" alt=""></td>                   
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
                <button class="deleteTaskButtons" onclick="deleteTask(${
                    task.id
                })">Ja, löschen</button>
                <button class="deleteTaskButtons" onclick="closeQuestionDelete()">Nein, zurück</button>
            </div>
        </div>
    `;
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



function getColumnsHTML() {
    return /*html*/ `
          <section class="tasksContent">

              <div class="column-header">
                  <span class="headline-to-do-responsive">TO DO</span>
                  <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('todo')">
              </div>

              
              <div class="wholeDragArea">
                    <div class="column-header-desktop">
                        <p class="columnTitleFont">To do</p>
                        <img class="showInDesktopVersion" src="./img/plus button.png" alt="" onclick="showAddTask('todo')">
                    </div>
              <div class="dragarea-todo" id="todo"
                  ondrop="moveTo('todo')" 
                  ondragleave="removeHighlight('todo')" 
                  ondragover="allowDrop(event); highlight('todo')"></div>
             </div>


             
              <div class="column-header">
                  <span class="headline-in-progress-responsive">IN PROGRESS</span>
                  <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('inProgress')">
              </div>

              <div class="wholeDragArea">
              <div class="column-header-desktop">
                        <p class="columnTitleFont">In Progress</p>
                        <img class="showInDesktopVersion" src="./img/plus button.png" alt="" onclick="showAddTask('inProgress')">
              </div>
              <div class="dragarea-inProgress" id="inProgress"
                  ondrop="moveTo('inProgress')" 
                  ondragleave="removeHighlight('inProgress')" 
                  ondragover="allowDrop(event); highlight('inProgress')"></div>
             </div>


              <div class="column-header">
                  <span class="headline-feedback-responsive">AWAIT FEEDBACK</span>
                  <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('feedback')">
              </div>

              <div class="wholeDragArea">
              <div class="column-header-desktop">
                        <p class="columnTitleFont">Await Feedback</p>
                        <img class="showInDesktopVersion" src="./img/plus button.png" alt="" onclick="showAddTask('feedback')">
              </div>
              <div class="dragarea-feedback" id="feedback"
                  ondrop="moveTo('feedback')" 
                  ondragleave="removeHighlight('feedback')" 
                  ondragover="allowDrop(event); highlight('feedback')"></div>
             </div>


              <div class="column-header">
                  <span class="headline-done-responsive">DONE</span>
                  <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('done')">
              </div>
              <div class="wholeDragArea">
              <div class="column-header-desktop">
                        <p class="columnTitleFont">Done</p>
                        <img class="showInDesktopVersion" src="./img/plus button.png" alt="" onclick="showAddTask('done')">
              </div>
              <div class="dragarea-done" id="done"
                  ondrop="moveTo('done')" 
                  ondragleave="removeHighlight('done')" 
                  ondragover="allowDrop(event); highlight('done')"></div>
            </div>
          </section>`;
  }