function renderAddTaskHTML() {
  let content = document.getElementById("add-task-content");
  content.innerHTML = /*html*/ `
      <div class="addtask-fullscreen-content">
      <div class="addtask-main-content">
        <div>
          <h1>Add Task</h1>
        </div>
        <form>
          <div class="addtask-form-container">
            <div class="addtask-form-left-top">
              <div class="field-text-flex">
                <label>
                  Title
                  <span style="color: #ff8190">*</span>
                </label>
                <div id="errorMassageTitle"></div>
                <input class="input-addtask" id="title" type="text" placeholder="Enter a title" maxlength="40"/>
                <span id="addTitleError" class="validSpanTitle"></span>
              </div>
              <div class="field-text-flex" id="addTaskDiscription">
                <label>Description</label>
                <textarea id="description" placeholder="Enter a Description" cols="30" rows="10"></textarea>
              </div>
              <div class="field-text-flex" id="addTaskAssignedTo">
                  <div class="form-group">
                    <label for="assigned-to">Assigned to</label>
                    <div id="custom-dropdown" class="custom-dropdown input-addtask">
                      <div class="dropdown-placeholder">Select contacts to assign</div>
                      <div class="dropdown-options"></div>
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
                <input class="input-addtask" id="addTaskInputDueDate" type="date" min="2024-12-01"/>
                <span id="addDateError" class="validSpanDate"></span>
              </div>
              <div class="prio-content field-text-flex">
                <label>Prio</label>
                <div class="prio-btn-content">
                  <button id="prio-urgent" class="prio-button" onclick="setPriority('urgent')" type="button">
                    Urgent
                    <img id="prio-image-urgent" src="../img/Prio_urgent_color.png" alt=""/>
                  </button>
                  <button id="prio-medium" class="prio-button" onclick="setPriority('medium')" type="button">
                    Medium
                    <img id="prio-image-medium" src="../img/Prio_medium_color.png" alt=""/>
                  </button>
                  <button id="prio-low" class="prio-button" onclick="setPriority('low')" type="button">
                    Low
                    <img id="prio-image-low" src="../img/Prio_low_color.png" alt=""/>
                  </button>
                </div>
              </div>
              <div class="field-text-flex" id="addTaskCategory">
                <label>
                  Category
                  <span style="color: #ff8190">*</span>
                </label>
                <input class="input-addtask" onclick="openAddTaskCategories()" id="categoryInput" type="text" placeholder="Select task category" maxlength="40" readonly>
                <img onclick="openAddTaskCategories()" id="arrowDropMenuCategory" src="../img/arrow_drop_down.png" alt=""/>
                <div id="dropDownCategoryMenu"></div>
                <span id="addCategoryError"  class="validSpanCategory"></span>
              </div>
              <div class="field-text-flex" id="addTaskSubtasks">
                <label>
                  Subtasks
                </label>
                <div class="subtask-input-wrapper">
                  <input class="input-addtask plus-minus-drop-menu" id="subtaskInput" type="text" placeholder="Add a new subtask"  maxlength="40" onfocus="showClearButton()">
                  <div class="input-icons">
                    <div id="clear-add-icons" class="d-none">
                      <img onclick="clearSubtaskInput()" src="../img/close.svg">
                      <div class="divider"></div>
                      <img onclick="addSubtask()" src="../img/check.svg">
                    </div>
                    <img id="subtasks-plus-icon" src="../img/add.png" type="button" onclick="addSubtask()"/>
                  </div>
                </div>
                <ul id="subtasksContent"></ul>
                <span>
              <span style="color: #ff8190">*</span>
              This field is required
            </span>
              </div>
            </div>
          </div>
          <div class="addtask-bottom-container">
            
            <div class="addtask-buttons">
            <button id="add-task-close" class="btn-cancel">
                <span class="add-task-btn">Clear ✖</span>
              </button>
              <button onclick="createTask(event)" id="add-task-create" class="btn-create" type="button">
                 <span class="add-task-btn">Create task 🗸</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div id="task-message-container">
    <div id="task-succes" class="hide-add-task"><span>Task successfully created</span></div>
</div>`;
}

function assignUserHTML(contact) {
  return `
        <div id="assigned-user-svg">
          <svg class="customCircle" width="50" height="50">
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="${getRandomColor()}" stroke-width="2" fill="white"></circle>
            <text class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
          </svg>
        </div>
        <div id="assigned-user-name-container">
          <span>${contact.firstName}</span>
          <span>${contact.lastName}</span>
        </div>
        <input id="checkbox${contact.id}" onclick="assignUser('${contact.firstName}', '${contact.lastName}')" type="checkbox">`;
}

function showAssignedUsersHTML(contact) {
  return `<svg class="customCircle" width="50" height="50" >
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="${getRandomColor()}" stroke-width="2" fill="white"></circle>
            <text class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
        </svg>`;
}
