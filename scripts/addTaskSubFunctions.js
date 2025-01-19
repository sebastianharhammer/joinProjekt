/**
 * Handles the click on a dropdown option for user assignment.
 * @param {Event} event - The triggering event.
 */
function handleOptionsClick(event) {
  const userContainer = event.target.closest(".assigned-user-container");
  if (!userContainer) return;
  event.stopPropagation();
  const userData = extractUserData(userContainer);
  toggleUserSelection(userData, userContainer);
  showAssignedUsers();
}

/**
 * Extracts user data from the user container.
 * @param {HTMLElement} userContainer - The user's container.
 * @returns {Object} The extracted user data.
 */
function extractUserData(userContainer) {
  return {
    firstName: userContainer.dataset.firstname,
    lastName: userContainer.dataset.lastname,
    color: userContainer.dataset.color,
  };
}

/**
 * Toggles the selection of a user in the list of assigned users.
 * @param {Object} userData - The user's data.
 * @param {HTMLElement} userContainer - The user's container.
 */
function toggleUserSelection(userData, userContainer) {
  const checkbox = userContainer.querySelector('input[type="checkbox"]');
  const userIndex = findUserIndex(userData);
  if (userIndex > -1) {
    removeUser(userIndex);
    updateUserContainer(userContainer, checkbox, false);
  } else {
    addUser(userData);
    updateUserContainer(userContainer, checkbox, true);
  }
}

/**
 * Finds the index of a user in the list of assigned users.
 * @param {Object} userData - The user's data.
 * @returns {number} The index of the user or -1 if not found.
 */
function findUserIndex(userData) {
  return assignedUserArr.findIndex(
    (user) =>
      user.firstName === userData.firstName &&
      user.lastName === userData.lastName
  );
}

/**
 * Removes a user from the list of assigned users.
 * @param {number} userIndex - The index of the user to remove.
 */
function removeUser(userIndex) {
  assignedUserArr.splice(userIndex, 1);
}

/**
 * Adds a user to the list of assigned users.
 * @param {Object} userData - The data of the user to add.
 */
function addUser(userData) {
  assignedUserArr.push({
    firstName: userData.firstName,
    lastName: userData.lastName,
    initials: `${getFirstLetter(userData.firstName)}${getFirstLetter(
      userData.lastName
    )}`,
    color: userData.color,
  });
}

/**
 * Updates the appearance of the user container based on selection.
 * @param {HTMLElement} userContainer - The user's container.
 * @param {HTMLInputElement} checkbox - The user's checkbox.
 * @param {boolean} isSelected - Indicates whether the user is selected.
 */
function updateUserContainer(userContainer, checkbox, isSelected) {
  checkbox.checked = isSelected;
  userContainer.style.backgroundColor = isSelected ? "#2b3647" : "";
  userContainer.style.color = isSelected ? "white" : "";
  userContainer.style.borderRadius = isSelected ? "10px" : "";
}

/**
 * Closes the dropdown menu.
 */
function closeDropdown() {
  const optionsContainer = document.getElementById("dropdown-options");
  optionsContainer.style.display = "none";
}

/**
 * Assigns a user based on first name, last name, and color.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
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
 * Displays the assigned users in the UI.
 */
function showAssignedUsers() {
  let assignUsersContainer = document.getElementById("assigned-users-short");
  assignUsersContainer.innerHTML = "";
  assignedUserArr.forEach((contact) => {
    assignUsersContainer.innerHTML += showAssignedUsersHTML(contact);
  });
}

/**
 * Gets the first letter of a name and returns it capitalized.
 * @param {string} name - The name to get the first letter from.
 * @returns {string} The first capital letter of the name.
 */
function getFirstLetter(name) {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Opens the dropdown menu for task categories and renders the categories.
 */
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
    hideAddTaskCategories();
  }
  document.getElementById("categoryInput").classList.toggle("outline");
}

/**
 * Hides the dropdown menu for task categories.
 */
function hideAddTaskCategories() {
  categoriesContainerClick = false;
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(0deg)";
  categoryList.innerHTML = "";
}

/**
 * Hides the dropdown menu for a specific category.
 */
function hideAddTaskCategoriesCategory() {
  categoriesContainerClick = true;
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(0deg)";
  categoryList.innerHTML = "";
}

/**
 * Renders the list of task categories in the dropdown menu.
 */
function renderAddTaskCategories() {
  let categoryContainer = document.getElementById("dropDownCategoryMenu");
  for (let i = 0; i < addTaskcategories.length; i++) {
    const category = addTaskcategories[i]["category"];
    categoryContainer.innerHTML += renderAddTaskCategoriesHTML(category);
  }
}

/**
 * Selects a task category and updates the input field.
 * @param {string} categoryTask - The selected category.
 */
function selectAddTaskCategory(categoryTask) {
  let categoryInput = document.getElementById("categoryInput");
  let categoryList = document.getElementById("dropDownCategoryMenu");
  categoryInput.value = categoryTask;
  hideAddTaskCategories();
  categoryList.style.border = "0px";
  categoryObject = categoryTask;
}

/**
 * Resets all priority buttons to their original state.
 */
function resetPriorityButtons() {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    const btn = document.getElementById(`prio-${prio}`);
    const img = document.getElementById(`prio-image-${prio}`);
    btn.classList.remove(
      prio === "urgent" ? "red" : prio === "medium" ? "yellow" : "green"
    );
    img.classList.remove("sat-0");
  });
}

/**
 * Sets the priority of a task and updates the UI accordingly.
 * @param {string} priority - The selected priority ("urgent", "medium", "low").
 */
function setPriority(priority) {
  resetPriorityButtons();
  const selectedButton = document.getElementById(`prio-${priority}`);
  const selectedImg = document.getElementById(`prio-image-${priority}`);
  selectedButton.classList.add(
    priority === "urgent" ? "red" : priority === "medium" ? "yellow" : "green"
  );
  selectedImg.classList.add("sat-0");
  selectedPriority = priority;
}

/**
 * Adds a new subtask after validation.
 */
function addSubtask() {
  const subtaskInput = document.getElementById("subtaskInput");

  if (!validateSubtaskInput(subtaskInput.value)) {
    showSubtaskError();
    return;
  }
  createAndAddSubtask(subtaskInput.value);
  resetSubtaskInput(subtaskInput);
  updateSubtaskIcons();
}

/**
 * Validates the input of a subtask.
 * @param {string} value - The input value of the subtask.
 * @returns {boolean} Returns true if the input is valid.
 */
function validateSubtaskInput(value) {
  return value.trim() !== "";
}

/**
 * Shows an error message when the subtask is empty.
 */
function showSubtaskError() {
  errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
  setTimeout(() => {
    errorMessageSubtasks.innerHTML = "";
  }, 1500);
}

/**
 * Creates a new subtask and adds it to the corresponding arrays and DOM.
 * @param {string} subtaskValue - The text of the subtask.
 */
function createAndAddSubtask(subtaskValue) {
  subtaskIdCounter++;
  const ids = generateSubtaskIds(subtaskIdCounter);
  addSubtaskToArrays(subtaskValue);
  const subtasksContent = document.getElementById("subtasksContent");
  const newSubtaskHTML = addSubtaskHTML(ids.liId, ids.spanId, ids.inputId, {
    value: subtaskValue,
  });
  subtasksContent.innerHTML += newSubtaskHTML;
}

/**
 * Generates unique IDs for a subtask based on a counter.
 * @param {number} counter - The current counter value.
 * @returns {Object} The generated IDs.
 */
function generateSubtaskIds(counter) {
  return {
    liId: `subtask-${counter}`,
    spanId: `span-${counter}`,
    inputId: `input-${counter}`,
  };
}

/**
 * Adds the new subtask to the corresponding arrays.
 * @param {string} subtaskValue - The text of the subtask.
 */
function addSubtaskToArrays(subtaskValue) {
  const newSubtask = {
    checkbox_img: "../img/checkbox-empty.svg",
    subtask: subtaskValue,
  };
  subtasksArr.push({ ...newSubtask });
  subtasksEdit.push({ ...newSubtask });
}

/**
 * Resets the input field for the subtask.
 * @param {HTMLInputElement} input - The subtask input field.
 */
function resetSubtaskInput(input) {
  input.value = "";
}

/**
 * Updates the subtask icons by showing or hiding specific icons.
 */
function updateSubtaskIcons() {
  document.getElementById("clear-add-icons").classList.add("d-none");
  document.getElementById("subtasks-plus-icon").classList.remove("d-none");
}

/**
 * Enables editing of a subtask.
 * @param {string} liId - The ID of the list element.
 * @param {string} spanId - The ID of the span element.
 * @param {string} inputId - The ID of the input element.
 */
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
    errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 3000);
  }
}

/**
 * Deletes a subtask from the DOM.
 * @param {string} liId - The ID of the subtask's list element.
 */
function deleteSubtask(liId) {
  const li = document.getElementById(liId);
  li.remove();
}

/**
 * Saves an edited subtask if the new text is valid.
 * @param {string} liId - The ID of the list element.
 * @param {string} inputId - The ID of the input element.
 * @param {string} spanId - The ID of the span element.
 */
function saveSubtask(liId, inputId, spanId) {
  const li = document.getElementById(liId);
  const input = document.getElementById(inputId);
  if (input.value.trim() !== "") {
    li.innerHTML = saveSubtaskHTML(liId, inputId, spanId, input);
    li.classList.remove("subtask-item-on-focus");
    li.classList.add("subtask-item");
  } else {
    errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
    setTimeout(() => {
      errorMessageSubtasks.innerHTML = "";
    }, 1500);
  }
}

/**
 * Clears the content of the subtask input field.
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  input.value = "";
}