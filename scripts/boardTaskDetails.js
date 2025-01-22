/**
 * Retrieves the subtasks of a task or returns an empty string if none exist.
 *
 * @function getSubTasks
 * @param {Object} task - The task object containing subtasks.
 * @returns {string} The generated HTML for the subtasks or an empty string.
 */
function getSubTasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "";
  }
  return generateSubTasksHTML(task);
}

/**
 * Generates the HTML for the subtasks of a task.
 *
 * @function generateSubTasksHTML
 * @param {Object} task - The task object containing subtasks.
 * @returns {string} The generated HTML for the subtasks.
 */
function generateSubTasksHTML(task) {
  let subtTasksHTML = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    subtTasksHTML += createSubTaskHTML(task, i);
  }
  return subtTasksHTML;
}

/**
 * Aktualisiert den Fortschritt und die Anzeige der erledigten Teilaufgaben eines Tasks.
 * 
 * @param {string} taskId - Die ID des Tasks, dessen Teilaufgaben aktualisiert werden sollen.
 */
function updateCompletedSubtasks(taskId) {
  const task = taskArray.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return;

  const completedCount = task.subtasks.filter(
    (subtask) => subtask.checkbox
  ).length;
  const totalSubtasks = task.subtasks.length;

  const renderCompleted = document.getElementById(`amountOfSubtasks-${taskId}`);
  const progressBar = document.getElementById(`progress-${taskId}`);

  if (renderCompleted && progressBar) {
    if (totalSubtasks > 0) {
      updateProgressDisplay(renderCompleted, progressBar, completedCount, totalSubtasks);
    } else {
      hideProgressDisplay(renderCompleted, progressBar);
    }
  }
}

/**
 * Hilfsfunktion zum Aktualisieren der Anzeige des Fortschrittsbalkens und der erledigten Teilaufgaben.
 * 
 * @param {HTMLElement} renderCompleted - Das HTML-Element, das die Anzahl der erledigten Teilaufgaben anzeigt.
 * @param {HTMLElement} progressBar - Der Fortschrittsbalken (HTML-Element), dessen Wert aktualisiert wird.
 * @param {number} completedCount - Die Anzahl der erledigten Teilaufgaben.
 * @param {number} totalSubtasks - Die Gesamtzahl der Teilaufgaben.
 */
function updateProgressDisplay(renderCompleted, progressBar, completedCount, totalSubtasks) {
  renderCompleted.innerHTML = `${completedCount} / ${totalSubtasks} Subtasks`;
  progressBar.value = (completedCount / totalSubtasks) * 100;
  renderCompleted.style.display = "";
  progressBar.style.display = "";
}

/**
 * Hilfsfunktion zum Verbergen der Anzeige des Fortschrittsbalkens und der erledigten Teilaufgaben.
 * 
 * @param {HTMLElement} renderCompleted - Das HTML-Element, das die Anzahl der erledigten Teilaufgaben anzeigt.
 * @param {HTMLElement} progressBar - Der Fortschrittsbalken (HTML-Element), dessen Wert aktualisiert wird.
 */
function hideProgressDisplay(renderCompleted, progressBar) {
  renderCompleted.style.display = "none";
  progressBar.style.display = "none";
}

/**
 * Determines the number of subtasks a task has.
 *
 * @function findAmountOfSubtasks
 * @param {Object} task - The task object containing subtasks.
 * @returns {string} The number of subtasks as a string or "0" if none exist.
 */
function findAmountOfSubtasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "0";
  }
  return task.subtasks.length.toString();
}

/**
 * Creates the HTML for a single task.
 *
 * @function createTaskHTML
 * @param {Object} task - The task object for which the HTML should be created.
 * @returns {string} The generated HTML for the task.
 */
function createTaskHTML(task) {
  const completedSubtasks = task.subtasks
    ? task.subtasks.filter((subtask) => subtask.checkbox).length
    : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  return getTaskHTML(task, completedSubtasks, totalSubtasks);
}

/**
 * Displays the detail view of a task.
 *
 * @function showTaskCard
 * @param {string} id - The ID of the task to be displayed.
 * @returns {void}
 */
function showTaskCard(id) {
  const task = taskArray.find((task) => task.id === id);
  const taskCardOverlay = document.getElementById("taskDetailView");
  taskCardOverlay.innerHTML = "";
  taskCardOverlay.classList.remove("d-none");
  taskCardOverlay.innerHTML += showTaskCardHTML(task);
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

/**
 * Closes the detail view of a task.
 *
 * @function closeDetailView
 * @returns {void}
 */
function closeDetailView() {
  const taskCardOverlay = document.getElementById("taskDetailView");
  if (!taskCardOverlay) {
    console.error("Element with ID 'taskDetailView' not found.");
    return;
  }
  taskCardOverlay.classList.add("d-none");
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

/**
 * Creates the HTML for the detail view of a task.
 *
 * @function showTaskCardHTML
 * @param {Object} task - The task object for which the detail HTML should be created.
 * @returns {string} The generated HTML for the task's detail view.
 */
function showTaskCardHTML(task) {
  return /*html*/ `
    <div id="currentTaskCard${task.id}" class="currentTaskCard">
        ${getTaskCategoryButtonHTML(task)}
        ${getTaskDetailsHTML(task)}
        <div class="taskOwnersSection">
            <p class="firstTableColumnFont">Assigned To:</p>
            <div class="assignedOwnersContainer">
            ${getAssignedOwnersHTML(task)}
            </div>
        </div>
    </div>
    `;
}

/**
 * Creates the HTML for the task category button in the detail view.
 *
 * @function getTaskCategoryButtonHTML
 * @param {Object} task - The task object with category information.
 * @returns {string} The generated HTML for the category button.
 */
function getTaskCategoryButtonHTML(task) {
  return /*html*/ `
    <div class="headAreaTaskcard">
        <div id="taskButton-${task.id}" class="${getTaskCategoryClass(
    task.taskCategory
  )}">
        ${task.taskCategory}
        </div>
        <div onclick="closeDetailView()" class="closeCardParent">
            <img class="closeCard" src="./img/close.svg" alt="Close">
        </div>
    </div>
    `;
}

/**
 * Displays the delete confirmation prompt.
 *
 * @function askFordeleteTask
 * @returns {void}
 */
function askFordeleteTask() {
  const deleteDiv = document.getElementById("deleteConfirmation");
  if (!deleteDiv) {
    console.error("Element with ID 'deleteConfirmation' not found.");
    return;
  }
  deleteDiv.classList.remove("d-none");
}

/**
 * Überprüft, ob eine Aufgabe im Array vorhanden ist.
 *
 * @function checkTaskExistence
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {Array} taskArray - Das Array mit Aufgaben.
 * @returns {boolean} - Gibt `true` zurück, wenn die Aufgabe gefunden wird, andernfalls `false`.
 */
function checkTaskExistence(taskId, taskArray) {
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task with ID ${taskId} not found.`);
    return false;
  }
  return true;
}

/**
 * Löscht eine Aufgabe aus Firebase und aktualisiert die Anzeige.
 *
 * @async
 * @function deleteTask
 * @param {string} taskId - Die ID der zu löschenden Aufgabe.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  if (!checkTaskExistence(taskId, taskArray)) return;
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    taskArray.splice(taskArray.findIndex((task) => task.id === taskId), 1);
    closeDetailView();
    updateTaskHTML();
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
  }
}

/**
 * Closes the delete confirmation prompt.
 *
 * @function closeQuestionDelete
 * @returns {void}
 */
function closeQuestionDelete() {
  const deleteQuestDiv = document.getElementById("deleteConfirmation");
  if (!deleteQuestDiv) {
    console.error("Element with ID 'deleteConfirmation' not found.");
    return;
  }
  deleteQuestDiv.classList.add("d-none");
}

/**
 * Toggles the checkbox status of a subtask and updates Firebase.
 *
 * @async
 * @function toggleSubtaskCheckbox
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask in the task list.
 * @returns {Promise<void>}
 */
async function toggleSubtaskCheckbox(taskId, subtaskIndex) {
  const task = taskArray.find((task) => task.id === taskId);
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task or subtask not found.");
    return;
  }
  const subtask = task.subtasks[subtaskIndex];
  subtask.checkbox = !subtask.checkbox;
  try {
    await updateTaskInFirebase(task);
  } catch (error) {
    console.error(`Error updating subtask: ${error}`);
  }
  updateTaskHTML();
}

/**
 * Creates the HTML for the assigned owners of a task.
 *
 * @function getAssignedOwnersHTML
 * @param {Object} task - The task object with owner information.
 * @returns {string} The generated HTML for the assigned owners.
 */
function getAssignedOwnersHTML(task) {
  if (!task.owner || task.owner.length === 0) {
    return getNoOwnersHTML();
  }
  return task.owner.map(getOwnerItemHTML).join("\n");
}

/**
 * Determines the CSS class based on the task category.
 *
 * @function getTaskCategoryClass
 * @param {string} taskCategory - The category of the task.
 * @returns {string} The corresponding CSS class for the category.
 */
function getTaskCategoryClass(taskCategory) {
  if (taskCategory === "Technical Task")
    return "task-category-technicalTask-taskCard";
  if (taskCategory === "User Story")
    return "task-category-userExperience-taskCard";
  return "task-category-undefined";
}

/**
 * Highlights a drag area.
 *
 * @function highlight
 * @param {string} id - The ID of the element to be highlighted.
 * @returns {void}
 */
function highlight(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add("dragAreaHighlight");
  } else {
    console.error(`Element with ID '${id}' not found.`);
  }
}

/**
 * Removes the highlight from a drag area.
 *
 * @function removeHighlight
 * @param {string} id - The ID of the element whose highlight should be removed.
 * @returns {void}
 */
function removeHighlight(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.remove("dragAreaHighlight");
  } else {
    console.error(`Element with ID '${id}' not found.`);
  }
}



