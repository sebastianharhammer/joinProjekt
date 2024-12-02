function renderAddTaskHTML() {
    let content = document.getElementById('add-task-content');
    content.innerHTML = /*html*/`
    <div id="add-task-content-wrapper">
      <div id="headline-container">
        <h1 id="add-task-headline">Add Task</h1>
      </div>
      <div class="container">
    
      <div id="task-left">
        <form class="task-form">
          <div class="form-group">
            <label for="title">Title <span class="required">*</span></label>
            <input type="text" id="title" placeholder="Enter a title" required>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" placeholder="Enter a Description"></textarea>
          </div>
          <div class="form-group">
            <label for="assigned-to">Assigned to</label>
              <div id="custom-dropdown" class="custom-dropdown">
                <div class="dropdown-placeholder">Select contacts to assign</div>
                <div class="dropdown-options"></div>
              </div>
              <div id="assigned-users-short"></div>
            </div>
          </div>
    <div id="task-right">
      <div class="form-group">
        <label for="due-date">Due date <span class="required">*</span></label>
        <input type="date" id="due-date" required>
      </div>

      <div class="form-group">
        <span id="prio-label">Prio:</span>
        <div class="prio-options">
          <button id="prio-urgent" onclick="setPriority('urgent')" type="button" class="prio-button">Urgent</button>
          <button id="prio-medium" onclick="setPriority('medium')" type="button" class="prio-button">Medium</button>
          <button id="prio-low" onclick="setPriority('low')" type="button" class="prio-button">Low</button>
        </div>
      </div>

    <div class="form-group">
        <label for="category">Category <span class="required">*</span></label>
        <select id="category">
            <option value="" disabled selected>Select a category</option>
            <option value="user-story">User Story</option>
            <option value="technical-task">Technical Task</option>
        </select>
    </div>
      <div class="form-group">
        <label for="subtasks">Subtasks</label>
        <div class="subtasks">
          <input type="text" id="subtasks" placeholder="Add new subtask">
          <button type="button" class="add-subtask" onclick="addSubtask()">+</button>
        </div>
        <div id="temp-subtasks-container"></div>
      </div>

      <div class="form-actions">
        <button type="reset" class="clear-button">Clear</button>
        <button type="submit" class="create-task-button" onclick="createTask()">Create Task</button>
      </div>
    </form>
  </div>
  </div>
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

function showAssignedUsersHTML(contact) {
  return `<svg class="customCircle" width="10" height="10">
            <circle id="user-circle" class="circleBorder" cx="50%" cy="50%" r="24" stroke="rgb(42,54,71)" stroke-width="2" fill="white"></circle>
            <text class="textInCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}</text>
        </svg>`;
}