/**
 * Edits an existing subtask in the edit view.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function editExistingSubtaskEditView(taskId, subtaskIndex) {
  const subtaskTextElement = editFindSubtaskElement(taskId, subtaskIndex);
  if (!subtaskTextElement) return;
  const inputElement = editCreateInputElement(subtaskTextElement);
  editUpdateEditIcon(taskId, subtaskIndex);
  editSetupInputBehavior(inputElement, taskId, subtaskIndex);
}

/**
 * Finds the DOM element of the subtask to edit.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {HTMLElement|null} The found element or null.
 */
function editFindSubtaskElement(taskId, subtaskIndex) {
  const subtaskTextId = `subtask-text-${taskId}-${subtaskIndex}`;
  const subtaskTextElement = document.getElementById(subtaskTextId);
  if (!subtaskTextElement) {
    console.error(`Subtask text element with ID ${subtaskTextId} not found.`);
    return null;
  }
  return subtaskTextElement;
}

/**
 * Creates an input element for the subtask.
 * @param {HTMLElement} subtaskTextElement - The text element of the subtask.
 * @returns {HTMLInputElement} The created input element.
 */
function editCreateInputElement(subtaskTextElement) {
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.value = subtaskTextElement.textContent.replace("• ", "").trim();
  inputElement.className = "subtaskInputInEdit";
  subtaskTextElement.replaceWith(inputElement);
  return inputElement;
}

/**
 * Updates the edit icon of the subtask.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function editUpdateEditIcon(taskId, subtaskIndex) {
  const editIcon = document.querySelector(
    `#edit-subtask-${taskId}-${subtaskIndex + 1} .edit-icon`
  );
  if (editIcon) {
    editIcon.src = "./img/check.svg";
    editIcon.classList.add("check-icon-edit");
    editIcon.onclick = null;
  }
}

/**
 * Sets up the behavior of the input element for the subtask.
 * @param {HTMLInputElement} inputElement - The input element.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function editSetupInputBehavior(inputElement, taskId, subtaskIndex) {
  inputElement.addEventListener("blur", () =>
    saveEditedSubtask(taskId, subtaskIndex, inputElement.value)
  );
  inputElement.focus();
}

/**
 * Saves the edited subtask.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} newValue - The new value of the subtask.
 */
function saveEditedSubtask(taskId, subtaskIndex, newValue) {
  const task = findTaskById(taskId);
  if (!isValidSubtask(task, subtaskIndex)) return;

  updateSubtaskValue(task, subtaskIndex, newValue);
  saveTaskToServer(taskId, task);
  updateSubtaskDOM(taskId, subtaskIndex, newValue);
  restoreEditIconBehavior(taskId, subtaskIndex);
}

/**
 * Finds a task by its ID.
 * @param {number} taskId - The ID of the task.
 * @returns {Object|undefined} The found task or undefined.
 */
function findTaskById(taskId) {
  return taskArray.find((t) => t.id === taskId);
}

/**
 * Checks if a subtask is valid.
 * @param {Object} task - The task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {boolean} Returns true if the subtask is valid.
 */
function isValidSubtask(task, subtaskIndex) {
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task or subtask not found.");
    return false;
  }
  return true;
}

/**
 * Updates the value of a subtask.
 * @param {Object} task - The task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} newValue - The new value of the subtask.
 */
function updateSubtaskValue(task, subtaskIndex, newValue) {
  task.subtasks[subtaskIndex].subtask = newValue;
}

/**
 * Saves a task to the server.
 * @param {number} taskId - The ID of the task.
 * @param {Object} task - The task.
 */
function saveTaskToServer(taskId, task) {
  fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then(() => console.log(`Task ${taskId} successfully saved.`))
    .catch((error) => console.error("Error saving the subtask:", error));
}

/**
 * Updates the subtask in the DOM.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} newValue - The new value of the subtask.
 */
function updateSubtaskDOM(taskId, subtaskIndex, newValue) {
  const subtaskContainer = document.getElementById(
    `edit-subtask-${taskId}-${subtaskIndex + 1}`
  );
  if (subtaskContainer) {
    subtaskContainer.innerHTML = getUpdatedSubtaskHTML(
      taskId,
      subtaskIndex,
      newValue
    );
  }
}

/**
 * Restores the behavior of the edit icon of the subtask.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function restoreEditIconBehavior(taskId, subtaskIndex) {
  const editIcon = document.querySelector(
    `#edit-subtask-${taskId}-${subtaskIndex + 1} .edit-icon`
  );
  if (editIcon) {
    editIcon.src = "./img/edit.svg";
    editIcon.onclick = () => editExistingSubtaskEditView(taskId, subtaskIndex);
  }
}

/**
 * Clears the subtask input field.
 */
function emptyInput() {
  let inputField = document.getElementById("input-subtask-in-edit");
  inputField.value = "";
}

/**
 * Adds a new subtask in the edit template.
 */
function addSubTaskInEditTempl() {
  const inputField = document.querySelector(".input-subtask-in-edit");
  const inputValue = inputField.value.trim();
  if (inputValue === "") {
    return;
  }
  const subtaskContainer = document.getElementById("rendered-subtasks-edit");
  const noSubtasksElement = subtaskContainer.querySelector(".noSubtasks");
  if (noSubtasksElement) {
    noSubtasksElement.remove();
  }
  const taskId = currentTaskBeingEdited;
  const subtaskIndex = subtaskContainer.childElementCount;
  const subtaskId = `edit-subtask-${taskId}-${subtaskIndex + 1}`;
  subtaskContainer.innerHTML += createSubtaskEditHTML(
    subtaskId,
    inputValue,
    taskId,
    subtaskIndex
  );
  inputField.value = "";
}

/**
 * Sets up event listeners for editing a task.
 * @param {number} taskId - The ID of the task.
 */
function setupEditTaskEventListeners(taskId) {
  const dueDateInput = document.getElementById("edit-due-date");
  if (dueDateInput) {
    dueDateInput.addEventListener("change", () => {
      const task = taskArray.find((t) => t.id === taskId);
      if (task) {
        task.date = dueDateInput.value;
      }
    });
  }
}

/**
 * Deletes a subtask in the edit view.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function deleteSubtaskEditview(taskId, subtaskIndex) {
  const task = findTaskById(taskId);
  if (!isValidTask(task)) return;

  deleteSubtaskFromTask(task, subtaskIndex);
  updateTaskInFirebaseEdit(taskId, task);
  removeSubtaskElement(taskId, subtaskIndex);
  updateSubtaskContainer();
}

/**
 * Checks if a task is valid.
 * @param {Object} task - The task.
 * @returns {boolean} Returns true if the task is valid.
 */
function isValidTask(task) {
  if (!task || !task.subtasks) {
    console.error("Task or subtasks not found!");
    return false;
  }
  return true;
}

/**
 * Deletes a subtask from the task.
 * @param {Object} task - The task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
function deleteSubtaskFromTask(task, subtaskIndex) {
  task.subtasks.splice(subtaskIndex, 1);
}

/**
 * Updates the task on the server.
 * @param {number} taskId - The ID of the task.
 * @param {Object} task - The updated task.
 * @returns {Promise<Response>} The fetch response.
 */
function updateTaskInFirebaseEdit(taskId, task) {
  return fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

/**
 * Updates the subtask container in the DOM.
 */
function updateSubtaskContainer() {
  const subtaskContainer = document.getElementById("rendered-subtasks-edit");
  if (subtaskContainer.children.length === 0) {
    subtaskContainer.innerHTML = `<p class="noSubtasks">No subtasks available</p>`;
  }
}

/**
 * Extracts the subtasks from the DOM.
 * @returns {Array<Object>} The array of extracted subtasks.
 */
function extractSubtasksFromDOM() {
  const subtaskElements = document.querySelectorAll(
    "#rendered-subtasks-edit .subtaskFontInEdit"
  );
  return Array.from(subtaskElements).map((subtaskElement) => ({
    subtask: subtaskElement.textContent.replace("• ", "").trim(),
    checkbox: false,
  }));
}
