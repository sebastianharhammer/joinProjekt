/**
 * Displays the add task form and initializes it.
 *
 * @function showAddTask
 * @param {string} status - The status of the task to be added.
 * @returns {void}
 */
function showAddTask(status) {
  localStatus = status;
  getTasks();
  const addTaskContent = document.getElementById("add-task-content");
  const background = document.getElementById("add-task-background");
  addTaskContent.classList.add("show-add-task");
  background.classList.remove("d-none");
  document.body.classList.add("overflow-hidden");
  addTaskContent.classList.add("position-static");
  addTaskContent.innerHTML = addTaskOverlayHTML();
  getUsers();
  handleDropdownInteraction();
  setPriority("medium");
  window.scrollTo(0, 0);
  document.documentElement.style.overflow = "hidden";
  document.body.scroll = "no";
}

/**
 * Hides the add task form and resets the state.
 *
 * @function hideAddTask
 * @returns {void}
 */
function hideAddTask() {
  const addTaskContent = document.getElementById("add-task-content");
  const background = document.getElementById("add-task-background");
  addTaskContent.classList.remove("show-add-task");
  document.body.classList.remove("overflow-hidden");
  document.documentElement.style.overflow = "scroll";
  document.body.scroll = "yes";
  setTimeout(() => {
    background.classList.add("d-none");
    init();
  }, 250);
}

/**
 * Handles the cancellation of the add task form.
 *
 * @function handleCancel
 * @param {Event} event - The triggering event.
 * @returns {void}
 */
function handleCancel(event) {
  event.preventDefault();
  resetFormInputs();
  resetArrays();
  resetUserSelections();
  setPriority("medium");
}

/**
 * Resets the form input fields.
 *
 * @function resetFormInputs
 * @returns {void}
 */
function resetFormInputs() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("addTaskInputDueDate").value = "";
  document.getElementById("categoryInput").value = "";
  document.getElementById("subtaskInput").value = "";
  document.getElementById("subtasksContent").innerHTML = "";
}

/**
 * Resets the relevant arrays.
 *
 * @function resetArrays
 * @returns {void}
 */
function resetArrays() {
  subtasksArr = [];
  assignedUserArr = [];
  categoryObject = "";
  selectedPriority = "";
  document.getElementById("assigned-users-short").innerHTML = "";
}

/**
 * Resets the user selections.
 *
 * @function resetUserSelections
 * @returns {void}
 */
function resetUserSelections() {
  const userContainers = document.querySelectorAll(".assigned-user-container");
  userContainers.forEach((container) => {
    container.style.backgroundColor = "";
    container.style.color = "";
    container.style.borderRadius = "";
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  });
}

/**
 * Creates a new task and adds it to Firebase.
 *
 * @async
 * @function createTask
 * @param {string} status - The status of the new task.
 * @param {Event} event - The triggering event.
 * @returns {Promise<void>}
 */
async function createTask(status, event) {
  event.preventDefault();
  const taskData = getTaskFormData();
  if (validateTask(taskData.title, taskData.date, taskData.category)) {
    return;
  }
  try {
    const nextId = await getNextTaskId();
    const newTask = createTaskObject(nextId, taskData);
    taskArray.push(newTask);
    await pushTaskToFirebase(newTask);
    handleTaskCreationSuccess();
  } catch (error) {
    console.error("Failed to create the task:", error);
  }
}

/**
 * Retrieves the form data for the new task.
 *
 * @function getTaskFormData
 * @returns {Object} The collected form data.
 */
function getTaskFormData() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    date: document.getElementById("addTaskInputDueDate").value,
    category: categoryObject,
    priority: selectedPriority,
    subtasks: [...subtasksArr],
    assignedUsers: [...assignedUserArr],
  };
}

/**
 * Creates a task object based on the form data.
 *
 * @function createTaskObject
 * @param {number} id - The unique ID of the task.
 * @param {Object} taskData - The task data from the form.
 * @returns {Object} The created task object.
 */
function createTaskObject(id, taskData) {
  return {
    id: id,
    status: localStatus,
    title: taskData.title,
    description: taskData.description,
    date: taskData.date,
    taskCategory: taskData.category || "Undefined Category",
    prio: taskData.priority,
    subtasks: taskData.subtasks,
    owner: taskData.assignedUsers,
  };
}

/**
 * Handles successful task creation.
 *
 * @function handleTaskCreationSuccess
 * @returns {void}
 */
function handleTaskCreationSuccess() {
  showAddTaskSuccesMessage();
  hideAddTask();
}

/**
 * Validates the entered task data.
 *
 * @function validateTask
 * @param {string} title - The task title.
 * @param {string} date - The task due date.
 * @param {string} category - The task category.
 * @returns {boolean} Returns `true` if validation errors exist, otherwise `false`.
 */
function validateTask(title, date, category) {
  let exits = false;
  if (!title) {
    showValidationError("addTitleError", "Title is required!");
    exits = true;
  }
  if (date < new Date().toISOString().split("T")[0]) {
    showValidationError("addDateError", "Date can´t be in the past!");
    exits = true;
  }
  if (!date) {
    showValidationError("addDateError", "Date is required!");
    exits = true;
  }
  if (!category) {
    showValidationError("addCategoryError", "Category is required!");
    exits = true;
  }
  return exits;
}

/**
 * Displays a validation error message and temporarily disables the button.
 *
 * @function showValidationError
 * @param {string} elementId - The ID of the element to display the error message.
 * @param {string} message - The error message.
 * @returns {void}
 */
function showValidationError(elementId, message) {
  const button = document.getElementById("add-task-create");
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.innerHTML = message;
  } else {
    console.error(`Element with ID '${elementId}' not found.`);
  }
  disableButton(button);
  setTimeout(() => {
    enableButton(button);
    if (errorElement) {
      errorElement.innerHTML = "";
    }
  }, 3000);
}

/**
 * Disables a button and changes its appearance.
 *
 * @function disableButton
 * @param {HTMLElement} button - The button to be disabled.
 * @returns {void}
 */
function disableButton(button) {
  if (button) {
    button.disabled = true;
    button.style.backgroundColor = "#000000";
    button.style.color = "#2B3647";
  } else {
    console.error("Button-Element not found.");
  }
}

/**
 * Enables a button and resets its appearance.
 *
 * @function enableButton
 * @param {HTMLElement} button - The button to be enabled.
 * @returns {void}
 */
function enableButton(button) {
  if (button) {
    button.disabled = false;
    button.style.backgroundColor = "#2B3647";
    button.style.color = "#FFFFFF";
  } else {
    console.error("Button-Element not found.");
  }
}

/**
 * Retrieves the next available task ID from Firebase.
 *
 * @async
 * @function getNextTaskId
 * @returns {Promise<number>} The next available task ID.
 */
async function getNextTaskId() {
  try {
    const response = await fetch(`${ADD_TASK_BASE_URL}/tasks.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
    const tasks = await response.json();
    const taskIds = tasks ? Object.values(tasks).map((task) => task.id) : [];
    const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0;
    return maxId + 1;
  } catch (error) {
    console.error("Failed to fetch tasks for ID generation:", error);
    return 20;
  }
}

/**
 * Adds a new task to Firebase.
 *
 * @async
 * @function pushTaskToFirebase
 * @param {Object} newTask - The task object to be added.
 * @returns {Promise<void>}
 */
async function pushTaskToFirebase(newTask) {
  try {
    const key = newTask.id;
    const response = await fetch(`${ADD_TASK_BASE_URL}/tasks/${key}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    const responseToJson = await response.json();
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

/**
 * Displays a success message after adding a task.
 *
 * @function showAddTaskSuccesMessage
 * @returns {void}
 */
function showAddTaskSuccesMessage() {
  const taskOverlayWrapper = document.getElementById(
    "add-task-overlay-wrapper"
  );
  if (!taskOverlayWrapper) {
    console.error("Element with ID 'add-task-overlay-wrapper' not found.");
    return;
  }
  appendSuccessMessageToOverlay(taskOverlayWrapper);
}

/**
 * Initializes the dropdown interactions for adding tasks.
 *
 * @function handleDropdownInteraction
 * @returns {void}
 */
function handleDropdownInteraction() {
  const dropdown = document.getElementById("custom-dropdown");
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  if (dropdown && optionsContainer) {
    dropdown.addEventListener("click", (e) =>
      addTaskHandleDropdownClick(e, optionsContainer)
    );
    optionsContainer.addEventListener("click", addTaskHandleOptionsClick);
  } else {
    console.error("Dropdown-Element or Options-Container not found.");
  }
}

/**
 * Shows the clear button for subtask input.
 *
 * @function showClearButton
 * @returns {void}
 */
function showClearButton() {
  const clearAddIcons = document.getElementById("clear-add-icons");
  const subtasksPlusIcon = document.getElementById("subtasks-plus-icon");
  if (clearAddIcons && subtasksPlusIcon) {
    clearAddIcons.classList.remove("d-none");
    subtasksPlusIcon.classList.add("d-none");
  } else {
    console.error("Elements for Clear-Button or Plus-Icon not found.");
  }
}

/**
 * Hides the dropdown menu.
 *
 * @function closeDropdown
 * @returns {void}
 */
function closeDropdown() {
  const optionsContainer = document.getElementById("dropdown-options");
  if (optionsContainer) {
    optionsContainer.style.display = "none";
  } else {
    console.error("Element with ID 'dropdown-options' not found.");
  }
}

/**
 * Adds the success message to the overlay and initiates the animation.
 *
 * @function appendSuccessMessageToOverlay
 * @param {HTMLElement} wrapper - The overlay wrapper element
 * @returns {void}
 */
function appendSuccessMessageToOverlay(wrapper) {
  wrapper.innerHTML += taskSuccesMessageHTML();
  const succes = document.getElementById("task-succes");
  const messageContainer = document.getElementById("task-message-container");

  if (!succes || !messageContainer) {
    console.error("Required elements not found for success message");
    return;
  }
  animateSuccessMessage(succes, messageContainer);
}

/**
 * Animates the success message with a fade-out effect.
 *
 * @function animateSuccessMessage
 * @param {HTMLElement} successElement - The success element
 * @param {HTMLElement} containerElement - The container element
 * @returns {void}
 */
function animateSuccessMessage(successElement, containerElement) {
  containerElement.classList.remove("d-none");
  setTimeout(() => {
    containerElement.classList.add("d-none");
    successElement.classList.remove("show-add-task");
  }, 750);
}
