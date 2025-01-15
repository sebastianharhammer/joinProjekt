function getEditTemplate(task) {
    return /*html*/ `
    <div id="editTaskCard" class="editTaskCard">
        <div class="closeEditLine">
        <div class="closeEditView" >
            <img class="closeCard" onclick="closeEditTask()" src="./img/close.svg" alt="">
        </div>
        </div>
        <p class="firstTableColumnFont">Title:</p>
        <div class="add-subtask-in-edit">
            <input class="input-title-in-edit" type="text" value="${task.title
        }">
        </div>
        <p class="firstTableColumnFont">Description:</p>
        <textarea id="editDescription" class="editTaskTextarea textarea-large">${task.description || ''}</textarea>
        <p class="firstTableColumnFont">Due Date:</p>
        <div class="edit-due-date">
        <input type="date" id="edit-due-date" class="edit-input" value="${task.date || ""
        }">
        </div>
        <p class="firstTableColumnFont">Priorität:</p>
        <div class="prio-btn-content">
            <button id="prio-urgent" class="prio-button ${task.prio === "urgent" ? "red" : ""
        }" onclick="setPriority('urgent')" type="button">
                Urgent
                <img id="prio-image-urgent" class="${task.prio === "urgent" ? "sat-0" : ""
        }" src="./img/Prio_urgent_color.png" alt=""/>
            </button>
            <button id="prio-medium" class="prio-button ${task.prio === "medium" ? "yellow" : ""
        }" onclick="setPriority('medium')" type="button">
                Medium
                <img id="prio-image-medium" class="${task.prio === "medium" ? "sat-0" : ""
        }" src="./img/Prio_medium_color.png" alt=""/>
            </button>
            <button id="prio-low" class="prio-button ${task.prio === "low" ? "green" : ""
        }" onclick="setPriority('low')" type="button">
                Low
                <img id="prio-image-low" class="${task.prio === "low" ? "sat-0" : ""
        }" src="./img/Prio_low_color.png" alt=""/>
            </button>
        </div>
        <div class="field-text-flex-edit" id="addTaskAssignedTo-edit">
            <div class="form-group-edit">
                <label for="assigned-to-edit">Assigned to</label>
                <div id="custom-dropdown-edit" class="custom-dropdown-edit input-addtask-edit">
                <div class="dropdown-placeholder-edit">Select contacts to assign</div>
                <div class="dropdown-options-edit"></div>
                </div>
                <div class="assigned-users-short-edit" id="assigned-users-short-edit"></div>
            </div>
        </div>
        <section id="edit-subtasks-section">
        <div class="add-subtask-in-edit">
            <input id="input-subtask-in-edit" class="input-subtask-in-edit" type="text" placeholder="Write a new subtask...">
            <div class="img-in-edit-input">
                <div class="close-and-check-imgs">
                    <img onclick="emptyInput()" src="./img/close.svg" alt="close">
                </div>
                <div class="close-and-check-imgs">
                    <img onclick="addSubTaskInEditTempl()" src="./img/check.svg" alt="check">
                </div>
            </div>
        </div>
        <div id="rendered-subtasks-edit">
        </div>
        </section>
        <section class="editButtons">
        <button class="btn-skip-and-confirm-edit" onclick="saveEditedTask()">Save changes</button>
        <button onclick="skipEdit(${task.id})" class="btn-skip-and-confirm-edit">Skip edit</button>
        </section>
    </div>
`;
}

function createSubtaskEditHTML(subtaskId, inputValue, taskId, subtaskIndex) {
    return /*html*/ `
<div class="edit-subtask-item" id="${subtaskId}">
    <p class="subtaskFontInEdit">• ${inputValue}</p>
    <div class="edit-existingtask">
        <img src="./img/edit.svg" alt="Edit" class="edit-icon" onclick="editExistingSubtaskEditView(${taskId}, ${subtaskIndex})">
        <span>|</span>
        <img src="./img/delete.png" alt="Delete" class="delete-icon" onclick="deleteSubtaskEditview(${taskId}, ${subtaskIndex})">
    </div>
</div>`;
}

function createAssignedUserHTML(color, initials) {
    return /*html*/ `
<div class="assigned-user-circle" style="background-color: ${color}">
    <p>${initials}</p>
</div>`;
}

function assignUserEditHTML(contact, isAssigned) {
    const initials = `${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}`;
    return `
        <div class="contact-circle-edit" style="background-color: ${contact.color}">${initials}</div>
        <span>${contact.firstName} ${contact.lastName}</span>
        <label class="contact-checkbox-edit-label">
            <input type="checkbox" class="checkbox-add-task-edit" ${isAssigned ? 'checked' : ''}>
            <span class="checkboxSquare"></span>
        </label>
    `;
}

  function showAssignedUsersEditHTML(contact) {
    return `<svg class="addtask-customCircle" width="50" height="50" >
              <circle id="addtask-user-circle" class="addtask-circleBorder" cx="50%" cy="50%" r="24" stroke="${contact.color}" stroke-width="1" fill="${contact.color}"></circle>
              <text class="addtask-textInCircle" stroke-width="1" font-weight="normal" stroke="white"     x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
          </svg>`;
  }

function createContactEditHTML(initials, contact) {
    return /*html*/ `
<div class="contact-circle-edit" style="background-color: ${getRandomColor()}">${initials}</div>
<span>${contact.firstName} ${contact.lastName}</span>
<input type="checkbox" class="contact-checkbox-edit" onchange="handleEditContactSelection('${contact.firstName}', '${contact.lastName}')">
`;
}

function checkIfContactAssigned(contact) {
    return assignedUserArr.some(
        (user) =>
            user.firstName === contact.firstName &&
            user.lastName === contact.lastName
    );
}

function renderNoSubtasksMessage(container) {
    container.innerHTML = `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
}


function createSubtaskHTML(task, subtask, subtaskId, subtaskTextId, index) {
    return /*html*/ `
<div class="edit-subtask-item" id="${subtaskId}">
    <p id="${subtaskTextId}" class="subtaskFontInEdit">• ${subtask.subtask || `Subtask ${index + 1}`}</p>
    <div class="edit-existingtask">
        <img src="./img/edit.svg" alt="Edit" class="edit-icon" onclick="editExistingSubtaskEditView(${task.id}, ${index})">
        <span>|</span>
        <img src="./img/delete.png" alt="Delete" class="delete-icon" onclick="deleteSubtaskEditview(${task.id}, ${index})">
    </div>
</div>`;
}


function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}

function renderEditSubtasks(task) {
    const subtaskContainer = document.getElementById("rendered-subtasks-edit");
    clearSubtaskContainer(subtaskContainer);

    if (!task.subtasks || task.subtasks.length === 0) {
        renderNoSubtasksMessage(subtaskContainer);
        return;
    }

    task.subtasks.forEach((subtask, index) => {
        const subtaskId = `edit-subtask-${task.id}-${index + 1}`;
        const subtaskTextId = `subtask-text-${task.id}-${index}`;
        const subtaskHTML = createSubtaskHTML(task, subtask, subtaskId, subtaskTextId, index);
        subtaskContainer.innerHTML += subtaskHTML;
    });
}


function clearSubtaskContainer(container) {
    container.innerHTML = "";
}

function removeSubtaskElement(taskId, subtaskIndex) {
    const subtaskElement = document.getElementById(
        `edit-subtask-${taskId}-${subtaskIndex + 1}`
    );
    if (subtaskElement) {
        subtaskElement.remove();
    }
}

function getUpdatedSubtaskHTML(taskId, subtaskIndex, newValue) {
    return /*html*/`

    <p id="subtask-text-${taskId}-${subtaskIndex}" class="subtaskFontInEdit">• ${newValue}</p>
    <div class="edit-existingtask">
        <img src="./img/edit.svg" alt="Edit" class="edit-icon" onclick="editExistingSubtaskEditView(${taskId}, ${subtaskIndex})">
        <span>|</span>
        <img src="./img/delete.png" alt="Delete" class="delete-icon" onclick="deleteSubtaskEditview(${taskId}, ${subtaskIndex})">
    </div>`;
}