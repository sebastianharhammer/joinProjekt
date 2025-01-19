/**
 * Die Basis-URL für das Hinzufügen von Aufgaben in Firebase.
 * @constant {string}
 */
const ADD_TASK_BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Gibt an, ob der Kategorien-Container gerade geklickt wurde.
 * @type {boolean}
 */
let categoriesContainerClick = false;

/**
 * Array der Kontakte.
 * @type {Array<Object>}
 */
let contacts = [];

/**
 * Die aktuell ausgewählte Priorität für eine Aufgabe.
 * @type {string}
 */
let selectedPriority = "medium";

/**
 * Array der Unteraufgaben.
 * @type {Array<Object>}
 */
let subtasksArr = [];

/**
 * Array der zugewiesenen Benutzer.
 * @type {Array<Object>}
 */
let assignedUserArr = [];

/**
 * Lokales Array der Aufgaben.
 * @type {Array<Object>}
 */
let localTasks = [];

/**
 * Zähler für die Unteraufgaben-IDs.
 * @type {number}
 */
let subtaskIdCounter = 0;

/**
 * Array der bearbeiteten Unteraufgaben.
 * @type {Array<Object>}
 */
let subtasksEdit = [];

/**
 * Array der abgeschlossenen bearbeiteten Unteraufgaben.
 * @type {Array<Object>}
 */
let subtasksEdit_done = [];

/**
 * Array der abgeschlossenen Unteraufgaben.
 * @type {Array<Object>}
 */
let subtasksArr_done = [];

/**
 * Objekt der Kategorie.
 * @type {string}
 */
let categoryObject = "";

/**
 * Array der verfügbaren Kategorien für das Hinzufügen von Aufgaben.
 * @type {Array<Object>}
 */
let addTaskcategories = [
  { category: "User Story", "bg-color": "#0038FF" },
  { category: "Technical Task", "bg-color": "#1FD7C1" },
];

/**
 * Array der zugewiesenen Benutzer.
 * @type {Array<Object>}
 */
let assignedUser = [];

/**
 * Der aktuelle Status der Aufgabe.
 * @type {string}
 */
let localStatus = "";

/**
 * Zeigt das Hinzufügen einer Aufgabe an und initialisiert das Formular.
 *
 * @function showAddTask
 * @param {string} status - Der Status der zu hinzufügenden Aufgabe.
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
 * Versteckt das Hinzufügen einer Aufgabe und setzt den Zustand zurück.
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
 * Behandelt den Abbruch des Formulars zum Hinzufügen einer Aufgabe.
 *
 * @function handleCancel
 * @param {Event} event - Das auslösende Ereignis.
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
 * Setzt die Eingabefelder des Formulars zurück.
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
 * Setzt die relevanten Arrays zurück.
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
 * Setzt die Benutzer-Auswahlen zurück.
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
 * Erstellt eine neue Aufgabe und fügt sie Firebase hinzu.
 *
 * @async
 * @function createTask
 * @param {string} status - Der Status der neuen Aufgabe.
 * @param {Event} event - Das auslösende Ereignis.
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
 * Holt die Formulardaten für die neue Aufgabe.
 *
 * @function getTaskFormData
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
 * Erstellt ein Aufgabenobjekt basierend auf den Formulardaten.
 *
 * @function createTaskObject
 * @param {number} id - Die eindeutige ID der Aufgabe.
 * @param {Object} taskData - Die Daten der Aufgabe aus dem Formular.
 * @returns {Object} Das erstellte Aufgabenobjekt.
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
 * Behandelt den Erfolg bei der Erstellung einer Aufgabe.
 *
 * @function handleTaskCreationSuccess
 * @returns {void}
 */
function handleTaskCreationSuccess() {
  showAddTaskSuccesMessage();
  hideAddTask();
}

/**
 * Validiert die eingegebenen Daten für eine Aufgabe.
 *
 * @function validateTask
 * @param {string} title - Der Titel der Aufgabe.
 * @param {string} date - Das Fälligkeitsdatum der Aufgabe.
 * @param {string} category - Die Kategorie der Aufgabe.
 * @returns {boolean} Gibt `true` zurück, wenn Validierungsfehler vorhanden sind, sonst `false`.
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
 * Zeigt eine Validierungsfehlermeldung an und deaktiviert den Button vorübergehend.
 *
 * @function showValidationError
 * @param {string} elementId - Die ID des Elements, das die Fehlermeldung anzeigen soll.
 * @param {string} message - Die Fehlermeldung.
 * @returns {void}
 */
function showValidationError(elementId, message) {
  const button = document.getElementById("add-task-create");
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.innerHTML = message;
  } else {
    console.error(`Element mit ID '${elementId}' nicht gefunden.`);
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
 * Deaktiviert einen Button und ändert sein Aussehen.
 *
 * @function disableButton
 * @param {HTMLElement} button - Der Button, der deaktiviert werden soll.
 * @returns {void}
 */
function disableButton(button) {
  if (button) {
    button.disabled = true;
    button.style.backgroundColor = "#000000";
    button.style.color = "#2B3647";
  } else {
    console.error("Button-Element nicht gefunden.");
  }
}

/**
 * Aktiviert einen Button und setzt sein Aussehen zurück.
 *
 * @function enableButton
 * @param {HTMLElement} button - Der Button, der aktiviert werden soll.
 * @returns {void}
 */
function enableButton(button) {
  if (button) {
    button.disabled = false;
    button.style.backgroundColor = "#2B3647";
    button.style.color = "#FFFFFF";
  } else {
    console.error("Button-Element nicht gefunden.");
  }
}

/**
 * Holt die nächste verfügbare Task-ID aus Firebase.
 *
 * @async
 * @function getNextTaskId
 * @returns {Promise<number>} Die nächste verfügbare Task-ID.
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
 * Fügt eine neue Aufgabe zu Firebase hinzu.
 *
 * @async
 * @function pushTaskToFirebase
 * @param {Object} newTask - Das zu hinzufügende Aufgabenobjekt.
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
 * Zeigt eine Erfolgsmeldung nach dem Hinzufügen einer Aufgabe an.
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
    console.error("Element mit ID 'add-task-overlay-wrapper' nicht gefunden.");
  }
}

/**
 * Initialisiert die Dropdown-Interaktionen für das Hinzufügen von Aufgaben.
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
    console.error("Dropdown-Element oder Options-Container nicht gefunden.");
  }
}

/**
 * Behandelt den Klick auf das Dropdown-Menü.
 *
 * @function addTaskHandleDropdownClick
 * @param {Event} e - Das auslösende Ereignis.
 * @param {HTMLElement} optionsContainer - Der Container für die Dropdown-Optionen.
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
 * Schaltet die Anzeige des Dropdown-Menüs um.
 *
 * @function addTaskToggleOptionsDisplay
 * @param {HTMLElement} optionsContainer - Der Container für die Dropdown-Optionen.
 * @returns {void}
 */
function addTaskToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

/**
 * Behandelt den Klick auf eine Dropdown-Option.
 *
 * @function addTaskHandleOptionsClick
 * @param {Event} event - Das auslösende Ereignis.
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
 * Holt die Benutzerdaten aus einem Benutzer-Container.
 *
 * @function addTaskGetUserData
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @returns {Object} Die Benutzerdaten.
 */
function addTaskGetUserData(userContainer) {
  return {
    firstName: userContainer.dataset.firstname,
    lastName: userContainer.dataset.lastname,
    color: userContainer.dataset.color,
  };
}

/**
 * Schaltet die Benutzer-Auswahl um, basierend auf den Benutzerdaten.
 *
 * @function addTaskToggleUserSelection
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {Object} userData - Die Daten des Benutzers.
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
 * Findet den Index eines Benutzers im `assignedUserArr`-Array.
 *
 * @function addTaskFindUserIndex
 * @param {Object} userData - Die Daten des Benutzers.
 * @returns {number} Der Index des Benutzers oder `-1`, wenn nicht gefunden.
 */
function addTaskFindUserIndex(userData) {
  return assignedUserArr.findIndex(
    (user) =>
      user.firstName === userData.firstName &&
      user.lastName === userData.lastName
  );
}

/**
 * Entfernt einen Benutzer aus der Auswahl.
 *
 * @function addTaskRemoveUser
 * @param {number} userIndex - Der Index des Benutzers im Array.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {HTMLInputElement} checkbox - Die Checkbox des Benutzers.
 * @returns {void}
 */
function addTaskRemoveUser(userIndex, userContainer, checkbox) {
  assignedUserArr.splice(userIndex, 1);
  if (checkbox) checkbox.checked = false;
  addTaskResetUserContainerStyle(userContainer);
}

/**
 * Fügt einen Benutzer zur Auswahl hinzu.
 *
 * @function addTaskAddUser
 * @param {Object} userData - Die Daten des Benutzers.
 * @param {HTMLElement} userContainer - Der Container des Benutzers.
 * @param {HTMLInputElement} checkbox - Die Checkbox des Benutzers.
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
 * Setzt das Aussehen des Benutzer-Containers zurück.
 *
 * @function addTaskResetUserContainerStyle
 * @param {HTMLElement} container - Der Container des Benutzers.
 * @returns {void}
 */
function addTaskResetUserContainerStyle(container) {
  container.style.backgroundColor = "";
  container.style.color = "";
  container.style.borderRadius = "";
}

/**
 * Setzt das Aussehen des ausgewählten Benutzer-Containers.
 *
 * @function addTaskSetSelectedUserContainerStyle
 * @param {HTMLElement} container - Der Container des Benutzers.
 * @returns {void}
 */
function addTaskSetSelectedUserContainerStyle(container) {
  container.style.backgroundColor = "#2b3647";
  container.style.color = "white";
  container.style.borderRadius = "10px";
}

/**
 * Versteckt das Dropdown-Menü.
 *
 * @function closeDropdown
 * @returns {void}
 */
function closeDropdown() {
  const optionsContainer = document.getElementById("dropdown-options");
  if (optionsContainer) {
    optionsContainer.style.display = "none";
  } else {
    console.error("Element mit ID 'dropdown-options' nicht gefunden.");
  }
}

/**
 * Holt die Aufgaben aus Firebase.
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
 * Holt die Benutzerkontakte aus Firebase.
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
 * Wandelt die Kontakt-Daten in ein Array um und rendert die Dropdown-Optionen.
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
 * Fügt einen Benutzer zur Auswahl hinzu, wenn er noch nicht ausgewählt ist.
 *
 * @function assignUser
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @param {string} color - Die Farbe des Benutzers.
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
 * Zeigt die zugewiesenen Benutzer an.
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
    console.error("Element mit ID 'assigned-users-short' nicht gefunden.");
  }
}

/**
 * Holt den ersten Buchstaben eines Namens.
 *
 * @function getFirstLetter
 * @param {string} name - Der Name, aus dem der erste Buchstabe geholt werden soll.
 * @returns {string} Der erste Buchstabe des Namens in Großbuchstaben.
 */
function getFirstLetter(name) {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Holt die aktuelle Kategorie (Placeholder-Funktion).
 *
 * @function getCategory
 * @returns {string} Die aktuelle Kategorie.
 */
function getCategory() {
  return categoryArr[0];
}

/**
 * Öffnet das Kategorien-Dropdown-Menü für das Hinzufügen einer Aufgabe.
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
    console.error("Dropdown-Element oder Icon nicht gefunden.");
  }
}

/**
 * Versteckt das Kategorien-Dropdown-Menü.
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
    console.error("Dropdown-Element oder Icon nicht gefunden.");
  }
}

/**
 * Rendert die verfügbaren Kategorien im Dropdown-Menü.
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
    console.error("Element mit ID 'dropDownCategoryMenu' nicht gefunden.");
  }
}

/**
 * Wählt eine Kategorie aus und setzt sie als aktuelle Kategorie.
 *
 * @function selectAddTaskCategory
 * @param {string} categoryTask - Die ausgewählte Kategorie.
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
 * Setzt die Priorität einer Aufgabe.
 *
 * @function setPriority
 * @param {string} priority - Die ausgewählte Priorität ("urgent", "medium", "low").
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
    console.error("Prioritäts-Button oder -Bild nicht gefunden.");
  }
}

/**
 * Fügt eine neue Unteraufgabe hinzu.
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
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
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
    console.error(
      "Element 'subtaskInput' oder 'subtasksContent' nicht gefunden."
    );
  }
}

/**
 * Erstellt eine neue Unteraufgabe und gibt das HTML zurück.
 *
 * @function addTaskCreateSubtask
 * @param {string} subtaskValue - Der Wert der Unteraufgabe.
 * @returns {Object} Ein Objekt mit dem generierten HTML.
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
 * Bearbeitet eine Unteraufgabe und ermöglicht das Editieren des Textes.
 *
 * @function editSubtask
 * @param {string} liId - Die ID des Listenelements.
 * @param {string} spanId - Die ID des Span-Elements.
 * @param {string} inputId - Die ID des Input-Elements.
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
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 3000);
      }
    }
  } else {
    console.error("Span-Element oder Listenelement nicht gefunden.");
  }
}

/**
 * Löscht eine Unteraufgabe aus der Liste.
 *
 * @function deleteSubtask
 * @param {string} listId - Die ID des Listenelements.
 * @returns {void}
 */
function deleteSubtask(listId) {
  const list = document.getElementById(listId);
  if (list) {
    list.remove();
  } else {
    console.error(`Listenelement mit ID '${listId}' nicht gefunden.`);
  }
}

/**
 * Speichert die bearbeitete Unteraufgabe.
 *
 * @function saveSubtask
 * @param {string} liId - Die ID des Listenelements.
 * @param {string} inputId - Die ID des Input-Elements.
 * @param {string} spanId - Die ID des Span-Elements.
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
        errorMessageSubtasks.innerHTML = "Subtask can´t be empty!";
        setTimeout(() => {
          errorMessageSubtasks.innerHTML = "";
        }, 1500);
      }
    }
  } else {
    console.error("Listenelement oder Input-Element nicht gefunden.");
  }
}

/**
 * Löscht den Inhalt des Unteraufgaben-Eingabefeldes.
 *
 * @function clearSubtaskInput
 * @returns {void}
 */
function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  if (input) {
    input.value = "";
  } else {
    console.error("Element mit ID 'subtaskInput' nicht gefunden.");
  }
}

/**
 * Zeigt den "Clear"-Button für die Unteraufgaben-Eingabe an.
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
    console.error("Elemente für Clear-Button oder Plus-Icon nicht gefunden.");
  }
}
