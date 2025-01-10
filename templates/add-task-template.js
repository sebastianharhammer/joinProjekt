function renderAddTaskHTML() {
  let content = document.getElementById("add-task-content");
  content.innerHTML = /*html*/ `
      <div class="addtask-fullscreen-content">
      <div class="addtask-main-content" onclick="closeDropdown()">
        
        <form>
        <div id="addTaskHeadlineFullscreen">
          <h1>Add Task</h1>
        </div>
          <div class="addtask-form-container">
            <div class="addtask-form-left-top">
            <div id="addTaskHeadlineMobile">
              <h1>Add Task</h1>
            </div>
              <div class="field-text-flex">
                <label>
                  Title
                  <span style="color: #ff8190">*</span>
                </label>
                <div id="errorMassageTitle"></div>
                <input class="input-addtask" id="title" type="text" placeholder="Enter a title" maxlength="30"/>
                <span id="addTitleError" class="validSpanTitle"></span>
              </div>
              <div class="field-text-flex" id="addTaskDiscription">
                <label>Description</label>
                <textarea id="description" placeholder="Enter a Description max 170 characters" cols="30" rows="10" maxlength="170"></textarea>
              </div>
              <div class="field-text-flex" id="addTaskAssignedTo">
                  <div class="form-group">
                    <label>Assigned to</label>
                    <div id="custom-dropdown" class="custom-dropdown input-addtask">
                      <div class="dropdown-placeholder">Select contacts to assign</div>
                      <div class="dropdown-options" id="dropdown-options"></div>
                    </div>
                    <div id="assigned-users-short"></div>
                    
                  </div>
                  
              </div>
            </div>
            <div class="separator"></div>
            <div class="addtask-form-right-bottom">
              <div class="field-text-flex" id="addTaskDueDate">
                <label>
                  Due date
                  <span style="color: #ff8190">*</span>
                </label>
                <div id="errorMassageTitle"></div>
                <input class="input-addtask" id="addTaskInputDueDate" type="date" min="2025-01-01"/>
                <span id="addDateError" class="validSpanDate"></span>
              </div>
              <div class="prio-content field-text-flex">
                <label>Prio</label>
                <div class="prio-btn-content">
                  <button id="prio-urgent" class="prio-button" onclick="setPriority('urgent')" type="button">
                    Urgent
                    <img id="prio-image-urgent" class="prio-button-img"  src="./img/Prio_urgent_color.svg" alt=""/>
                  </button>
                  <button id="prio-medium" class="prio-button" onclick="setPriority('medium')" type="button">
                    Medium
                    <img id="prio-image-medium"  class="prio-button-img" src="./img/Prio_medium_color.svg" alt=""/>
                  </button>
                  <button id="prio-low" class="prio-button" onclick="setPriority('low')" type="button">
                    Low
                    <img id="prio-image-low" class="prio-button-img" src="./img/Prio_low_color.svg" alt=""/>
                  </button>
                </div>
              </div>
              <div class="field-text-flex" id="addTaskCategory">
                <label>
                  Category
                  <span style="color: #ff8190">*</span>
                </label>
                <input class="input-addtask" onclick="openAddTaskCategories()" id="categoryInput" type="text" placeholder="Select task category" maxlength="40" readonly>
                <img onclick="openAddTaskCategories()" id="arrowDropMenuCategory" src="./img/arrow_drop_down.svg" alt=""/>
                <div id="dropDownCategoryMenu"></div>
                <span id="addCategoryError"  class="validSpanCategory"></span>
              </div>
              <div class="field-text-flex" id="addTaskSubtasks">
                <label>
                  Subtasks
                </label>
                <div class="subtask-input-wrapper">
                  <input class="input-addtask plus-minus-drop-menu" id="subtaskInput" type="text" placeholder="Add a new subtask"  maxlength="20" onfocus="showClearButton()">
                  <div class="input-icons">
                  
                    <div id="clear-add-icons" class="d-none">
                      <img onclick="clearSubtaskInput()" src="./img/close.svg">
                      <div class="divider"></div>
                      <img onclick="addSubtask()" src="./img/check.svg">
                    </div>
                    <img id="subtasks-plus-icon" src="./img/add.svg" type="button" onclick="addSubtask()"/>
                  </div>
                </div>
                <ul id="subtasksContent"></ul>
                <span id="errorMessageSubtasks"></span>
              </div>
            </div>
            <div id="required-field-mobile">
                  <span style="color: #ff8190;">*</span>
                  <span>This field is required</span>
              </div>
          </div>
          <div class="addtask-bottom-container">
          <div id="required-field">
                  <span style="color: #ff8190;">*</span>
                  <span>This field is required</span>
          </div>
            <div class="addtask-buttons">
            <button id="add-task-close" class="btn-cancel" type="button" onclick="handleCancel(event)">
                <span class="add-task-btn">Clear ✖</span>
              </button>
              <button onclick="createTask(event)" id="add-task-create" class="btn-create" type="button">
                 <span class="add-task-btn">Create task ✓</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div id="task-message-container" class="d-none">
    <div id="task-succes" class="hide-add-task"><span>Task successfully created</span></div>
</div>`;
}

function assignUserHTML(contact) {
  return `
        <div class="assigned-user-container" data-firstname="${contact.firstName}" data-lastname="${contact.lastName}" data-color="${contact.color}">
        <div id="assigned-user-svg">
          <svg class="customCircle" width="50" height="50">
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke=${contact.color}" stroke-width="1" fill="${contact.color}"></circle>
            <text stroke="white" stroke-width="1" font-weight="normal" class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
          </svg>
        </div>
        <div id="assigned-user-name-container">
          <span>${contact.firstName}</span>
          <span>${contact.lastName}</span>
        </div>
        <input class="checkbox-add-task" type="checkbox">
        </div>`;
}

function showAssignedUsersHTML(contact) {
  return `<svg class="customCircle" width="50" height="50" >
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="${contact.color}" stroke-width="1" fill="${contact.color}"></circle>
            <text class="textInCircle"  font-weight="normal" stroke="white" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
        </svg>`;
}
function renderAddTaskCategoriesHTML(category) {
  return `<div class="addtask-category" onclick="selectAddTaskCategory('${category}')">
          ${category}
          </div>`;
}

function addSubtaskHTML(liId, spanId, inputId, subtaskInput) {
  return `<li id="${liId}" class="subtask-item">
          <div class="dot"></div>
          <div class="subtask-text">
              <span id="${spanId}" onclick="editSubtask('${liId}', '${spanId}', '${inputId}')">${subtaskInput.value}</span>
          </div>
          <div class="subtask-icon">
              <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="./img/edit.svg" alt="edit">
              <div class="divider"></div>
              <img onclick="deleteSubtask('${liId}')" src="./img/delete.svg" alt="delete">
          </div>
      </li>`;
}

function editSubtaskHTML(liId, spanId, inputId, currentText) {
  return `<div class="subtask-input-wrapper edit-mode">
            <input id="${inputId}" class="edit-subtask-input" type="text" maxlength="20" value="${currentText}">
            <div class="input-icons-edit">
                <img src ="./img/deletecopy.svg" onclick="deleteSubtask('${liId}')">
                <div class="divider"></div>
                <img src="./img/check1.svg" onclick="saveSubtask('${liId}', '${inputId}', '${spanId}')">
            </div>
        </div>`;
}

function saveSubtaskHTML(liId, inputId, spanId, input) {
  return `<div class="subtask-text">
              <div class="dot"></div>
              <span id="${spanId}" onclick="editSubtask('${liId}', '${spanId}', '${inputId}')">${input.value}</span>
          </div>
          <div class="subtask-icon">
              <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="./img/edit.svg" alt="edit">
              <div class="divider"></div>
              <img id="deleteBtn-${liId}" onclick="deleteSubtask('${liId}')" src="./img/delete.svg" alt="delete">
          </div>`;
}
