/**
 * Behandelt den Klick auf eine Dropdown-Option zur Benutzerzuweisung.
 * @param {Event} event - Das auslösende Ereignis.
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
 * Extrahiert Benutzerdaten aus dem Benutzercontainer.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @returns {Object} Die extrahierten Benutzerdaten.
 */
function extractUserData(userContainer) {
  return {
    firstName: userContainer.dataset.firstname,
    lastName: userContainer.dataset.lastname,
    color: userContainer.dataset.color,
  };
}

/**
 * Wechselt die Auswahl eines Benutzers in der Liste der zugewiesenen Benutzer.
 * @param {Object} userData - Die Daten des Benutzers.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
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
 * Findet den Index eines Benutzers in der Liste der zugewiesenen Benutzer.
 * @param {Object} userData - Die Daten des Benutzers.
 * @returns {number} Der Index des Benutzers oder -1, wenn nicht gefunden.
 */
function findUserIndex(userData) {
  return assignedUserArr.findIndex(
    (user) =>
      user.firstName === userData.firstName &&
      user.lastName === userData.lastName
  );
}

/**
 * Entfernt einen Benutzer aus der Liste der zugewiesenen Benutzer.
 * @param {number} userIndex - Der Index des zu entfernenden Benutzers.
 */
function removeUser(userIndex) {
  assignedUserArr.splice(userIndex, 1);
}

/**
 * Fügt einen Benutzer zur Liste der zugewiesenen Benutzer hinzu.
 * @param {Object} userData - Die Daten des hinzuzufügenden Benutzers.
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
 * Aktualisiert das Erscheinungsbild des Benutzercontainers basierend auf der Auswahl.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {HTMLInputElement} checkbox - Die Checkbox des Benutzers.
 * @param {boolean} isSelected - Gibt an, ob der Benutzer ausgewählt ist.
 */
function updateUserContainer(userContainer, checkbox, isSelected) {
  checkbox.checked = isSelected;
  userContainer.style.backgroundColor = isSelected ? "#2b3647" : "";
  userContainer.style.color = isSelected ? "white" : "";
  userContainer.style.borderRadius = isSelected ? "10px" : "";
}

/**
 * Schließt das Dropdown-Menü.
 */
function closeDropdown() {
  const optionsContainer = document.getElementById("dropdown-options");
  optionsContainer.style.display = "none";
}

/**
 * Weist einen Benutzer basierend auf Vor- und Nachnamen sowie Farbe zu.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @param {string} color - Die Farbe des Benutzers.
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
 * Zeigt die zugewiesenen Benutzer im UI an.
 */
function showAssignedUsers() {
  let assignUsersContainer = document.getElementById("assigned-users-short");
  assignUsersContainer.innerHTML = "";
  assignedUserArr.forEach((contact) => {
    assignUsersContainer.innerHTML += showAssignedUsersHTML(contact);
  });
}

/**
 * Holt den ersten Buchstaben eines Namens und gibt ihn groß zurück.
 * @param {string} name - Der Name, von dem der erste Buchstabe geholt werden soll.
 * @returns {string} Der erste Großbuchstabe des Namens.
 */
function getFirstLetter(name) {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Öffnet das Dropdown-Menü für Aufgabenkategorien und rendert die Kategorien.
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
 * Verbirgt das Dropdown-Menü für Aufgabenkategorien.
 */
function hideAddTaskCategories() {
  categoriesContainerClick = false;
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(0deg)";
  categoryList.innerHTML = "";
}

/**
 * Verbirgt das Dropdown-Menü für eine bestimmte Kategorie.
 */
function hideAddTaskCategoriesCategory() {
  categoriesContainerClick = true;
  let categoryList = document.getElementById("dropDownCategoryMenu");
  let icon = document.getElementById("arrowDropMenuCategory");
  icon.style.transform = "rotate(0deg)";
  categoryList.innerHTML = "";
}

/**
 * Rendert die Liste der Aufgabenkategorien im Dropdown-Menü.
 */
function renderAddTaskCategories() {
  let categoryContainer = document.getElementById("dropDownCategoryMenu");
  for (let i = 0; i < addTaskcategories.length; i++) {
    const category = addTaskcategories[i]["category"];
    categoryContainer.innerHTML += renderAddTaskCategoriesHTML(category);
  }
}

/**
 * Wählt eine Aufgabenkategorie aus und aktualisiert das Eingabefeld.
 * @param {string} categoryTask - Die ausgewählte Kategorie.
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
 * Setzt alle Prioritätsbuttons zurück auf ihren Ursprungszustand.
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
 * Setzt die Priorität einer Aufgabe und aktualisiert die UI entsprechend.
 * @param {string} priority - Die ausgewählte Priorität ("urgent", "medium", "low").
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
 * Fügt eine neue Unteraufgabe hinzu, nachdem sie validiert wurde.
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
 * Validiert die Eingabe einer Unteraufgabe.
 * @param {string} value - Der Eingabewert der Unteraufgabe.
 * @returns {boolean} Gibt true zurück, wenn die Eingabe gültig ist.
 */
function validateSubtaskInput(value) {
  return value.trim() !== "";
}

/**
 * Zeigt eine Fehlermeldung an, wenn die Unteraufgabe leer ist.
 */
function showSubtaskError() {
  errorMessageSubtasks.innerHTML = "Subtask can't be empty!";
  setTimeout(() => {
    errorMessageSubtasks.innerHTML = "";
  }, 1500);
}

/**
 * Erstellt eine neue Unteraufgabe und fügt sie den entsprechenden Arrays und dem DOM hinzu.
 * @param {string} subtaskValue - Der Text der Unteraufgabe.
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
 * Generiert eindeutige IDs für eine Unteraufgabe basierend auf einem Zähler.
 * @param {number} counter - Der aktuelle Zählerstand.
 * @returns {Object} Die generierten IDs.
 */
function generateSubtaskIds(counter) {
  return {
    liId: `subtask-${counter}`,
    spanId: `span-${counter}`,
    inputId: `input-${counter}`,
  };
}

/**
 * Fügt die neue Unteraufgabe den entsprechenden Arrays hinzu.
 * @param {string} subtaskValue - Der Text der Unteraufgabe.
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
 * Setzt das Eingabefeld für die Unteraufgabe zurück.
 * @param {HTMLInputElement} input - Das Eingabefeld der Unteraufgabe.
 */
function resetSubtaskInput(input) {
  input.value = "";
}

/**
 * Aktualisiert die Symbole für Unteraufgaben, indem bestimmte Icons ein- oder ausgeblendet werden.
 */
function updateSubtaskIcons() {
  document.getElementById("clear-add-icons").classList.add("d-none");
  document.getElementById("subtasks-plus-icon").classList.remove("d-none");
}

/**
 * Ermöglicht das Bearbeiten einer Unteraufgabe.
 * @param {string} liId - Die ID des Listen-Elements.
 * @param {string} spanId - Die ID des Span-Elements.
 * @param {string} inputId - Die ID des Input-Elements.
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
 * Löscht eine Unteraufgabe aus dem DOM.
 * @param {string} liId - Die ID des Listen-Elements der Unteraufgabe.
 */
function deleteSubtask(liId) {
  const li = document.getElementById(liId);
  li.remove();
}

/**
 * Speichert eine bearbeitete Unteraufgabe, wenn der neue Text gültig ist.
 * @param {string} liId - Die ID des Listen-Elements.
 * @param {string} inputId - Die ID des Input-Elements.
 * @param {string} spanId - Die ID des Span-Elements.
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
 * Löscht den Inhalt des Unteraufgaben-Eingabefeldes.
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  input.value = "";
}