/**
 * Initializes the application by loading tasks and users and including the HTML.
 */
function init() {
  getTasks();
  getUsers();
  includeHTML();
  renderAddTaskHTML();
  handleDropdownInteraction();
  setPriority("medium");
}

/**
 * Fetches tasks from Firebase and stores them locally.
 */
async function getTasks() {
  try {
    let response = await fetch(BASE_URL + "/testingTasks/.json", {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let responseToJson = await response.json();
    localTasks = responseToJson;
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

/**
 * Fetches user contacts from Firebase and stores them.
 */
async function getUsers() {
  try {
    let response = await fetch(BASE_URL + "/contacts/.json", {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let responseToJson = await response.json();
    finalContacts = responseToJson || {};
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  returnArrayContacts();
}

/**
 * Converts the contact list to an array and renders the dropdown options.
 */
function returnArrayContacts() {
  if (!validateContacts()) return;
  const contactsArray = convertContactsToArray();
  renderContactOptions(contactsArray);
}

/**
 * Checks if valid contacts exist.
 * @returns {boolean} True if contacts exist, otherwise False
 */
function validateContacts() {
  if (!finalContacts || Object.keys(finalContacts).length === 0) {
    console.error("No contacts found.");
    return false;
  }
  return true;
}

/**
 * Converts the contact object into an array.
 * @returns {Array} Array of contacts
 */
function convertContactsToArray() {
  return Object.values(finalContacts);
}

/**
 * Renders the contact options in the dropdown menu.
 * @param {Array} contactsArray - Array of contacts to render
 */
function renderContactOptions(contactsArray) {
  const dropdown = document.getElementById("custom-dropdown");
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  optionsContainer.innerHTML = "";

  contactsArray.forEach((contactInDrop) => {
    if (!contactInDrop || !contactInDrop.firstName || !contactInDrop.lastName)
      return;
    const optionHTML = assignUserHTML(contactInDrop);
    const optionElement = document.createElement("div");
    optionElement.classList.add("dropdown-contact");
    optionElement.innerHTML = optionHTML;
    optionsContainer.appendChild(optionElement);
  });
}

/**
 * Creates a new task based on the form data.
 * @param {Event} event - The triggering event.
 */
async function createTask(event) {
  event.preventDefault();
  const taskData = getTaskFormData();
  if (validateTask(taskData.title, taskData.date, taskData.category)) {
    return;
  }
  try {
    const newTask = await buildNewTask(taskData);
    await saveTask(newTask);
    handleSuccessfulTaskCreation();
  } catch (error) {
    console.error("Failed to create the task:", error);
  }
}

/**
 * Gets the data from the task form.
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
 * Builds a new task object based on the form data.
 * @param {Object} taskData - The data for the new task.
 * @returns {Object} The created task object.
 */
async function buildNewTask(taskData) {
  const nextId = await getNextTaskId();
  return {
    id: nextId,
    status: "todo",
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
 * Saves the new task in the local list and sends it to Firebase.
 * @param {Object} newTask - The task to be saved.
 */
async function saveTask(newTask) {
  taskArray.push(newTask);
  await pushTaskToFirebase(newTask);
}

/**
 * Handles successful task creation, shows confirmation and redirects.
 */
function handleSuccessfulTaskCreation() {
  showAddTaskSuccesMessage();
  setTimeout(() => {
    window.location.href = "testboard.html";
  }, 1500);
}

/**
 * Handles cancellation of task creation, resets form and UI.
 * @param {Event} event - The triggering event.
 */
function handleCancel(event) {
  event.preventDefault();
  resetFormValues();
  resetUIElements();
}

/**
 * Resets the form values.
 */
function resetFormValues() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("addTaskInputDueDate").value = "";
  document.getElementById("categoryInput").value = "";
  document.getElementById("subtaskInput").value = "";
  document.getElementById("subtasksContent").innerHTML = "";
  subtasksArr = [];
  assignedUserArr = [];
  categoryObject = "";
  selectedPriority = "";
}

/**
 * Resets UI elements, such as user containers and priority selection.
 */
function resetUIElements() {
  document.getElementById("assigned-users-short").innerHTML = "";
  const userContainers = document.querySelectorAll(".assigned-user-container");
  userContainers.forEach((container) => {
    container.style.backgroundColor = "";
    container.style.color = "";
    container.style.borderRadius = "";
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  });
  setPriority("medium");
}

/**
 * Validates the task based on title, date, and category.
 * @param {string} title - The task title.
 * @param {string} date - The due date of the task.
 * @param {string} category - The task category.
 * @returns {boolean} Returns true if errors exist.
 */
function validateTask(title, date, category) {
  let hasErrors = false;
  if (!validateTitle(title)) hasErrors = true;
  if (!validateDate(date)) hasErrors = true;
  if (!validateCategory(category)) hasErrors = true;
  return hasErrors;
}

/**
 * Validates the task title.
 * @param {string} title - The title to validate.
 * @returns {boolean} Returns true if the title is valid.
 */
function validateTitle(title) {
  if (!title) {
    showFieldError("addTitleError", "Title is required!");
    return false;
  }
  return true;
}

/**
 * Validates the task date.
 * @param {string} date - The date to validate.
 * @returns {boolean} Returns true if the date is valid.
 */
function validateDate(date) {
  if (!date) {
    showFieldError("addDateError", "Date is required!");
    return false;
  }
  if (date < new Date().toISOString().split("T")[0]) {
    showFieldError("addDateError", "Date can't be in the past!");
    return false;
  }
  return true;
}

/**
 * Validates the task category.
 * @param {string} category - The category to validate.
 * @returns {boolean} Returns true if the category is valid.
 */
function validateCategory(category) {
  if (!category) {
    showFieldError("addCategoryError", "Category is required!");
    return false;
  }
  return true;
}

/**
 * Shows an error message for a specific field and temporarily disables the create button.
 * @param {string} elementId - The ID of the element to display the error message.
 * @param {string} message - The error message.
 */
function showFieldError(elementId, message) {
  const button = document.getElementById("add-task-create");
  document.getElementById(elementId).innerHTML = message;
  button.disabled = true;
  button.style.backgroundColor = "#000000";
  button.style.color = "#2B3647";
  setTimeout(() => {
    button.disabled = false;
    button.style.backgroundColor = "#2B3647";
    button.style.color = "#FFFFFF";
    document.getElementById(elementId).innerHTML = "";
  }, 3000);
}

/**
 * Shows a success message after successfully adding a task.
 */
function showAddTaskSuccesMessage() {
  let succes = document.getElementById("task-succes");
  let messageContainer = document.getElementById("task-message-container");
  messageContainer.classList.remove("d-none");
  succes.classList.add("show-add-task");
  setTimeout(() => {
    messageContainer.classList.add("d-none");
    succes.classList.remove("show-add-task");
  }, 750);
}

/**
 * Fetches all tasks from Firebase.
 * @returns {Object|null} The tasks or null in case of error
 */
async function fetchTasksFromFirebase() {
  try {
    const response = await fetch(BASE_URL + "/tasks.json", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return null;
  }
}

/**
 * Gets the next available task ID.
 * @returns {number} The next task ID.
 */
async function getNextTaskId() {
  const tasks = await fetchTasksFromFirebase();
  if (!tasks) return 20;

  const taskIds = Object.values(tasks).map((task) => task.id);
  const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0;
  return maxId + 1;
}

/**
 * Sends the new task to Firebase for storage.
 * @param {Object} newTask - The task to be saved.
 */
async function pushTaskToFirebase(newTask) {
  try {
    let key = newTask.id;
    let response = await fetch(BASE_URL + `/tasks/${key}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

/**
 * Shows the clear button and hides the plus icon during subtask creation.
 */
function showClearButton() {
  document.getElementById("clear-add-icons").classList.remove("d-none");
  document.getElementById("subtasks-plus-icon").classList.add("d-none");
}

/**
 * Toggles the visibility of the dropdown menu.
 * @param {HTMLElement} optionsContainer - The container for dropdown options.
 */
function toggleDropdown(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

/**
 * Handles interaction with the dropdown menu for user assignments.
 */
function handleDropdownInteraction() {
  const dropdown = document.getElementById("custom-dropdown");
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  dropdown.addEventListener("click", (e) =>
    handleDropdownClick(e, optionsContainer)
  );
  optionsContainer.addEventListener("click", handleOptionsClick);
}

/**
 * Handles clicks on the dropdown menu.
 * @param {Event} event - The triggering event.
 * @param {HTMLElement} optionsContainer - The container for dropdown options.
 */
function handleDropdownClick(event, optionsContainer) {
  const userContainer = event.target.closest(".assigned-user-container");
  if (userContainer) {
    event.stopPropagation();
    return;
  }
  event.stopPropagation();
  toggleDropdown(optionsContainer);
}
