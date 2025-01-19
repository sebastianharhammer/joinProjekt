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

function showSubtaskError(errorMessageSubtasks) {
  if (errorMessageSubtasks) {
    errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 1500);
  }
}

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
  if (spanElement && li) {
    const currentText = spanElement.textContent;
    if (currentText.trim() !== "") {
      li.innerHTML = editSubtaskHTML(liId, spanId, inputId, currentText);
      li.classList.add("subtask-item-on-focus");
      li.classList.remove("subtask-item");
    } else {
      if (errorMessageSubtasks) {
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 3000);
      }
    }
  } else {
    console.error("Span-Element oder Listenelement nicht gefunden.");
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
  if (li && input) {
    if (input.value.trim() !== "") {
      li.innerHTML = saveSubtaskHTML(liId, inputId, spanId, input);
      li.classList.remove("subtask-item-on-focus");
      li.classList.add("subtask-item");
    } else {
      if (errorMessageSubtasks) {
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 1500);
      }
    }
  } else {
    console.error("Listenelement oder Input-Element nicht gefunden.");
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
