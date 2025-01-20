/**
 * The base URL for adding tasks to Firebase.
 * @constant {string}
 */
const ADD_TASK_BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Indicates whether the categories container has been clicked.
 * @type {boolean}
 */
let categoriesContainerClick = false;

/**
 * Array of contacts.
 * @type {Array<Object>}
 */
let contacts = [];

/**
 * The currently selected priority for a task.
 * @type {string}
 */
let selectedPriority = "medium";

/**
 * Array of subtasks.
 * @type {Array<Object>}
 */
let subtasksArr = [];

/**
 * Array of assigned users.
 * @type {Array<Object>}
 */
let assignedUserArr = [];

/**
 * Local array of tasks.
 * @type {Array<Object>}
 */
let localTasks = [];

/**
 * Counter for subtask IDs.
 * @type {number}
 */
let subtaskIdCounter = 0;

/**
 * Array of edited subtasks.
 * @type {Array<Object>}
 */
let subtasksEdit = [];

/**
 * Array of completed edited subtasks.
 * @type {Array<Object>}
 */
let subtasksEdit_done = [];

/**
 * Array of completed subtasks.
 * @type {Array<Object>}
 */
let subtasksArr_done = [];

/**
 * The category object.
 * @type {string}
 */
let categoryObject = "";

/**
 * Array of available categories for adding tasks.
 * @type {Array<Object>}
 */
let addTaskcategories = [
  { category: "User Story", "bg-color": "#0038FF" },
  { category: "Technical Task", "bg-color": "#1FD7C1" },
];

/**
 * Array of assigned users.
 * @type {Array<Object>}
 */
let assignedUser = [];

/**
 * The current status of the task.
 * @type {string}
 */
let localStatus = "";

/**
 * Displays the add task interface and initializes the form.
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
 * Hides the add task interface and resets the state.
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
 * Resets the input fields of the form.
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
 * Handles the success after creating a task.
 *
 * @function handleTaskCreationSuccess
 * @returns {void}
 */
function handleTaskCreationSuccess() {
  showAddTaskSuccesMessage();
  hideAddTask();
}

/**
 * Validates the entered data for a task.
 *
 * @function validateTask
 * @param {string} title - The title of the task.
 * @param {string} date - The due date of the task.
 * @param {string} category - The category of the task.
 * @returns {boolean} Returns `true` if there are validation errors, otherwise `false`.
 */
function validateTask(title, date, category) {
  let exits = false;
  if (!title) {
    showValidationError("addTitleError", "Title is required!");
    exits = true;
  }
  if (date < new Date().toISOString().split("T")[0]) {
    showValidationError("addDateError", "Date can't be in the past!");
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
 * @param {string} elementId - The ID of the element that should display the error message.
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
    console.error("Button element not found.");
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
    console.error("Button element not found.");
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
  if (taskOverlayWrapper) {
    taskOverlayWrapper.innerHTML += taskSuccesMessageHTML();
    const succes = document.getElementById("task-succes");
    const messageContainer = document.getElementById("task-message-container");
    if (succes && messageContainer) {
      messageContainer.classList.remove("d-none");

      setTimeout(() => {
        messageContainer.classList.add("d-none");
        succes.classList.remove("show-add-task");
      }, 750);
    } else {
      console.error("Required elements not found for success message");
    }
  } else {
    console.error("Element with ID 'add-task-overlay-wrapper' not found.");
  }
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
    console.error("Dropdown element or options container not found.");
  }
}

/**
 * Handles the click on the dropdown menu.
 *
 * @function addTaskHandleDropdownClick
 * @param {Event} e - The triggering event.
 * @param {HTMLElement} optionsContainer - The container for the dropdown options.
 * @returns {void}
 */
function addTaskHandleDropdownClick(e, optionsContainer) {
  const userContainer = e.target.closest(".assigned-user-container");
  if (userContainer) {
    e.stopPropagation();
    return;
  }
  e.stopPropagation();
  addTaskToggleOptionsDisplay(optionsContainer);
}

/**
 * Toggles the display of the dropdown menu.
 *
 * @function addTaskToggleOptionsDisplay
 * @param {HTMLElement} optionsContainer - The container for the dropdown options.
 * @returns {void}
 */
function addTaskToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

/**
 * Handles the click on a dropdown option.
 *
 * @function addTaskHandleOptionsClick
 * @param {Event} event - The triggering event.
 * @returns {void}
 */
function addTaskHandleOptionsClick(event) {
  const userContainer = event.target.closest(".assigned-user-container");
  if (!userContainer) return;
  event.stopPropagation();
  const userData = addTaskGetUserData(userContainer);
  addTaskToggleUserSelection(userContainer, userData);
  showAssignedUsers();
}

/**
 * Retrieves user data from a user container.
 *
 * @function addTaskGetUserData
 * @param {HTMLElement} userContainer - The container of the user.
 * @returns {Object} The user data.
 */
function addTaskGetUserData(userContainer) {
  return {
    firstName: userContainer.dataset.firstname,
    lastName: userContainer.dataset.lastname,
    color: userContainer.dataset.color,
  };
}

/**
 * Toggles the user selection based on user data.
 *
 * @function addTaskToggleUserSelection
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {Object} userData - The data of the user.
 * @returns {void}
 */
function addTaskToggleUserSelection(userContainer, userData) {
  const checkbox = userContainer.querySelector('input[type="checkbox"]');
  const userIndex = addTaskFindUserIndex(userData);
  if (userIndex > -1) {
    addTaskRemoveUser(userIndex, userContainer, checkbox);
  } else {
    addTaskAddUser(userData, userContainer, checkbox);
  }
}

/**
 * Finds the index of a user in the `assignedUserArr` array.
 *
 * @function addTaskFindUserIndex
 * @param {Object} userData - The data of the user.
 * @returns {number} The index of the user or `-1` if not found.
 */
function addTaskFindUserIndex(userData) {
  return assignedUserArr.findIndex(
    (user) =>
      user.firstName === userData.firstName &&
      user.lastName === userData.lastName
  );
}

/**
 * Removes a user from the selection.
 *
 * @function addTaskRemoveUser
 * @param {number} userIndex - The index of the user in the array.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {HTMLInputElement} checkbox - The checkbox of the user.
 * @returns {void}
 */
function addTaskRemoveUser(userIndex, userContainer, checkbox) {
  assignedUserArr.splice(userIndex, 1);
  if (checkbox) checkbox.checked = false;
  addTaskResetUserContainerStyle(userContainer);
}

/**
 * Adds a user to the selection.
 *
 * @function addTaskAddUser
 * @param {Object} userData - The data of the user.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {HTMLInputElement} checkbox - The checkbox of the user.
 * @returns {void}
 */
function addTaskAddUser(userData, userContainer, checkbox) {
  assignedUserArr.push({
    firstName: userData.firstName,
    lastName: userData.lastName,
    initials: `${getFirstLetter(userData.firstName)}${getFirstLetter(
      userData.lastName
    )}`,
    color: userData.color,
  });
  if (checkbox) checkbox.checked = true;
  addTaskSetSelectedUserContainerStyle(userContainer);
}

/**
 * Resets the appearance of the user container.
 *
 * @function addTaskResetUserContainerStyle
 * @param {HTMLElement} container - The container of the user.
 * @returns {void}
 */
function addTaskResetUserContainerStyle(container) {
  container.style.backgroundColor = "";
  container.style.color = "";
  container.style.borderRadius = "";
}

/**
 * Sets the appearance of the selected user container.
 *
 * @function addTaskSetSelectedUserContainerStyle
 * @param {HTMLElement} container - The container of the user.
 * @returns {void}
 */
function addTaskSetSelectedUserContainerStyle(container) {
  container.style.backgroundColor = "#2b3647";
  container.style.color = "white";
  container.style.borderRadius = "10px";
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
 * Retrieves tasks from Firebase.
 *
 * @async
 * @function getTasks
 * @returns {Promise<void>}
 */
async function getTasks() {
  try {
    const response = await fetch(`${ADD_TASK_BASE_URL}/testingTasks/.json`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    localTasks = responseToJson;
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

/**
 * Retrieves user contacts from Firebase.
 *
 * @async
 * @function getUsers
 * @returns {Promise<void>}
 */
async function getUsers() {
  try {
    const response = await fetch(`${ADD_TASK_BASE_URL}/contacts/.json`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseToJson = await response.json();

    finalContacts = responseToJson || {};
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  returnArrayContacts();
}

/**
 * Converts the contact data into an array and renders the dropdown options.
 *
 * @function returnArrayContacts
 * @returns {void}
 */
function returnArrayContacts() {
  if (!finalContacts || Object.keys(finalContacts).length === 0) {
    console.error("No contacts found.");
    return;
  }
  const dropdown = document.getElementById("custom-dropdown");
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  optionsContainer.innerHTML = "";
  const contactsArray = Object.values(finalContacts);
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
 * Adds a user to the selection if they are not already selected.
 *
 * @function assignUser
 * @param {string} firstName - The first name of the user.
 * @param {string} lastName - The last name of the user.
 * @param {string} color - The color of the user.
 * @returns {void}
 */
function assignUser(firstName, lastName, color) {
  const userExists = assignedUserArr.some(
    (user) => user.firstName === firstName && user.lastName === lastName
  );
  if (!userExists) {
    assignedUserArr.push({
      firstName: firstName,
      lastName: lastName,
      initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
      color: color,
    });
    showAssignedUsers();
  }
}

/**
 * Displays the assigned users.
 *
 * @function showAssignedUsers
 * @returns {void}
 */
function showAssignedUsers() {
  const assignUsers = document.getElementById("assigned-users-short");
  if (assignUsers) {
    assignUsers.innerHTML = "";
    for (let i = 0; i < assignedUserArr.length; i++) {
      assignUsers.innerHTML += showAssignedUsersHTML(assignedUserArr[i]);
    }
  } else {
    console.error("Element with ID 'assigned-users-short' not found.");
  }
}

/**
 * Retrieves the first letter of a name.
 *
 * @function getFirstLetter
 * @param {string} name - The name from which to retrieve the first letter.
 * @returns {string} The first letter of the name in uppercase.
 */
function getFirstLetter(name) {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Retrieves the current category (Placeholder function).
 *
 * @function getCategory
 * @returns {string} The current category.
 */
function getCategory() {
  return categoryArr[0];
}

/**
 * Opens the categories dropdown menu for adding a task.
 *
 * @function openAddTaskCategories
 * @returns {void}
 */
function openAddTaskCategories() {
  const categoryList = document.getElementById("dropDownCategoryMenu");
  const icon = document.getElementById("arrowDropMenuCategory");
  if (icon && categoryList) {
    icon.style.transform = "rotate(180deg)";
    categoryList.innerHTML = "";
    if (!categoriesContainerClick) {
      categoriesContainerClick = true;
      categoryList.style.border = "1px solid #CDCDCD";
      renderAddTaskCategories();
    } else {
      categoriesContainerClick = false;
      categoryList.style.border = "0px";
      AddTaskCategories();
    }
    const categoryInput = document.getElementById("categoryInput");
    if (categoryInput) {
      categoryInput.classList.toggle("outline");
    }
  } else {
    console.error("Dropdown element or icon not found.");
  }
}

/**
 * Hides the categories dropdown menu.
 *
 * @function hideAddTaskCategories
 * @returns {void}
 */
function hideAddTaskCategories() {
  categoriesContainerClick = false;
  const categoryList = document.getElementById("dropDownCategoryMenu");
  const icon = document.getElementById("arrowDropMenuCategory");
  if (icon && categoryList) {
    icon.style.transform = "rotate(0deg)";
    categoryList.innerHTML = "";
  } else {
    console.error("Dropdown element or icon not found.");
  }
}

/**
 * Renders the available categories in the dropdown menu.
 *
 * @function renderAddTaskCategories
 * @returns {void}
 */
function renderAddTaskCategories() {
  const categoryContainer = document.getElementById("dropDownCategoryMenu");
  if (categoryContainer) {
    for (let i = 0; i < addTaskcategories.length; i++) {
      const category = addTaskcategories[i]["category"];
      categoryContainer.innerHTML += renderAddTaskCategoriesHTML(category);
    }
  } else {
    console.error("Element with ID 'dropDownCategoryMenu' not found.");
  }
}

/**
 * Selects a category and sets it as the current category.
 *
 * @function selectAddTaskCategory
 * @param {string} categoryTask - The selected category.
 * @returns {void}
 */
function selectAddTaskCategory(categoryTask) {
  const categoryInput = document.getElementById("categoryInput");
  const categoryList = document.getElementById("dropDownCategoryMenu");
  if (categoryInput) {
    categoryInput.value = categoryTask;
  }
  hideAddTaskCategories();
  if (categoryList) {
    categoryList.style.border = "0px";
  }
  categoryObject = categoryTask;
}

/**
 * Sets the priority of a task.
 *
 * @function setPriority
 * @param {string} priority - The selected priority ("urgent", "medium", "low").
 * @returns {void}
 */
function setPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    const btn = document.getElementById(`prio-${prio}`);
    const img = document.getElementById(`prio-image-${prio}`);
    if (btn) {
      btn.classList.remove("red", "yellow", "green");
    }
    if (img) {
      img.classList.remove("sat-0");
    }
  });
  const selectedButton = document.getElementById(`prio-${priority}`);
  const selectedImg = document.getElementById(`prio-image-${priority}`);
  if (selectedButton && selectedImg) {
    if (priority === "urgent") {
      selectedButton.classList.add("red");
    } else if (priority === "medium") {
      selectedButton.classList.add("yellow");
    } else if (priority === "low") {
      selectedButton.classList.add("green");
    }
    selectedImg.classList.add("sat-0");
    selectedPriority = priority;
    const task = taskArray.find((t) => t.id === currentTaskBeingEdited);
    if (task) {
      task.prio = priority;
    }
  } else {
    console.error("Priority button or image not found.");
  }
}

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
  if (subtaskInput && subtasksContent) {
    if (subtaskInput.value.trim() !== "") {
      const subtaskData = addTaskCreateSubtask(subtaskInput.value);
      subtasksContent.innerHTML += subtaskData.html;
      subtaskInput.value = "";
    } else {
      if (errorMessageSubtasks) {
        errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 1500);
      }
    }
    const clearAddIcons = document.getElementById("clear-add-icons");
    const subtasksPlusIcon = document.getElementById("subtasks-plus-icon");
    if (clearAddIcons && subtasksPlusIcon) {
      clearAddIcons.classList.add("d-none");
      subtasksPlusIcon.classList.remove("d-none");
    }
  } else {
    console.error("Element 'subtaskInput' or 'subtasksContent' not found.");
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
 * Edits a subtask and allows editing of the text.
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
        errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 3000);
      }
    }
  } else {
    console.error("Span element or list element not found.");
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
    console.error(`List element with ID '${listId}' not found.`);
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
        errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 1500);
      }
    }
  } else {
    console.error("List element or input element not found.");
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
    console.error("Element with ID 'subtaskInput' not found.");
  }
}

/**
 * Displays the "Clear" button for the subtask input.
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
    console.error("Elements for Clear button or Plus icon not found.");
  }
}
