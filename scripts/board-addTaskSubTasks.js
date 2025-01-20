/**
 * Adds a new subtask.
 *
 * @function addTaskSubtask
 * @returns {void}
 */
function addTaskSubtask() {
  const subtaskInput = document.getElementById("subtaskInput");
  const subtasksContent = document.getElementById("subtasksContent");
  const errorMessageSubtasks = document.getElementById("errorMessageSubtasks");

  if (!subtaskInput || !subtasksContent) {
    console.error(
      "Element 'subtaskInput' oder 'subtasksContent' nicht gefunden."
    );
    return;
  }

  handleSubtaskInput(subtaskInput, subtasksContent, errorMessageSubtasks);
  updateSubtaskIcons();
}

/**
 * Handles the input of a new subtask.
 *
 * @function handleSubtaskInput
 * @param {HTMLInputElement} subtaskInput - The input element for subtasks
 * @param {HTMLElement} subtasksContent - The container element for subtasks
 * @param {HTMLElement} errorMessageSubtasks - The element for displaying error messages
 * @returns {void}
 */
function handleSubtaskInput(
  subtaskInput,
  subtasksContent,
  errorMessageSubtasks
) {
  if (subtaskInput.value.trim() !== "") {
    const subtaskData = addTaskCreateSubtask(subtaskInput.value);
    subtasksContent.innerHTML += subtaskData.html;
    subtaskInput.value = "";
  } else {
    showSubtaskError(errorMessageSubtasks);
  }
}

/**
 * Shows an error message for invalid subtask input.
 *
 * @function showSubtaskError
 * @param {HTMLElement} errorMessageSubtasks - The element for displaying error messages
 * @returns {void}
 */
function showSubtaskError(errorMessageSubtasks) {
  if (errorMessageSubtasks) {
    errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 1500);
  }
}

/**
 * Updates the visibility of subtask icons.
 *
 * @function updateSubtaskIcons
 * @returns {void}
 */
function updateSubtaskIcons() {
  const clearAddIcons = document.getElementById("clear-add-icons");
  const subtasksPlusIcon = document.getElementById("subtasks-plus-icon");

  if (clearAddIcons && subtasksPlusIcon) {
    clearAddIcons.classList.add("d-none");
    subtasksPlusIcon.classList.remove("d-none");
  }
}

/**
 * Creates a new subtask and returns the HTML.
 *
 * @function addTaskCreateSubtask
 * @param {string} subtaskValue - The value of the subtask.
 * @returns {Object} An object containing the generated HTML.
 */
function addTaskCreateSubtask(subtaskValue) {
  subtaskIdCounter++;
  const liId = "subtask-" + subtaskIdCounter;
  const spanId = "span-" + subtaskIdCounter;
  const inputId = "input-" + subtaskIdCounter;
  subtasksArr.push({
    checkbox_img: "../img/checkbox-empty.svg",
    subtask: subtaskValue,
  });
  subtasksEdit.push({
    checkbox_img: "../img/checkbox-empty.svg",
    subtask: subtaskValue,
  });
  return {
    html: addSubtaskHTML(liId, spanId, inputId, { value: subtaskValue }),
  };
}

/**
 * Validates if a subtask can be edited.
 * 
 * @function validateSubtaskEdit
 * @param {HTMLElement} spanElement - The span element containing the subtask text
 * @param {HTMLElement} errorMessageSubtasks - The error message element
 * @returns {boolean} Whether the subtask is valid for editing
 */
function validateSubtaskEdit(spanElement, errorMessageSubtasks) {
    const currentText = spanElement.textContent;
    if (currentText.trim() === "") {
        if (errorMessageSubtasks) {
            errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
            setTimeout(() => {
                errorMessageSubtasks.innerHTML = "";
            }, 3000);
        }
        return false;
    }
    return true;
}

/**
 * Edits a subtask and enables text editing.
 *
 * @function editSubtask
 * @param {string} liId - The ID of the list element.
 * @param {string} spanId - The ID of the span element.
 * @param {string} inputId - The ID of the input element.
 * @returns {void}
 */
function editSubtask(liId, spanId, inputId) {
    const spanElement = document.getElementById(spanId);
    const li = document.getElementById(liId);
    const errorMessageSubtasks = document.getElementById("errorMessageSubtasks");

    if (!spanElement || !li) {
        console.error("Span-Element oder Listenelement nicht gefunden.");
        return;
    }

    if (validateSubtaskEdit(spanElement, errorMessageSubtasks)) {
        li.innerHTML = editSubtaskHTML(liId, spanId, inputId, spanElement.textContent);
        li.classList.add("subtask-item-on-focus");
        li.classList.remove("subtask-item");
    }
}

/**
 * Deletes a subtask from the list.
 *
 * @function deleteSubtask
 * @param {string} listId - The ID of the list element.
 * @returns {void}
 */
function deleteSubtask(listId) {
  const list = document.getElementById(listId);
  if (list) {
    list.remove();
  } else {
    console.error(`Listenelement mit ID '${listId}' nicht gefunden.`);
  }
}

/**
 * Validates the subtask input value.
 *
 * @function validateSubtaskSave
 * @param {HTMLInputElement} input - The input element to validate
 * @param {HTMLElement} errorMessageSubtasks - The error message element
 * @returns {boolean} Whether the input is valid
 */
function validateSubtaskSave(input, errorMessageSubtasks) {
    if (input.value.trim() === "") {
        if (errorMessageSubtasks) {
            errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
            setTimeout(() => {
                errorMessageSubtasks.innerHTML = "";
            }, 1500);
        }
        return false;
    }
    return true;
}

/**
 * Saves the edited subtask.
 *
 * @function saveSubtask
 * @param {string} liId - The ID of the list element.
 * @param {string} inputId - The ID of the input element.
 * @param {string} spanId - The ID of the span element.
 * @returns {void}
 */
function saveSubtask(liId, inputId, spanId) {
    const li = document.getElementById(liId);
    const input = document.getElementById(inputId);
    const errorMessageSubtasks = document.getElementById("errorMessageSubtasks");
    
    if (!li || !input) {
        console.error("Listenelement oder Input-Element nicht gefunden.");
        return;
    }

    if (validateSubtaskSave(input, errorMessageSubtasks)) {
        li.innerHTML = saveSubtaskHTML(liId, inputId, spanId, input);
        li.classList.remove("subtask-item-on-focus");
        li.classList.add("subtask-item");
    }
}

/**
 * Clears the content of the subtask input field.
 *
 * @function clearSubtaskInput
 * @returns {void}
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  if (input) {
    input.value = "";
  } else {
    console.error("Element mit ID 'subtaskInput' nicht gefunden.");
  }
}
