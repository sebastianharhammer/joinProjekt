function showEditTaskTempl(taskId) {
  currentTaskBeingEdited = taskId;
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task nicht gefunden!");
    return;
  }
  assignedUserArr = task.owner ? [...task.owner] : [];
  toggleEditAndDetailView();
  const editView = document.getElementById("editTaskTempl");
  editView.innerHTML = getEditTemplate(task);
  initializeEditTask(taskId, task);
}

function toggleEditAndDetailView() {
  const detailView = document.getElementById("taskDetailView");
  const editView = document.getElementById("editTaskTempl");

  detailView.classList.add("d-none");
  editView.classList.remove("d-none");
}

function initializeEditTask(taskId, task) {
  setupEditTaskEventListeners(taskId);
  getUsersForEditDropDown();
  updateAssignedUsersDisplay();
  setPriority(task.prio);
  renderEditSubtasks(task);
}

function editExistingSubtaskEditView(taskId, subtaskIndex) {
  const subtaskTextElement = editFindSubtaskElement(taskId, subtaskIndex);
  if (!subtaskTextElement) return;
  const inputElement = editCreateInputElement(subtaskTextElement);
  editUpdateEditIcon(taskId, subtaskIndex);
  editSetupInputBehavior(inputElement, taskId, subtaskIndex);
}

function editFindSubtaskElement(taskId, subtaskIndex) {
  const subtaskTextId = `subtask-text-${taskId}-${subtaskIndex}`;
  const subtaskTextElement = document.getElementById(subtaskTextId);
  if (!subtaskTextElement) {
    console.error(`Subtask-Text-Element mit ID ${subtaskTextId} nicht gefunden.`);
    return null;
  }
  return subtaskTextElement;
}

function editCreateInputElement(subtaskTextElement) {
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.value = subtaskTextElement.textContent.replace("• ", "").trim();
  inputElement.className = "subtaskInputInEdit";
  subtaskTextElement.replaceWith(inputElement);
  return inputElement;
}

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

function editSetupInputBehavior(inputElement, taskId, subtaskIndex) {
  inputElement.addEventListener("blur", () =>
    saveEditedSubtask(taskId, subtaskIndex, inputElement.value)
  );
  inputElement.focus();
}

function saveEditedSubtask(taskId, subtaskIndex, newValue) {
  const task = findTaskById(taskId);
  if (!isValidSubtask(task, subtaskIndex)) return;

  updateSubtaskValue(task, subtaskIndex, newValue);
  saveTaskToServer(taskId, task);
  updateSubtaskDOM(taskId, subtaskIndex, newValue);
  restoreEditIconBehavior(taskId, subtaskIndex);
}

function findTaskById(taskId) {
  return taskArray.find((t) => t.id === taskId);
}

function isValidSubtask(task, subtaskIndex) {
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task oder Subtask nicht gefunden.");
    return false;
  }
  return true;
}

function updateSubtaskValue(task, subtaskIndex, newValue) {
  task.subtasks[subtaskIndex].subtask = newValue;
}

function saveTaskToServer(taskId, task) {
  fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then(() =>
      console.log(`.`)
    )
    .catch((error) =>
      console.error("Fehler beim Speichern des Subtasks:", error)
    );
}

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

function restoreEditIconBehavior(taskId, subtaskIndex) {
  const editIcon = document.querySelector(
    `#edit-subtask-${taskId}-${subtaskIndex + 1} .edit-icon`
  );
  if (editIcon) {
    editIcon.src = "./img/edit.svg";
    editIcon.onclick = () => editExistingSubtaskEditView(taskId, subtaskIndex);
  }
}

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

function setupEditDropdownInteraction() {
  const dropdown = document.getElementById('custom-dropdown-edit');
  const optionsContainer = dropdown.querySelector('.dropdown-options-edit');
  editSetupDropdownClick(dropdown, optionsContainer);
  editSetupOptionsContainerClick(optionsContainer);
  editSetupDocumentClick(dropdown, optionsContainer);
}

function editSetupDropdownClick(dropdown, optionsContainer) {
  dropdown.addEventListener('click', (e) => {
    if (e.target.closest('.assigned-user-container-edit')) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    editToggleOptionsDisplay(optionsContainer);
  });
}

function editToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === 'block';
  optionsContainer.style.display = isOpen ? 'none' : 'block';
}

function editSetupOptionsContainerClick(optionsContainer) {
  optionsContainer.addEventListener('click', (event) => {
    const userContainer = event.target.closest('.assigned-user-container-edit');
    if (!userContainer) return;
    event.stopPropagation();
    editHandleUserSelection(userContainer);
  });
}

function editHandleUserSelection(userContainer) {
  const checkbox = userContainer.querySelector('input[type="checkbox"]');
  const firstName = userContainer.dataset.firstname;
  const lastName = userContainer.dataset.lastname;
  const color = userContainer.dataset.color;
  checkbox.checked = !checkbox.checked;
  editUpdateUserAssignment(userContainer, firstName, lastName, color);
}

function editUpdateUserAssignment(userContainer, firstName, lastName, color) {
  const userIndex = assignedUserArr.findIndex(
    user => user.firstName === firstName && user.lastName === lastName
  );
  
  if (userIndex > -1) {
    editRemoveUser(userContainer, userIndex);
  } else {
    editAddUser(userContainer, firstName, lastName, color);
  }
  showAssignedUsersEdit();
}

function editRemoveUser(userContainer, userIndex) {
  assignedUserArr.splice(userIndex, 1);
  editResetUserContainerStyle(userContainer);
}

function editResetUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = '';
  userContainer.style.color = '';
  userContainer.style.borderRadius = '';
}

function editAddUser(userContainer, firstName, lastName, color) {
  assignedUserArr.push({
    firstName,
    lastName,
    initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
    color
  });
  editSetSelectedUserContainerStyle(userContainer);
}

function editSetSelectedUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = '#2b3647';
  userContainer.style.color = 'white';
  userContainer.style.borderRadius = '10px';
}

function editSetupDocumentClick(dropdown, optionsContainer) {
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      optionsContainer.style.display = 'none';
    }
  });
}

function assignUserEdit(firstName, lastName, color) {
  const userExists = assignedUserArr.some(user => 
      user.firstName === firstName && 
      user.lastName === lastName
  );
  if (!userExists) {
      assignedUserArr.push({
          firstName: firstName,
          lastName: lastName,
          initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
          color: color
      });
      showAssignedUsersEdit();
  }
}

function editReturnArrayContacts() {
    if (!editValidateContacts()) return;
    const dropdownEdit = document.getElementById('custom-dropdown-edit');
    const optionsContainerEdit = dropdownEdit.querySelector('.dropdown-options-edit');
    optionsContainerEdit.innerHTML = "";
    const contactsArray = Object.values(finalContacts);
    contactsArray.forEach(contactInDrop => {
        if (!editValidateContact(contactInDrop)) return;
        const userContainerEdit = editCreateUserContainer(contactInDrop);
        optionsContainerEdit.appendChild(userContainerEdit);
    });
}

function editValidateContacts() {
    if (!finalContacts || Object.keys(finalContacts).length === 0) {
        console.error("No contacts found.");
        return false;
    }
    return true;
}

function editValidateContact(contact) {
    return contact && contact.firstName && contact.lastName;
}

function editCreateUserContainer(contact) {
    const userContainerEdit = document.createElement('div');
    userContainerEdit.classList.add('assigned-user-container-edit');
    editSetUserContainerData(userContainerEdit, contact);
    const isAssigned = editCheckIfUserAssigned(contact);
    if (isAssigned) {
        editStyleAssignedUser(userContainerEdit);
    }
    
    userContainerEdit.innerHTML = assignUserEditHTML(contact, isAssigned);
    return userContainerEdit;
}

function editSetUserContainerData(container, contact) {
    container.dataset.firstname = contact.firstName;
    container.dataset.lastname = contact.lastName;
    container.dataset.color = contact.color;
}

function editCheckIfUserAssigned(contact) {
    return assignedUserArr.some(user => 
        user.firstName === contact.firstName && 
        user.lastName === contact.lastName
    );
}

function editStyleAssignedUser(container) {
    container.style.backgroundColor = '#2b3647';
    container.style.color = 'white';
    container.style.borderRadius = '10px';
}

function showAssignedUsersEdit() {
  let assignUsersEdit = document.getElementById('assigned-users-short-edit');
  assignUsersEdit.innerHTML = "";
  for (let i=0; i < assignedUserArr.length; i++) {
      assignUsersEdit.innerHTML += showAssignedUsersEditHTML(assignedUserArr[i]);
  }
}

  function closeDropdownEdit() {
    const optionsContainer = document.getElementById('dropdown-options-edit');
    optionsContainer.style.display = 'none';
}

function toggleDropdown(editOptionsContainer) {
  const isDropdownOpen = editOptionsContainer.style.display === "block";
  editOptionsContainer.style.display = isDropdownOpen ? "none" : "block";
}

 function closeDropdownIfClickedOutside(
  editDropdown,
  editOptionsContainer,
  target
) {
  if (!editDropdown.contains(target)) {
    editOptionsContainer.style.display = "none";
  }
} 

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

function createContactNameSpan(contact) {
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;
  return nameSpan;
}

function createCheckboxLabel(contact, isChecked) {
  const checkboxLabel = createEditLabel();
  const checkbox = createEditCheckbox(isChecked, contact);
  const checkboxSquare = createEditCheckboxSquare();
  assembleEditLabel(checkboxLabel, checkbox, checkboxSquare);
  return checkboxLabel;
}

function createEditLabel() {
  const label = document.createElement("label");
  label.classList.add("contact-checkbox-edit-label");
  return label;
}

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

function addEditCheckboxEventListener(checkbox, contact) {
  checkbox.addEventListener("change", () => {
    handleEditContactSelection(
      contact.firstName,
      contact.lastName,
      checkbox.checked
    );
  });
} 

 function createEditCheckboxSquare() {
  const span = document.createElement("span");
  span.classList.add("checkboxSquare");
  return span;
}

function assembleEditLabel(label, checkbox, checkboxSquare) {
  label.appendChild(checkbox);
  label.appendChild(checkboxSquare);
}

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

function getRandomColor(firstName, lastName) {
  const contact = finalContacts.find(
    (c) => c.firstName === firstName && c.lastName === lastName
  );
  return contact?.color || "gray";
}

function emptyInput() {
  let inputField = document.getElementById("input-subtask-in-edit");
  inputField.value = "";
}

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

function deleteSubtaskEditview(taskId, subtaskIndex) {
  const task = findTaskById(taskId);
  if (!isValidTask(task)) return;

  deleteSubtaskFromTask(task, subtaskIndex);
  updateTaskInFirebaseEdit(taskId, task);
  removeSubtaskElement(taskId, subtaskIndex);
  updateSubtaskContainer();
}

function findTaskById(taskId) {
  return taskArray.find((t) => t.id === taskId);
}

function isValidTask(task) {
  if (!task || !task.subtasks) {
    console.error("Task oder Subtasks nicht gefunden!");
    return false;
  }
  return true;
}

function deleteSubtaskFromTask(task, subtaskIndex) {
  task.subtasks.splice(subtaskIndex, 1);
}

function updateTaskInFirebaseEdit(taskId, task) {
  return fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

function updateSubtaskContainer() {
  const subtaskContainer = document.getElementById("rendered-subtasks-edit");
  if (subtaskContainer.children.length === 0) {
    subtaskContainer.innerHTML = `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
  }
}

function skipEdit(taskId) {
  const editView = document.getElementById("editTaskTempl");
  if (editView) {
    editView.classList.add("d-none");
  }
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }
  let detailView = document.getElementById("taskDetailView");
  if (detailView) {
    detailView.innerHTML = "";
    detailView.classList.remove("d-none");
    detailView.innerHTML += showTaskCardHTML(task);
  }
}

function closeEditTask() {
  const overlayEdit = document.getElementById("editTaskTempl");
  if (overlayEdit) {
    overlayEdit.classList.add("d-none");
  }
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

async function saveEditedTask() {
  const taskId = currentTaskBeingEdited;
  const updatedTask = prepareUpdatedTask(taskId);
  if (!updatedTask) return;

  try {
    await updateTaskOnServer(taskId, updatedTask);
    updateTaskHTML();
    closeEditTask();
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Task ${taskId}:`, error);
  }
}

function prepareUpdatedTask(taskId) {
  const newTitle = document.querySelector("#editTaskCard input").value;
  const newDescription = document.getElementById("editDescription").value;
  const newDate = document.getElementById("edit-due-date").value;
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht im taskArray gefunden.`);
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

function prepareAssignedUsers() {
  return assignedUserArr.map((user) => ({
    ...user,
    initials: `${getFirstLetter(user.firstName)}${getFirstLetter(
      user.lastName
    )}`,
  }));
}

function extractSubtasksFromDOM() {
  const subtaskElements = document.querySelectorAll(
    "#rendered-subtasks-edit .subtaskFontInEdit"
  );
  return Array.from(subtaskElements).map((subtaskElement) => ({
    subtask: subtaskElement.textContent.replace("• ", "").trim(),
    checkbox: false,
  }));
}

async function updateTaskOnServer(taskId, updatedTask) {
  await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask),
  });
}
