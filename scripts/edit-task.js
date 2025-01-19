/**
 * Zeigt das Bearbeitungstemplate für eine bestimmte Aufgabe an.
 * @param {number} taskId - Die ID der zu bearbeitenden Aufgabe.
 */
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

/**
 * Wechselt zwischen Detail- und Bearbeitungsansicht.
 */
function toggleEditAndDetailView() {
  const detailView = document.getElementById("taskDetailView");
  const editView = document.getElementById("editTaskTempl");

  detailView.classList.add("d-none");
  editView.classList.remove("d-none");
}

/**
 * Initialisiert die Bearbeitung einer Aufgabe.
 * @param {number} taskId - Die ID der zu bearbeitenden Aufgabe.
 * @param {Object} task - Das Aufgabenobjekt.
 */
function initializeEditTask(taskId, task) {
  setupEditTaskEventListeners(taskId);
  getUsersForEditDropDown();
  updateAssignedUsersDisplay();
  setPriority(task.prio);
  renderEditSubtasks(task);
}

/**
 * Bearbeitet eine bestehende Unteraufgabe in der Bearbeitungsansicht.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 */
function editExistingSubtaskEditView(taskId, subtaskIndex) {
  const subtaskTextElement = editFindSubtaskElement(taskId, subtaskIndex);
  if (!subtaskTextElement) return;
  const inputElement = editCreateInputElement(subtaskTextElement);
  editUpdateEditIcon(taskId, subtaskIndex);
  editSetupInputBehavior(inputElement, taskId, subtaskIndex);
}

/**
 * Findet das DOM-Element der Unteraufgabe zum Bearbeiten.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 * @returns {HTMLElement|null} Das gefundene Element oder null.
 */
function editFindSubtaskElement(taskId, subtaskIndex) {
  const subtaskTextId = `subtask-text-${taskId}-${subtaskIndex}`;
  const subtaskTextElement = document.getElementById(subtaskTextId);
  if (!subtaskTextElement) {
    console.error(
      `Subtask-Text-Element mit ID ${subtaskTextId} nicht gefunden.`
    );
    return null;
  }
  return subtaskTextElement;
}

/**
 * Erstellt ein Input-Element für die Unteraufgabe.
 * @param {HTMLElement} subtaskTextElement - Das Text-Element der Unteraufgabe.
 * @returns {HTMLInputElement} Das erstellte Input-Element.
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
 * Aktualisiert das Bearbeitungssymbol der Unteraufgabe.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
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
 * Richtet das Verhalten des Input-Elements für die Unteraufgabe ein.
 * @param {HTMLInputElement} inputElement - Das Input-Element.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 */
function editSetupInputBehavior(inputElement, taskId, subtaskIndex) {
  inputElement.addEventListener("blur", () =>
    saveEditedSubtask(taskId, subtaskIndex, inputElement.value)
  );
  inputElement.focus();
}

/**
 * Speichert die bearbeitete Unteraufgabe.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 * @param {string} newValue - Der neue Wert der Unteraufgabe.
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
 * Findet eine Aufgabe anhand ihrer ID.
 * @param {number} taskId - Die ID der Aufgabe.
 * @returns {Object|undefined} Die gefundene Aufgabe oder undefined.
 */
function findTaskById(taskId) {
  return taskArray.find((t) => t.id === taskId);
}

/**
 * Überprüft, ob eine Unteraufgabe gültig ist.
 * @param {Object} task - Die Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 * @returns {boolean} Gibt true zurück, wenn die Unteraufgabe gültig ist.
 */
function isValidSubtask(task, subtaskIndex) {
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task oder Subtask nicht gefunden.");
    return false;
  }
  return true;
}

/**
 * Aktualisiert den Wert einer Unteraufgabe.
 * @param {Object} task - Die Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 * @param {string} newValue - Der neue Wert der Unteraufgabe.
 */
function updateSubtaskValue(task, subtaskIndex, newValue) {
  task.subtasks[subtaskIndex].subtask = newValue;
}

/**
 * Speichert eine Aufgabe auf dem Server.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {Object} task - Die Aufgabe.
 */
function saveTaskToServer(taskId, task) {
  fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then(() => console.log(`Task ${taskId} erfolgreich gespeichert.`))
    .catch((error) =>
      console.error("Fehler beim Speichern des Subtasks:", error)
    );
}

/**
 * Aktualisiert die Unteraufgabe im DOM.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 * @param {string} newValue - Der neue Wert der Unteraufgabe.
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
 * Stellt das Verhalten des Bearbeitungssymbols der Unteraufgabe wieder her.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
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
 * Holt die Benutzer für das Bearbeitungs-Dropdown von Firebase.
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
 * Richtet die Interaktionen für das Bearbeitungs-Dropdown ein.
 */
function setupEditDropdownInteraction() {
  const dropdown = document.getElementById("custom-dropdown-edit");
  const optionsContainer = dropdown.querySelector(".dropdown-options-edit");
  editSetupDropdownClick(dropdown, optionsContainer);
  editSetupOptionsContainerClick(optionsContainer);
  editSetupDocumentClick(dropdown, optionsContainer);
}

/**
 * Richtet den Klick-Listener für das Bearbeitungs-Dropdown ein.
 * @param {HTMLElement} dropdown - Das Dropdown-Element.
 * @param {HTMLElement} optionsContainer - Der Container für die Optionen.
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
 * Wechselt die Anzeige des Bearbeitungs-Dropdowns.
 * @param {HTMLElement} optionsContainer - Der Container für die Optionen.
 */
function editToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

/**
 * Richtet den Klick-Listener für den Bearbeitungs-Optionscontainer ein.
 * @param {HTMLElement} optionsContainer - Der Container für die Optionen.
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
 * Behandelt die Benutzerwahl im Bearbeitungs-Dropdown.
 * @param {HTMLElement} userContainer - Der Container des ausgewählten Benutzers.
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
 * Aktualisiert die Benutzerzuweisung basierend auf der Auswahl.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @param {string} color - Die Farbe des Benutzers.
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
 * Entfernt einen Benutzer aus der Zuordnung und setzt das Styling zurück.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {number} userIndex - Der Index des Benutzers im Array.
 */
function editRemoveUser(userContainer, userIndex) {
  assignedUserArr.splice(userIndex, 1);
  editResetUserContainerStyle(userContainer);
}

/**
 * Setzt das Styling des Benutzercontainers zurück.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 */
function editResetUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = "";
  userContainer.style.color = "";
  userContainer.style.borderRadius = "";
}

/**
 * Fügt einen Benutzer zur Zuordnung hinzu und setzt das Styling.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @param {string} color - Die Farbe des Benutzers.
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
 * Setzt das Styling eines ausgewählten Benutzercontainers.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 */
function editSetSelectedUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = "#2b3647";
  userContainer.style.color = "white";
  userContainer.style.borderRadius = "10px";
}

/**
 * Richtet den globalen Klick-Listener ein, um das Dropdown zu schließen, wenn außerhalb geklickt wird.
 * @param {HTMLElement} dropdown - Das Dropdown-Element.
 * @param {HTMLElement} optionsContainer - Der Container für die Optionen.
 */
function editSetupDocumentClick(dropdown, optionsContainer) {
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      optionsContainer.style.display = "none";
    }
  });
}

/**
 * Weist einen Benutzer im Bearbeitungs-Dropdown zu.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @param {string} color - Die Farbe des Benutzers.
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
 * Wandelt die Kontaktliste in ein Array um und rendert die Dropdown-Optionen für die Bearbeitung.
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
 * Validiert, ob Kontakte vorhanden sind.
 * @returns {boolean} Gibt true zurück, wenn Kontakte vorhanden sind.
 */
function editValidateContacts() {
  if (!finalContacts || Object.keys(finalContacts).length === 0) {
    console.error("No contacts found.");
    return false;
  }
  return true;
}

/**
 * Validiert einen einzelnen Kontakt.
 * @param {Object} contact - Der Kontakt.
 * @returns {boolean} Gibt true zurück, wenn der Kontakt gültig ist.
 */
function editValidateContact(contact) {
  return contact && contact.firstName && contact.lastName;
}

/**
 * Erstellt einen Benutzercontainer für das Bearbeitungs-Dropdown.
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLElement} Der erstellte Benutzercontainer.
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
 * Setzt die Datenattribute für den Benutzercontainer.
 * @param {HTMLElement} container - Der Benutzercontainer.
 * @param {Object} contact - Der Kontakt.
 */
function editSetUserContainerData(container, contact) {
  container.dataset.firstname = contact.firstName;
  container.dataset.lastname = contact.lastName;
  container.dataset.color = contact.color;
}

/**
 * Überprüft, ob ein Benutzer bereits zugewiesen ist.
 * @param {Object} contact - Der Kontakt.
 * @returns {boolean} Gibt true zurück, wenn der Benutzer bereits zugewiesen ist.
 */
function editCheckIfUserAssigned(contact) {
  return assignedUserArr.some(
    (user) =>
      user.firstName === contact.firstName && user.lastName === contact.lastName
  );
}

/**
 * Stellt das Styling eines zugewiesenen Benutzers wieder her.
 * @param {HTMLElement} container - Der Benutzercontainer.
 */
function editStyleAssignedUser(container) {
  container.style.backgroundColor = "#2b3647";
  container.style.color = "white";
  container.style.borderRadius = "10px";
}

/**
 * Zeigt die zugewiesenen Benutzer in der Bearbeitungsansicht an.
 */
function showAssignedUsersEdit() {
  let assignUsersEdit = document.getElementById("assigned-users-short-edit");
  assignUsersEdit.innerHTML = "";
  for (let i = 0; i < assignedUserArr.length; i++) {
    assignUsersEdit.innerHTML += showAssignedUsersEditHTML(assignedUserArr[i]);
  }
}

/**
 * Schließt das Bearbeitungs-Dropdown.
 */
function closeDropdownEdit() {
  const optionsContainer = document.getElementById("dropdown-options-edit");
  optionsContainer.style.display = "none";
}

/**
 * Wechselt die Anzeige eines Bearbeitungs-Dropdowns.
 * @param {HTMLElement} editOptionsContainer - Der Container der Bearbeitungs-Optionen.
 */
function toggleDropdown(editOptionsContainer) {
  const isDropdownOpen = editOptionsContainer.style.display === "block";
  editOptionsContainer.style.display = isDropdownOpen ? "none" : "block";
}

/**
 * Schließt das Bearbeitungs-Dropdown, wenn außerhalb geklickt wird.
 * @param {HTMLElement} editDropdown - Das Dropdown-Element.
 * @param {HTMLElement} editOptionsContainer - Der Container der Bearbeitungs-Optionen.
 * @param {EventTarget} target - Das Ziel des Klick-Events.
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
 * Erstellt eine Dropdown-Option für einen Kontakt.
 * @param {Object} contact - Der Kontakt.
 * @param {boolean} isChecked - Gibt an, ob die Option bereits ausgewählt ist.
 * @returns {HTMLElement} Das erstellte Options-Element.
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
 * Erstellt ein Span-Element mit dem Namen eines Kontakts.
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLElement} Das erstellte Span-Element.
 */
function createContactNameSpan(contact) {
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;
  return nameSpan;
}

/**
 * Erstellt ein Label mit einer Checkbox für einen Kontakt.
 * @param {Object} contact - Der Kontakt.
 * @param {boolean} isChecked - Gibt an, ob die Checkbox ausgewählt ist.
 * @returns {HTMLElement} Das erstellte Label-Element.
 */
function createCheckboxLabel(contact, isChecked) {
  const checkboxLabel = createEditLabel();
  const checkbox = createEditCheckbox(isChecked, contact);
  const checkboxSquare = createEditCheckboxSquare();
  assembleEditLabel(checkboxLabel, checkbox, checkboxSquare);
  return checkboxLabel;
}

/**
 * Erstellt ein Label-Element für eine Checkbox.
 * @returns {HTMLElement} Das erstellte Label-Element.
 */
function createEditLabel() {
  const label = document.createElement("label");
  label.classList.add("contact-checkbox-edit-label");
  return label;
}

/**
 * Erstellt eine Checkbox für die Bearbeitungsansicht.
 * @param {boolean} isChecked - Gibt an, ob die Checkbox ausgewählt ist.
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLInputElement} Die erstellte Checkbox.
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
 * Erstellt ein Span-Element für die Checkbox.
 * @returns {HTMLElement} Das erstellte Span-Element.
 */
function createEditCheckboxSquare() {
  const span = document.createElement("span");
  span.classList.add("checkboxSquare");
  return span;
}

/**
 * Fügt die Checkbox und das Checkbox-Span-Element zum Label hinzu.
 * @param {HTMLElement} label - Das Label-Element.
 * @param {HTMLInputElement} checkbox - Die Checkbox.
 * @param {HTMLElement} checkboxSquare - Das Span-Element für die Checkbox.
 */
function assembleEditLabel(label, checkbox, checkboxSquare) {
  label.appendChild(checkbox);
  label.appendChild(checkboxSquare);
}

/**
 * Erstellt einen Kreis mit den Initialen eines Kontakts.
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLElement} Das erstellte Kreis-Div.
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
 * Behandelt die Auswahl eines Kontakts im Bearbeitungs-Dropdown.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @param {boolean} isChecked - Gibt an, ob der Kontakt ausgewählt ist.
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
 * Aktualisiert die Anzeige der zugewiesenen Benutzer.
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
 * Generiert eine zufällige Farbe basierend auf dem Namen eines Benutzers.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @returns {string} Die generierte Farbe.
 */
function getRandomColor(firstName, lastName) {
  const contact = finalContacts.find(
    (c) => c.firstName === firstName && c.lastName === lastName
  );
  return contact?.color || "gray";
}

/**
 * Leert das Eingabefeld für Unteraufgaben.
 */
function emptyInput() {
  let inputField = document.getElementById("input-subtask-in-edit");
  inputField.value = "";
}

/**
 * Fügt eine neue Unteraufgabe im Bearbeitungs-Template hinzu.
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
 * Richtet Event-Listener für die Bearbeitung einer Aufgabe ein.
 * @param {number} taskId - Die ID der Aufgabe.
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
 * Löscht eine Unteraufgabe in der Bearbeitungsansicht.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
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
 * Überprüft, ob eine Aufgabe gültig ist.
 * @param {Object} task - Die Aufgabe.
 * @returns {boolean} Gibt true zurück, wenn die Aufgabe gültig ist.
 */
function isValidTask(task) {
  if (!task || !task.subtasks) {
    console.error("Task oder Subtasks nicht gefunden!");
    return false;
  }
  return true;
}

/**
 * Löscht eine Unteraufgabe aus der Aufgabe.
 * @param {Object} task - Die Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe.
 */
function deleteSubtaskFromTask(task, subtaskIndex) {
  task.subtasks.splice(subtaskIndex, 1);
}

/**
 * Aktualisiert die Aufgabe auf dem Server.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {Object} task - Die aktualisierte Aufgabe.
 * @returns {Promise<Response>} Die Fetch-Antwort.
 */
function updateTaskInFirebaseEdit(taskId, task) {
  return fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

/**
 * Aktualisiert den Unteraufgaben-Container im DOM.
 */
function updateSubtaskContainer() {
  const subtaskContainer = document.getElementById("rendered-subtasks-edit");
  if (subtaskContainer.children.length === 0) {
    subtaskContainer.innerHTML = `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
  }
}

/**
 * Überspringt die Bearbeitung einer Aufgabe und zeigt die Detailansicht an.
 * @param {number} taskId - Die ID der Aufgabe.
 */
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

/**
 * Schließt die Bearbeitungsansicht einer Aufgabe.
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
 * Speichert die bearbeitete Aufgabe auf dem Server.
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
    console.error(`Fehler beim Aktualisieren der Task ${taskId}:`, error);
  }
}

/**
 * Bereitet die aktualisierte Aufgabe vor.
 * @param {number} taskId - Die ID der Aufgabe.
 * @returns {Object|null} Die aktualisierte Aufgabe oder null.
 */
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

/**
 * Bereitet die zugewiesenen Benutzer für die Speicherung vor.
 * @returns {Array<Object>} Das Array der zugewiesenen Benutzer.
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
 * Extrahiert die Unteraufgaben aus dem DOM.
 * @returns {Array<Object>} Das Array der extrahierten Unteraufgaben.
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
 * Aktualisiert die Aufgabe auf dem Server.
 * @param {number} taskId - Die ID der Aufgabe.
 * @param {Object} updatedTask - Die aktualisierte Aufgabe.
 * @returns {Promise<Response>} Die Fetch-Antwort.
 */
async function updateTaskOnServer(taskId, updatedTask) {
  await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask),
  });
}
