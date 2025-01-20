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
 * Retrieves users for the edit dropdown from Firebase.
 */
async function getUsersForEditDropDown() {
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
    finalContactsForEdit = responseToJson || {};
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  editReturnArrayContacts();
  setupEditDropdownInteraction();
}

/**
 * Sets up interactions for the edit dropdown.
 */
function setupEditDropdownInteraction() {
  const dropdown = document.getElementById("custom-dropdown-edit");
  const optionsContainer = dropdown.querySelector(".dropdown-options-edit");
  editSetupDropdownClick(dropdown, optionsContainer);
  editSetupOptionsContainerClick(optionsContainer);
  editSetupDocumentClick(dropdown, optionsContainer);
}

/**
 * Sets up the click listener for the edit dropdown.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editSetupDropdownClick(dropdown, optionsContainer) {
  dropdown.addEventListener("click", (e) => {
    if (e.target.closest(".assigned-user-container-edit")) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    editToggleOptionsDisplay(optionsContainer);
  });
}

/**
 * Toggles the display of the edit options dropdown.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

/**
 * Sets up the click listener for the edit options container.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editSetupOptionsContainerClick(optionsContainer) {
  optionsContainer.addEventListener("click", (event) => {
    const userContainer = event.target.closest(".assigned-user-container-edit");
    if (!userContainer) return;
    event.stopPropagation();
    editHandleUserSelection(userContainer);
  });
}

/**
 * Handles user selection in the edit dropdown.
 * @param {HTMLElement} userContainer - The container of the selected user.
 */
function editHandleUserSelection(userContainer) {
  const checkbox = userContainer.querySelector('input[type="checkbox"]');
  const firstName = userContainer.dataset.firstname;
  const lastName = userContainer.dataset.lastname;
  const color = userContainer.dataset.color;
  checkbox.checked = !checkbox.checked;
  editUpdateUserAssignment(userContainer, firstName, lastName, color);
}

/**
 * Updates user assignment based on selection.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
 */
function editUpdateUserAssignment(userContainer, firstName, lastName, color) {
  const userIndex = assignedUserArr.findIndex(
    (user) => user.firstName === firstName && user.lastName === lastName
  );

  if (userIndex > -1) {
    editRemoveUser(userContainer, userIndex);
  } else {
    editAddUser(userContainer, firstName, lastName, color);
  }
  showAssignedUsersEdit();
}

/**
 * Removes a user from the assignment and resets the styling.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {number} userIndex - The index of the user in the array.
 */
function editRemoveUser(userContainer, userIndex) {
  assignedUserArr.splice(userIndex, 1);
  editResetUserContainerStyle(userContainer);
}

/**
 * Resets the styling of the user container.
 * @param {HTMLElement} userContainer - The container of the user.
 */
function editResetUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = "";
  userContainer.style.color = "";
  userContainer.style.borderRadius = "";
}

/**
 * Adds a user to the assignment and sets the styling.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
 */
function editAddUser(userContainer, firstName, lastName, color) {
  assignedUserArr.push({
    firstName,
    lastName,
    initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
    color,
  });
  editSetSelectedUserContainerStyle(userContainer);
}

/**
 * Sets the styling of a selected user container.
 * @param {HTMLElement} userContainer - The container of the user.
 */
function editSetSelectedUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = "#2b3647";
  userContainer.style.color = "white";
  userContainer.style.borderRadius = "10px";
}

/**
 * Sets up the global click listener to close the dropdown when clicking outside.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editSetupDocumentClick(dropdown, optionsContainer) {
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      optionsContainer.style.display = "none";
    }
  });
}

/**
 * Assigns a user in the edit dropdown.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
 */
function assignUserEdit(firstName, lastName, color) {
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
    showAssignedUsersEdit();
  }
}

/**
 * Converts the contact list into an array and renders the dropdown options for editing.
 */
function editReturnArrayContacts() {
  if (!editValidateContacts()) return;
  const dropdownEdit = document.getElementById("custom-dropdown-edit");
  const optionsContainerEdit = dropdownEdit.querySelector(
    ".dropdown-options-edit"
  );
  optionsContainerEdit.innerHTML = "";
  const contactsArray = Object.values(finalContacts);
  contactsArray.forEach((contactInDrop) => {
    if (!editValidateContact(contactInDrop)) return;
    const userContainerEdit = editCreateUserContainer(contactInDrop);
    optionsContainerEdit.appendChild(userContainerEdit);
  });
}

/**
 * Validates whether contacts exist.
 * @returns {boolean} Returns true if contacts exist.
 */
function editValidateContacts() {
  if (!finalContacts || Object.keys(finalContacts).length === 0) {
    console.error("No contacts found.");
    return false;
  }
  return true;
}

/**
 * Validates a single contact.
 * @param {Object} contact - The contact.
 * @returns {boolean} Returns true if the contact is valid.
 */
function editValidateContact(contact) {
  return contact && contact.firstName && contact.lastName;
}

/**
 * Creates a user container for the edit dropdown.
 * @param {Object} contact - The contact.
 * @returns {HTMLElement} The created user container.
 */
function editCreateUserContainer(contact) {
  const userContainerEdit = document.createElement("div");
  userContainerEdit.classList.add("assigned-user-container-edit");
  editSetUserContainerData(userContainerEdit, contact);
  const isAssigned = editCheckIfUserAssigned(contact);
  if (isAssigned) {
    editStyleAssignedUser(userContainerEdit);
  }

  userContainerEdit.innerHTML = assignUserEditHTML(contact, isAssigned);
  return userContainerEdit;
}

/**
 * Sets the data attributes for the user container.
 * @param {HTMLElement} container - The user container.
 * @param {Object} contact - The contact.
 */
function editSetUserContainerData(container, contact) {
  container.dataset.firstname = contact.firstName;
  container.dataset.lastname = contact.lastName;
  container.dataset.color = contact.color;
}

/**
 * Checks if a user is already assigned.
 * @param {Object} contact - The contact.
 * @returns {boolean} Returns true if the user is already assigned.
 */
function editCheckIfUserAssigned(contact) {
  return assignedUserArr.some(
    (user) =>
      user.firstName === contact.firstName && user.lastName === contact.lastName
  );
}

/**
 * Restores the styling of an assigned user.
 * @param {HTMLElement} container - The user container.
 */
function editStyleAssignedUser(container) {
  container.style.backgroundColor = "#2b3647";
  container.style.color = "white";
  container.style.borderRadius = "10px";
}

/**
 * Displays the assigned users in the edit view.
 */
function showAssignedUsersEdit() {
  let assignUsersEdit = document.getElementById("assigned-users-short-edit");
  assignUsersEdit.innerHTML = "";
  for (let i = 0; i < assignedUserArr.length; i++) {
    assignUsersEdit.innerHTML += showAssignedUsersEditHTML(assignedUserArr[i]);
  }
}

/**
 * Closes the edit dropdown.
 */
function closeDropdownEdit() {
  const optionsContainer = document.getElementById("dropdown-options-edit");
  optionsContainer.style.display = "none";
}

/**
 * Toggles the display of an edit dropdown.
 * @param {HTMLElement} editOptionsContainer - The container of the edit options.
 */
function toggleDropdown(editOptionsContainer) {
  const isDropdownOpen = editOptionsContainer.style.display === "block";
  editOptionsContainer.style.display = isDropdownOpen ? "none" : "block";
}

/**
 * Closes the edit dropdown if clicked outside.
 * @param {HTMLElement} editDropdown - The dropdown element.
 * @param {HTMLElement} editOptionsContainer - The container of the edit options.
 * @param {EventTarget} target - The target of the click event.
 */
function closeDropdownIfClickedOutside(
  editDropdown,
  editOptionsContainer,
  target
) {
  if (!editDropdown.contains(target)) {
    editOptionsContainer.style.display = "none";
  }
}

/**
 * Creates a dropdown option for a contact.
 * @param {Object} contact - The contact.
 * @param {boolean} isChecked - Indicates if the option is already selected.
 * @returns {HTMLElement} The created option element.
 */
function createDropdownOption(contact, isChecked) {
  const optionElement = document.createElement("div");
  optionElement.classList.add("dropdown-contact-edit");
  optionElement.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  const circleDiv = createContactCircle(contact);
  const nameSpan = createContactNameSpan(contact);
  const checkboxLabel = createCheckboxLabel(contact, isChecked);
  optionElement.appendChild(circleDiv);
  optionElement.appendChild(nameSpan);
  optionElement.appendChild(checkboxLabel);
  return optionElement;
}

/**
 * Creates a span element with a contact's name.
 * @param {Object} contact - The contact.
 * @returns {HTMLElement} The created span element.
 */
function createContactNameSpan(contact) {
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;
  return nameSpan;
}

/**
 * Creates a label with a checkbox for a contact.
 * @param {Object} contact - The contact.
 * @param {boolean} isChecked - Indicates if the checkbox is selected.
 * @returns {HTMLElement} The created label element.
 */
function createCheckboxLabel(contact, isChecked) {
  const checkboxLabel = createEditLabel();
  const checkbox = createEditCheckbox(isChecked, contact);
  const checkboxSquare = createEditCheckboxSquare();
  assembleEditLabel(checkboxLabel, checkbox, checkboxSquare);
  return checkboxLabel;
}

/**
 * Creates a label element for a checkbox.
 * @returns {HTMLElement} The created label element.
 */
function createEditLabel() {
  const label = document.createElement("label");
  label.classList.add("contact-checkbox-edit-label");
  return label;
}

/**
 * Creates a checkbox for the edit view.
 * @param {boolean} isChecked - Indicates if the checkbox is selected.
 * @param {Object} contact - The contact.
 * @returns {HTMLInputElement} The created checkbox.
 */
function createEditCheckbox(isChecked, contact) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("contact-checkbox-edit");
  checkbox.checked = isChecked;
  checkbox.addEventListener("change", (event) => {
    event.stopPropagation();
    handleEditContactSelection(
      contact.firstName,
      contact.lastName,
      checkbox.checked
    );
  });
  return checkbox;
}

/**
 * Creates a span element for the checkbox.
 * @returns {HTMLElement} The created span element.
 */
function createEditCheckboxSquare() {
  const span = document.createElement("span");
  span.classList.add("checkboxSquare");
  return span;
}

/**
 * Appends the checkbox and checkbox span element to the label.
 * @param {HTMLElement} label - The label element.
 * @param {HTMLInputElement} checkbox - The checkbox.
 * @param {HTMLElement} checkboxSquare - The span element for the checkbox.
 */
function assembleEditLabel(label, checkbox, checkboxSquare) {
  label.appendChild(checkbox);
  label.appendChild(checkboxSquare);
}

/**
 * Creates a circle with a contact's initials.
 * @param {Object} contact - The contact.
 * @returns {HTMLElement} The created circle div.
 */
function createContactCircle(contact) {
  const circleDiv = document.createElement("div");
  circleDiv.classList.add("contact-circle-edit");
  circleDiv.style.backgroundColor = getRandomColor(
    contact.firstName,
    contact.lastName
  );
  circleDiv.textContent = `${getFirstLetter(contact.firstName)}${getFirstLetter(
    contact.lastName
  )}`;
  return circleDiv;
}

/**
 * Handles the selection of a contact in the edit dropdown.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {boolean} isChecked - Indicates if the contact is selected.
 */
function handleEditContactSelection(firstName, lastName, isChecked) {
  if (isChecked) {
    if (
      !assignedUserArr.some(
        (user) => user.firstName === firstName && user.lastName === lastName
      )
    ) {
      assignedUserArr.push({ firstName, lastName });
    }
  } else {
    assignedUserArr = assignedUserArr.filter(
      (user) => user.firstName !== firstName || user.lastName !== lastName
    );
  }
  updateAssignedUsersDisplay();
}

/**
 * Updates the display of assigned users.
 */
function updateAssignedUsersDisplay() {
  const assignedUsersContainer = document.getElementById(
    "assigned-users-short-edit"
  );
  assignedUsersContainer.innerHTML = "";
  assignedUserArr.forEach((user) => {
    const color = getRandomColor(user.firstName, user.lastName);
    const initials = `${getFirstLetter(user.firstName)}${getFirstLetter(
      user.lastName
    )}`;
    assignedUsersContainer.innerHTML += createAssignedUserHTML(color, initials);
  });
}

/**
 * Generates a random color based on a user's name.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {string} The generated color.
 */
function getRandomColor(firstName, lastName) {
  const contact = finalContacts.find(
    (c) => c.firstName === firstName && c.lastName === lastName
  );
  return contact?.color || "gray";
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
 * Skips editing a task and shows the detail view.
 * @param {number} taskId - The ID of the task.
 */
function skipEdit(taskId) {
  const editView = document.getElementById("editTaskTempl");
  if (editView) {
    editView.classList.add("d-none");
  }
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task with ID ${taskId} not found.`);
    return;
  }
  let detailView = document.getElementById("taskDetailView");
  if (detailView) {
    detailView.innerHTML = "";
    detailView.classList.remove("d-none");
    detailView.innerHTML += showTaskCardHTML(task);
  }
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
 * Prepares the updated task.
 * @param {number} taskId - The ID of the task.
 * @returns {Object|null} The updated task or null.
 */
function prepareUpdatedTask(taskId) {
  const newTitle = document.querySelector("#editTaskCard input").value;
  const newDescription = document.getElementById("editDescription").value;
  const newDate = document.getElementById("edit-due-date").value;
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task with ID ${taskId} not found in taskArray.`);
    return null;
  }
  const updatedTask = { ...taskArray[taskIndex] };
  updatedTask.title = newTitle;
  updatedTask.description = newDescription;
  updatedTask.date = newDate;
  updatedTask.owner = prepareAssignedUsers();
  updatedTask.subtasks = extractSubtasksFromDOM();
  taskArray[taskIndex] = updatedTask;
  return updatedTask;
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

/**
 * Updates the task on the server.
 * @param {number} taskId - The ID of the task.
 * @param {Object} updatedTask - The updated task.
 * @returns {Promise<Response>} The fetch response.
 */
async function updateTaskOnServer(taskId, updatedTask) {
  await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask),
  });
}
