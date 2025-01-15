const ADD_TASK_BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";
let categoriesContainerClick = false;
let contacts = [];
let selectedPriority = "medium";
let subtasksArr = [];
let assignedUserArr = [];
let localTasks = [];
let subtaskIdCounter = 0;
let subtasksEdit = [];
let subtasksEdit_done = [];
let subtasksArr_done = [];
let categoryObject = "";
let addTaskcategories = [
  { category: "User Story", "bg-color": "#0038FF" },
  {
    category: "Technical Task",
    "bg-color": "#1FD7C1",
  },
];
let assignedUser = [];
let localStatus = "";

function showAddTask(status) {
  localStatus = status;
  getTasks();
  let addTaskContent = document.getElementById("add-task-content");
  let background = document.getElementById("add-task-background");
  addTaskContent.classList.add("show-add-task");
  background.classList.remove("d-none");
  document.body.classList.add("overflow-hidden");
  addTaskContent.classList.add("position-static");
  addTaskContent.innerHTML = addTaskOverlayHTML();
  getUsers();
  handleDropdownInteraction();
  setPriority("medium");
}

function hideAddTask() {
  let addContactTemplate = document.getElementById("add-task-content");
  let background = document.getElementById("add-task-background");
  addContactTemplate.classList.remove("show-add-task");
  document.body.classList.remove("overflow-hidden");

  setTimeout(() => {
    background.classList.add("d-none");
  }, 250);
  setTimeout(() => {
    init();
  }, 250);
}

function handleCancel(event) {
  event.preventDefault();
  resetFormInputs();
  resetArrays();
  resetUserSelections();
  setPriority("medium");
}

function resetFormInputs() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("addTaskInputDueDate").value = "";
  document.getElementById("categoryInput").value = "";
  document.getElementById("subtaskInput").value = "";
  document.getElementById("subtasksContent").innerHTML = "";
}

function resetArrays() {
  subtasksArr = [];
  assignedUserArr = [];
  categoryObject = "";
  selectedPriority = "";
  document.getElementById("assigned-users-short").innerHTML = "";
}

function resetUserSelections() {
  const userContainers = document.querySelectorAll('.assigned-user-container');
  userContainers.forEach(container => {
    container.style.backgroundColor = "";
    container.style.color = "";
    container.style.borderRadius = "";
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  });
}

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

function getTaskFormData() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    date: document.getElementById("addTaskInputDueDate").value,
    category: categoryObject,
    priority: selectedPriority,
    subtasks: [...subtasksArr],
    assignedUsers: [...assignedUserArr]
  };
}

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

function handleTaskCreationSuccess() {
  showAddTaskSuccesMessage();
  hideAddTask();
}

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

function showValidationError(elementId, message) {
  const button = document.getElementById("add-task-create");
  document.getElementById(elementId).innerHTML = message;
  disableButton(button);
  setTimeout(() => {
    enableButton(button);
    document.getElementById(elementId).innerHTML = "";
  }, 3000);
}

function disableButton(button) {
  button.disabled = true;
  button.style.backgroundColor = "#000000";
  button.style.color = "#2B3647";
}

function enableButton(button) {
  button.disabled = false;
  button.style.backgroundColor = "#2B3647";
  button.style.color = "#FFFFFF";
}

async function getNextTaskId() {
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
    const tasks = await response.json();
    const taskIds = tasks ? Object.values(tasks).map((task) => task.id) : [];
    const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0;
    return maxId + 1;
  } catch (error) {
    console.error("Failed to fetch tasks for ID generation:", error);
    return 20;
  }
}

async function pushTaskToFirebase(newTask) {
  try {
    let key = newTask.id;
    let response = await fetch(ADD_TASK_BASE_URL + `/tasks/${key}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    let responseToJson = await response.json();
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

function showAddTaskSuccesMessage() {
  let succes = document.getElementById("task-succes");
  succes.classList.add("show-add-task");
}

function handleDropdownInteraction() {
  const dropdown = document.getElementById("custom-dropdown");
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  dropdown.addEventListener("click", (e) => addTaskHandleDropdownClick(e, optionsContainer));
  optionsContainer.addEventListener("click", addTaskHandleOptionsClick);
}

function addTaskHandleDropdownClick(e, optionsContainer) {
  const userContainer = e.target.closest(".assigned-user-container");
  if (userContainer) {
    e.stopPropagation();
    return;
  }
  e.stopPropagation();
  addTaskToggleOptionsDisplay(optionsContainer);
}

function addTaskToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

function addTaskHandleOptionsClick(event) {
  const userContainer = event.target.closest(".assigned-user-container");
  if (!userContainer) return;
  event.stopPropagation();
  const userData = addTaskGetUserData(userContainer);
  addTaskToggleUserSelection(userContainer, userData);
  showAssignedUsers();
}

function addTaskGetUserData(userContainer) {
  return {
    firstName: userContainer.dataset.firstname,
    lastName: userContainer.dataset.lastname,
    color: userContainer.dataset.color
  };
}

function addTaskToggleUserSelection(userContainer, userData) {
  const checkbox = userContainer.querySelector('input[type="checkbox"]');
  const userIndex = addTaskFindUserIndex(userData);
  if (userIndex > -1) {
    addTaskRemoveUser(userIndex, userContainer, checkbox);
  } else {
    addTaskAddUser(userData, userContainer, checkbox);
  }
}

function addTaskFindUserIndex(userData) {
  return assignedUserArr.findIndex(
    user => user.firstName === userData.firstName && user.lastName === userData.lastName
  );
}

function addTaskRemoveUser(userIndex, userContainer, checkbox) {
  assignedUserArr.splice(userIndex, 1);
  checkbox.checked = false;
  addTaskResetUserContainerStyle(userContainer);
}

function addTaskAddUser(userData, userContainer, checkbox) {
  assignedUserArr.push({
    firstName: userData.firstName,
    lastName: userData.lastName,
    initials: `${getFirstLetter(userData.firstName)}${getFirstLetter(userData.lastName)}`,
    color: userData.color
  });
  checkbox.checked = true;
  addTaskSetSelectedUserContainerStyle(userContainer);
}

function addTaskResetUserContainerStyle(container) {
  container.style.backgroundColor = "";
  container.style.color = "";
  container.style.borderRadius = "";
}

function addTaskSetSelectedUserContainerStyle(container) {
  container.style.backgroundColor = "#2b3647";
  container.style.color = "white";
  container.style.borderRadius = "10px";
}

function closeDropdown() {
  const optionsContainer = document.getElementById("dropdown-options");
  optionsContainer.style.display = "none";
}

async function getTasks() {
  try {
    let response = await fetch(ADD_TASK_BASE_URL + "/testingTasks/.json", {
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

function showAssignedUsers() {
  let assignUsers = document.getElementById("assigned-users-short");
  assignUsers.innerHTML = "";
  for (let i = 0; i < assignedUserArr.length; i++) {
    assignUsers.innerHTML += showAssignedUsersHTML(assignedUserArr[i]);
  }
}

function getFirstLetter(name) {
  return name.trim().charAt(0).toUpperCase();
}

function getCategory() {
  return categoryArr[0];
}

function openAddTaskCategories() {
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
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
  document.getElementById("categoryInput").classList.toggle("outline");
}

function hideAddTaskCategories() {
  categoriesContainerClick = false;
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(0deg)";
  categoryList.innerHTML = "";
}

function renderAddTaskCategories() {
  let categoryContainer = document.getElementById("dropDownCategoryMenu");
  for (let i = 0; i < addTaskcategories.length; i++) {
    const category = addTaskcategories[i]["category"];
    categoryContainer.innerHTML += renderAddTaskCategoriesHTML(category);
  }
}

function selectAddTaskCategory(categoryTask) {
  let categoryInput = document.getElementById("categoryInput");
  let categoryList = document.getElementById("dropDownCategoryMenu");
  categoryInput.value = categoryTask;
  hideAddTaskCategories();
  categoryList.style.border = "0px";
  categoryObject = categoryTask;
}

function setPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    const btn = document.getElementById(`prio-${prio}`);
    const img = document.getElementById(`prio-image-${prio}`);
    btn.classList.remove("red", "yellow", "green");
    img.classList.remove("sat-0");
  });
  const selectedButton = document.getElementById(`prio-${priority}`);
  const selectedImg = document.getElementById(`prio-image-${priority}`);
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
}

function addTaskSubtask() {
  const subtaskInput = document.getElementById("subtaskInput");
  const subtasksContent = document.getElementById("subtasksContent");
  if (subtaskInput.value.trim() !== "") {
    const subtaskData = addTaskCreateSubtask(subtaskInput.value);
    subtasksContent.innerHTML += subtaskData.html;
    subtaskInput.value = "";
  } else {
    errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 1500);
  }
  document.getElementById("clear-add-icons").classList.add("d-none");
  document.getElementById("subtasks-plus-icon").classList.remove("d-none");
}

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
    html: addSubtaskHTML(liId, spanId, inputId, { value: subtaskValue })
  };
}

function editSubtask(liId, spanId, inputId) {
  const spanElement = document.getElementById(spanId);
  const li = document.getElementById(liId);
  const currentText = spanElement.textContent;
  const errorMessageSubtasks = document.getElementById("errorMessageSubtasks");
  if (currentText.trim() !== "") {
    li.innerHTML = editSubtaskHTML(liId, spanId, inputId, currentText);
    li.classList.add("subtask-item-on-focus");
    li.classList.remove("subtask-item");
  } else {
    errorMessage;
    errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 3000);
  }
}

function deleteSubtask(listId) {
  const list = document.getElementById(listId);
  list.remove();
}

function saveSubtask(liId, inputId, spanId) {
  const li = document.getElementById(liId);
  const input = document.getElementById(inputId);
  if (input.value.trim() !== "") {
    li.innerHTML = saveSubtaskHTML(liId, inputId, spanId, input);
    li.classList.remove("subtask-item-on-focus");
    li.classList.add("subtask-item");
  } else {
    errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 1500);
  }
}

function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  input.value = "";
}

function showClearButton() {
  document.getElementById("clear-add-icons").classList.remove("d-none");
  document.getElementById("subtasks-plus-icon").classList.add("d-none");
}
