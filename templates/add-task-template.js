function renderAddTaskHTML() {
    let content = document.getElementById('add-task-content');
    content.innerHTML = `
    <div id="add-task-content-wrapper">
    <div id="headline-container">
    <h1>Add Task</h1>
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
        <select id="assigned-to" class="form-control" name="type" id="select-types">
          <option value="">Select contacts to assign</option>
        </select>
      </div>
      </div>
    <div id="task-right">
      <div class="form-group">
        <label for="due-date">Due date <span class="required">*</span></label>
        <input type="date" id="due-date" required>
      </div>

      <div class="form-group">
        <label for="prio">Prio</label>
        <div class="prio-options">
          <button type="button" class="prio-button urgent">Urgent</button>
          <button type="button" class="prio-button medium selected">Medium</button>
          <button type="button" class="prio-button low">Low</button>
        </div>
      </div>

      <div class="form-group">
        <label for="category">Category <span class="required">*</span></label>
        <select id="category" required>
          <option value="">Select task category</option>
        </select>
      </div>

      <div class="form-group">
        <label for="subtasks">Subtasks</label>
        <div class="subtasks">
          <input type="text" id="subtasks" placeholder="Add new subtask">
          <button type="button" class="add-subtask">+</button>
        </div>
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