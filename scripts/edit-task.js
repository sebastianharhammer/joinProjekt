/**
 * Shows the edit template for a specific task.
 * @param {number} taskId - The ID of the task to be edited.
 */
function showEditTaskTempl(taskId) {
  currentTaskBeingEdited = taskId;
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task not found!");
    return;
  }
  assignedUserArr = task.owner ? [...task.owner] : [];
  toggleEditAndDetailView();
  const editView = document.getElementById("editTaskTempl");
  editView.innerHTML = getEditTemplate(task);
  initializeEditTask(taskId, task);
}

/**
 * Toggles between detail and edit view.
 */
function toggleEditAndDetailView() {
  const detailView = document.getElementById("taskDetailView");
  const editView = document.getElementById("editTaskTempl");

  detailView.classList.add("d-none");
  editView.classList.remove("d-none");
}

/**
 * Initializes the editing of a task.
 * @param {number} taskId - The ID of the task to be edited.
 * @param {Object} task - The task object.
 */
function initializeEditTask(taskId, task) {
  setupEditTaskEventListeners(taskId);
  getUsersForEditDropDown();
  updateAssignedUsersDisplay();
  setPriority(task.prio);
  renderEditSubtasks(task);
}

/**
 * Skips editing a task and shows the detail view.
 * @param {number} taskId - The ID of the task.
 */
function skipEdit(taskId) {
  document.getElementById("editTaskTempl")?.classList.add("d-none");
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) return console.error(`Task with ID ${taskId} not found.`);
  const detailView = document.getElementById("taskDetailView");
  if (!detailView) return;
  detailView.innerHTML = "";
  detailView.classList.remove("d-none");
  detailView.innerHTML += showTaskCardHTML(task);
}

/**
 * Closes the edit view of a task.
 */
function closeEditTask() {
  const overlayEdit = document.getElementById("editTaskTempl");
  if (overlayEdit) {
    overlayEdit.classList.add("d-none");
  }
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

/**
 * Saves the edited task to the server.
 */
async function saveEditedTask() {
  const taskId = currentTaskBeingEdited;
  const updatedTask = prepareUpdatedTask(taskId);
  if (!updatedTask) return;

  try {
    await updateTaskOnServer(taskId, updatedTask);
    updateTaskHTML();
    closeEditTask();
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
  }
}

/**
 * Updates the task on the server (Firebase).
 *
 * @param {number} taskId - The ID of the task to update.
 * @param {Object} updatedTask - The updated task object.
 * @returns {Promise<void>} A promise that resolves when the task is successfully updated.
 */
async function updateTaskOnServer(taskId, updatedTask) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask), // Send the updated task as JSON
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update task with ID ${taskId}: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

/**
 * Prepares the updated task.
 * @param {number} taskId - The ID of the task.
 * @returns {Object|null} The updated task or null.
 */
function prepareUpdatedTask(id) {
  const i = taskArray.findIndex((t) => t.id === id);
  if (i < 0) return console.error(`Task with ID ${id} not found.`) || null;
  return (taskArray[i] = {
    ...taskArray[i],
    title: document.querySelector("#editTaskCard input").value,
    description: document.getElementById("editDescription").value,
    date: document.getElementById("edit-due-date").value,
    owner: prepareAssignedUsers(),
    subtasks: extractSubtasksFromDOM(),
  });
}

/**
 * Prepares the assigned users for storage.
 * @returns {Array<Object>} The array of assigned users.
 */
function prepareAssignedUsers() {
  return assignedUserArr.map((user) => ({
    ...user,
    initials: `${getFirstLetter(user.firstName)}${getFirstLetter(
      user.lastName
    )}`,
  }));
}
