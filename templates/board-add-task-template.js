function addTaskOverlayHTML() {
  return `
<div class="addtask-overlay-content">
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
                    <div id="custom-dropdown" class="custom-dropdown">
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
                    <img id="urgentImg" src="../img/Prio_urgent_color.png" alt=""/>
                  </button>
                  <button id="prio-medium" class="prio-button" onclick="setPriority('medium')" type="button">
                    Medium
                    <img id="mediumImg" src="../img/Prio_medium_color.png" alt=""/>
                  </button>
                  <button id="prio-low" class="prio-button" onclick="setPriority('low')" type="button">
                    Low
                    <img id="lowImg" src="../img/Prio_low_color.png" alt=""/>
                  </button>
                </div>
              </div>
              <div class="field-text-flex" id="addTaskCategory">
                <label>
                  Category
                  <span style="color: #ff8190">*</span>
                </label>
                <input class="input-addtask" onclick="openCategories()" id="categoryInput" type="text" placeholder="Select task category" maxlength="40" readonly/>
                <img onclick="openCategories()" id="arrowDropMenuCategory" src="../img/arrow_drop_down.png" alt=""/>
                <div id="dropDownCategoryMenu"></div>
                <span id="addCategoryError" class="validSpanCategory"></span>
              </div>
              <div class="field-text-flex" id="addTaskSubtasks">
                <label>
                  Subtasks
                </label>
                <div class="subtask-input-wrapper">
                  <input class="input-addtask plus-minus-drop-menu" id="subtaskInput" type="text" placeholder="Add a new subtask"  maxlength="40" onfocus="showClearButton()"/>
                  <div class="input-icons">
                    <div id="clear-add-icons" class="d-none">
                      <img onclick="clearSubtaskInput()" src="../img/close.svg"/>
                      <div class="divider"></div>
                      <img onclick="addSubtask()" src="../img/check.svg"/>
                    </div>
                    <img id="subtasks-plus-icon" src="../img/add.png" type="button" onclick="addSubtask()"/>
                  </div>
                </div>
                <ul id="subtasksContent"></ul>
              </div>
            </div>
          </div>
          <div class="addtask-bottom-container">
            <span>
              <span style="color: #ff8190">*</span>
              This field is required
            </span>
            <div class="addtask-buttons">
              <button id="add-task-close" class="btn-cancel">
                Clear<img class="btn-cancel-icon" src="../img/iconoir_cancel.svg"/>
              </button>
              <button onclick="createTask('to-do', event)" id="add-task-create" class="btn-create" type="button">
                 Create task
                 <img src="../img/check.svg" />
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
    <div id="render-task-details"></div>
    <div id="task-success" class="task-success">
      Task successfully created
    </div>`;
}

function assignUserHTML(contact) {
  return `
    <div id="assigned-user${contact.id}">
        <svg class="customCircle" width="10" height="10">
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="rgb(42,54,71)" stroke-width="2" fill="white"></circle>
            <text class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
        </svg>
        <span>${contact.firstName}</span>
        <span>${contact.lastName}</span>
        <input id="checkbox${contact.id}" onclick="assignUser('${contact.firstName}', '${contact.lastName}')" type="checkbox">
    </div>`;
}