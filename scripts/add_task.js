/**
 * Gibt an, ob der Kategoriencontainer geklickt wurde.
 * @type {boolean}
 */
let categoriesContainerClick = false;

/**
 * Array zur Speicherung von Kontakten.
 * @type {Array}
 */
let contacts = [];

/**
 * Die aktuell ausgewählte Priorität.
 * @type {string}
 */
let selectedPriority = "medium";

/**
 * Array zur Speicherung von Unteraufgaben.
 * @type {Array}
 */
let subtasksArr = [];

/**
 * Array zur Speicherung von zugewiesenen Benutzern.
 * @type {Array}
 */
let assignedUserArr = [];

/**
 * Lokale Speicherung von Aufgaben.
 * @type {Array}
 */
let localTasks = [];

/**
 * Zähler für Unteraufgaben-IDs.
 * @type {number}
 */
let subtaskIdCounter = 0;

/**
 * Arrays zur Bearbeitung von Unteraufgaben.
 * @type {Array}
 */
let subtasksEdit = [];
let subtasksEdit_done = [];
let subtasksArr_done = [];

/**
 * Aktuelles Kategorieobjekt.
 * @type {string}
 */
let categoryObject = "";

/**
 * Liste der hinzufügbaren Aufgabenkategorien mit Hintergrundfarben.
 * @type {Array<Object>}
 */
let addTaskcategories = [
  { category: "User Story", "bg-color": "#0038FF" },
  {
    category: "Technical Task",
    "bg-color": "#1FD7C1",
  },
];

/**
 * Array zur Speicherung der zugewiesenen Benutzer.
 * @type {Array}
 */
let assignedUser = [];

/**
 * Initialisiert die Anwendung, indem Aufgaben und Benutzer geladen und das HTML eingebunden werden.
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
 * Erstellt eine neue Aufgabe basierend auf den Formulardaten.
 * @param {Event} event - Das auslösende Ereignis.
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
 * Holt die Daten aus dem Aufgabenformular.
 * @returns {Object} Die gesammelten Formulardaten.
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
 * Baut ein neues Aufgabenobjekt basierend auf den Formulardaten.
 * @param {Object} taskData - Die Daten der neuen Aufgabe.
 * @returns {Object} Das erstellte Aufgabenobjekt.
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
 * Speichert die neue Aufgabe in der lokalen Liste und sendet sie an Firebase.
 * @param {Object} newTask - Die zu speichernde Aufgabe.
 */
async function saveTask(newTask) {
  taskArray.push(newTask);
  await pushTaskToFirebase(newTask);
}

/**
 * Behandelt die erfolgreiche Erstellung einer Aufgabe, zeigt eine Bestätigung und leitet weiter.
 */
function handleSuccessfulTaskCreation() {
  showAddTaskSuccesMessage();
  setTimeout(() => {
    window.location.href = "testboard.html";
  }, 1500);
}

/**
 * Behandelt das Abbrechen der Aufgabenerstellung, setzt das Formular und UI zurück.
 * @param {Event} event - Das auslösende Ereignis.
 */
function handleCancel(event) {
  event.preventDefault();
  resetFormValues();
  resetUIElements();
}

/**
 * Setzt die Werte des Formulars zurück.
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
 * Setzt die UI-Elemente zurück, wie z.B. Benutzercontainer und Prioritätsauswahl.
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
 * Validiert die Aufgabe anhand von Titel, Datum und Kategorie.
 * @param {string} title - Der Titel der Aufgabe.
 * @param {string} date - Das Fälligkeitsdatum der Aufgabe.
 * @param {string} category - Die Kategorie der Aufgabe.
 * @returns {boolean} Gibt true zurück, wenn Fehler vorhanden sind.
 */
function validateTask(title, date, category) {
  let hasErrors = false;
  if (!validateTitle(title)) hasErrors = true;
  if (!validateDate(date)) hasErrors = true;
  if (!validateCategory(category)) hasErrors = true;
  return hasErrors;
}

/**
 * Validiert den Titel der Aufgabe.
 * @param {string} title - Der zu validierende Titel.
 * @returns {boolean} Gibt true zurück, wenn der Titel gültig ist.
 */
function validateTitle(title) {
  if (!title) {
    showFieldError("addTitleError", "Title is required!");
    return false;
  }
  return true;
}

/**
 * Validiert das Datum der Aufgabe.
 * @param {string} date - Das zu validierende Datum.
 * @returns {boolean} Gibt true zurück, wenn das Datum gültig ist.
 */
function validateDate(date) {
  if (!date) {
    showFieldError("addDateError", "Date is required!");
    return false;
  }
  if (date < new Date().toISOString().split("T")[0]) {
    showFieldError("addDateError", "Date can’t be in the past!");
    return false;
  }
  return true;
}

/**
 * Validiert die Kategorie der Aufgabe.
 * @param {string} category - Die zu validierende Kategorie.
 * @returns {boolean} Gibt true zurück, wenn die Kategorie gültig ist.
 */
function validateCategory(category) {
  if (!category) {
    showFieldError("addCategoryError", "Category is required!");
    return false;
  }
  return true;
}

/**
 * Zeigt eine Fehlermeldung für ein bestimmtes Feld an und deaktiviert den Erstellen-Button vorübergehend.
 * @param {string} elementId - Die ID des Elements, das die Fehlermeldung anzeigen soll.
 * @param {string} message - Die Fehlermeldung.
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
 * Zeigt eine Erfolgsmeldung nach erfolgreichem Hinzufügen einer Aufgabe an.
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
 * Holt die nächste verfügbare Aufgaben-ID von Firebase.
 * @returns {number} Die nächste Aufgaben-ID.
 */
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

/**
 * Sendet die neue Aufgabe an Firebase zur Speicherung.
 * @param {Object} newTask - Die zu speichernde Aufgabe.
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
 * Behandelt die Interaktion mit dem Dropdown-Menü für Benutzerzuweisungen.
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
 * Behandelt den Klick auf das Dropdown-Menü.
 * @param {Event} event - Das auslösende Ereignis.
 * @param {HTMLElement} optionsContainer - Der Container für die Dropdown-Optionen.
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

/**
 * Wechselt die Sichtbarkeit des Dropdown-Menüs.
 * @param {HTMLElement} optionsContainer - Der Container für die Dropdown-Optionen.
 */
function toggleDropdown(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

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
 * Holt die Aufgaben von Firebase und speichert sie lokal.
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
 * Holt die Benutzerkontakte von Firebase und speichert sie.
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
 * Wandelt die Kontaktliste in ein Array um und rendert die Dropdown-Optionen.
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
 * Setzt die Priorität einer Aufgabe und aktualisiert die UI entsprechend.
 * @param {string} priority - Die ausgewählte Priorität ("urgent", "medium", "low").
 */
function setPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    const btn = document.getElementById(`prio-${prio}`);
    const img = document.getElementById(`prio-image-${prio}`);
    btn.classList.remove(
      prio === "urgent" ? "red" : prio === "medium" ? "yellow" : "green"
    );
    img.classList.remove("sat-0");
  });
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
  errorMessageSubtasks.innerHTML = "Subtask can’t be empty!";
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
    errorMessageSubtasks.innerHTML = "Subtask can’t be empty!";
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
    errorMessageSubtasks.innerHTML = "Subtask can’t be empty!";
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

/**
 * Zeigt den Clear-Button an und versteckt das Plus-Icon bei der Unteraufgabenerstellung.
 */
function showClearButton() {
  document.getElementById("clear-add-icons").classList.remove("d-none");
  document.getElementById("subtasks-plus-icon").classList.add("d-none");
}
