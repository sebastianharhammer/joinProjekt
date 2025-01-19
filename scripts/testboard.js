/**
 * Die Basis-URL deiner Firebase-Datenbank.
 * @constant {string}
 */
const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Array der angemeldeten Benutzer.
 * @type {Array<Object>}
 */
let signedUsersArray = [];

/**
 * Der aktuell angemeldete Benutzer.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * Das aktuell gezogene Element beim Drag-and-Drop.
 * @type {string|null}
 */
let currentDraggedElement = null;

/**
 * Die aktuell bearbeitete Aufgabe.
 * @type {Object|null}
 */
let currentTaskBeingEdited = null;

/**
 * Das Array der Kontakte.
 * @type {Array<Object>}
 */
let finalContacts = [];

/**
 * Das Array der Aufgaben.
 * @type {Array<Object>}
 */
let taskArray = [];

/**
 * Initialisiert die Anwendung.
 * Lädt HTML-Inhalte, den aktuellen Benutzer, Kontakte, den Board-Navigator und Aufgaben.
 *
 * @async
 * @function init
 * @returns {Promise<void>}
 */
async function init() {
  try {
    await includeHTML();
    console.log("HTML-Inhalte geladen");
    loadCurrentUser();
    console.log("Aktueller Benutzer geladen:", currentUser);
    await fetchContacts();
    console.log("Kontakte geladen:", finalContacts);
    loadBoardNavigator(); // Spalten werden vor dem Laden der Aufgaben geladen
    console.log("Board-Navigator geladen");
    await fetchTasks("/tasks"); // Aufgaben werden nach dem Laden der Spalten geladen
    console.log("Aufgaben geladen und HTML aktualisiert");
  } catch (error) {
    console.error("Fehler bei der Initialisierung:", error);
  }
}

/**
 * Lädt die Kontakte von der Firebase-Datenbank und speichert sie im `finalContacts` Array.
 *
 * @async
 * @function fetchContacts
 * @returns {Promise<void>}
 */
async function fetchContacts() {
  try {
    const response = await fetch(`${BASE_URL}/contacts/.json`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    if (responseToJson) {
      finalContacts = Object.values(responseToJson);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

/**
 * Lädt den aktuell angemeldeten Benutzer aus dem Local Storage.
 *
 * @function loadCurrentUser
 * @returns {void}
 */
function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Fehler beim Parsen des gespeicherten Benutzers:", error);
    }
  }
}

/**
 * Lädt die Aufgaben von der Firebase-Datenbank, transformiert sie und aktualisiert die HTML-Anzeige.
 *
 * @async
 * @function fetchTasks
 * @param {string} [path="/tasks"] - Der Pfad zur Firebase-Datenbank für Aufgaben.
 * @returns {Promise<void>}
 */
async function fetchTasks(path = "/tasks") {
  try {
    const responseToJson = await fetchTaskData(path);
    if (responseToJson) {
      taskArray = transformTaskArray(responseToJson);
    }
    updateTaskHTML();
  } catch (error) {
    console.error("Fehler beim Laden der Aufgaben:", error);
  }
}

/**
 * Holt die Aufgaben-Daten von der Firebase-Datenbank basierend auf dem angegebenen Pfad.
 *
 * @async
 * @function fetchTaskData
 * @param {string} path - Der Pfad zur Firebase-Datenbank für Aufgaben.
 * @returns {Promise<Object|null>} Die Aufgaben-Daten als JSON-Objekt oder `null` bei Fehler.
 */
async function fetchTaskData(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}.json`);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fehler beim Abrufen der Aufgaben von ${path}:`, error);
    return null;
  }
}

/**
 * Transformiert das Aufgaben-Array aus dem Firebase-Response-JSON in ein verwendbares Format.
 *
 * @function transformTaskArray
 * @param {Object} responseToJson - Das JSON-Objekt aus Firebase mit den Aufgaben.
 * @returns {Array<Object>} Das transformierte Aufgaben-Array.
 */
function transformTaskArray(responseToJson) {
  return Object.values(responseToJson).map((task) => transformTask(task));
}

/**
 * Transformiert eine einzelne Aufgabe, indem sie die Besitzerinformationen anpasst.
 *
 * @function transformTask
 * @param {Object} task - Das Aufgabenobjekt aus Firebase.
 * @returns {Object} Das transformierte Aufgabenobjekt.
 */
function transformTask(task) {
  if (task.owner) {
    task.owner = task.owner.map((owner) => transformOwner(owner));
  }
  return task;
}

/**
 * Transformiert einen Besitzer, indem er die Farbe aus den Kontaktdaten hinzufügt.
 *
 * @function transformOwner
 * @param {Object} owner - Das Besitzerobjekt mit `firstName` und `lastName`.
 * @returns {Object} Das transformierte Besitzerobjekt mit zusätzlicher `color`-Eigenschaft.
 */
function transformOwner(owner) {
  const contact = finalContacts.find(
    (c) => c.firstName === owner.firstName && c.lastName === owner.lastName
  );
  return { ...owner, color: contact?.color || "gray" };
}

/**
 * Startet den Drag-Vorgang für eine Aufgabe.
 *
 * @function startDragging
 * @param {string} id - Die ID der zu ziehenden Aufgabe.
 * @returns {void}
 */
function startDragging(id) {
  currentDraggedElement = id;
}

/**
 * Erlaubt das Ablegen eines Elements, indem das Standardverhalten verhindert wird.
 *
 * @function allowDrop
 * @param {Event} event - Das Drag-and-Drop-Ereignis.
 * @returns {void}
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Verschiebt eine Aufgabe in eine andere Kategorie und aktualisiert Firebase, falls nicht Gastbenutzer.
 *
 * @async
 * @function moveTo
 * @param {string} category - Die Zielkategorie (z.B. "inProgress", "done").
 * @returns {Promise<void>}
 */
async function moveTo(category) {
  const taskIndex = taskArray.findIndex(
    (task) => task.id === currentDraggedElement
  );
  if (taskIndex !== -1) {
    taskArray[taskIndex].status = category;
    if (
      currentUser &&
      currentUser.firstName === "Guest" &&
      currentUser.lastName === "User"
    ) {
      updateTaskHTML();
    } else {
      try {
        await updateTaskInFirebase(taskArray[taskIndex]);
        updateTaskHTML();
      } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
      }
    }
  }
}

/**
 * Aktualisiert eine Aufgabe in Firebase.
 *
 * @async
 * @function updateTaskInFirebase
 * @param {Object} task - Das zu aktualisierende Aufgabenobjekt.
 * @returns {Promise<void>}
 */
async function updateTaskInFirebase(task) {
  const taskId = task.id;
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Tasks ${taskId}:`, error);
  }
}

/**
 * Lädt den Board-Navigator und die Spalten in die HTML-Anzeige.
 *
 * @function loadBoardNavigator
 * @returns {void}
 */
function loadBoardNavigator() {
  const content = document.getElementById("wholeBoard");
  if (!content) {
    console.error("Element mit ID 'wholeBoard' nicht gefunden.");
    return;
  }
  content.innerHTML = "";
  content.innerHTML += getBoardNavigatorHTML();
  content.innerHTML += getColumnsHTML();
  console.log("Board-Navigator und Spalten geladen");
}

/**
 * Filtert Aufgaben basierend auf der Eingabe im Filterfeld.
 *
 * @function filterTaskFunction
 * @returns {void}
 */
function filterTaskFunction() {
  filterTasksByInput("filterTask");
}

/**
 * Filtert Aufgaben basierend auf der Eingabe im mobilen Filterfeld.
 *
 * @function filterTaskFunctionMobile
 * @returns {void}
 */
function filterTaskFunctionMobile() {
  filterTasksByInput("filterTask-mobile");
}

/**
 * Filtert Aufgaben basierend auf dem Wert eines bestimmten Eingabefeldes.
 *
 * @function filterTasksByInput
 * @param {string} inputId - Die ID des Eingabefeldes.
 * @returns {void}
 */
function filterTasksByInput(inputId) {
  const myFilter = getFilterValue(inputId);
  const tasksFound = filterTasks(myFilter);
  toggleNoResultsMessage(tasksFound, myFilter, inputId);
}

/**
 * Holt den Filterwert aus einem Eingabefeld.
 *
 * @function getFilterValue
 * @param {string} inputId - Die ID des Eingabefeldes.
 * @returns {string} Der Filterwert in Kleinbuchstaben.
 */
function getFilterValue(inputId) {
  const element = document.getElementById(inputId);
  if (!element) {
    console.error(`Element mit ID '${inputId}' nicht gefunden.`);
    return "";
  }
  return element.value.toLowerCase();
}

/**
 * Filtert die Aufgaben basierend auf dem angegebenen Filtertext.
 *
 * @function filterTasks
 * @param {string} myFilter - Der Filtertext in Kleinbuchstaben.
 * @returns {boolean} Gibt true zurück, wenn mindestens eine Aufgabe gefunden wurde, sonst false.
 */
function filterTasks(myFilter) {
  let tasksFound = false;
  taskArray.forEach((task) => {
    const paramToFind = document.getElementById(`title${task.id}`);
    const param2ToFind = document.getElementById(`description${task.id}`);
    const wholeTask = document.getElementById(`boardTask${task.id}`);

    if (paramToFind || (param2ToFind && wholeTask)) {
      tasksFound =
        applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) ||
        tasksFound;
    }
  });
  return tasksFound;
}

/**
 * Wendet den Filter auf eine einzelne Aufgabe an und zeigt oder versteckt sie entsprechend.
 *
 * @function applyFilterToTask
 * @param {HTMLElement|null} paramToFind - Das HTML-Element, das den Titel der Aufgabe enthält.
 * @param {HTMLElement|null} param2ToFind - Das HTML-Element, das die Beschreibung der Aufgabe enthält.
 * @param {HTMLElement|null} wholeTask - Das gesamte Aufgaben-Element im Board.
 * @param {string} myFilter - Der Filtertext in Kleinbuchstaben.
 * @returns {boolean} Gibt true zurück, wenn die Aufgabe dem Filter entspricht, sonst false.
 */
function applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) {
  if (!wholeTask) {
    console.error("Element 'wholeTask' nicht gefunden.");
    return false;
  }

  const titleMatch =
    paramToFind && paramToFind.innerText.toLowerCase().includes(myFilter);
  const descriptionMatch =
    param2ToFind && param2ToFind.innerText.toLowerCase().includes(myFilter);

  if (titleMatch || descriptionMatch) {
    wholeTask.style.display = "";
    return true;
  } else {
    wholeTask.style.display = "none";
    return false;
  }
}

/**
 * Zeigt oder versteckt die "Keine Ergebnisse"-Meldung basierend auf den gefundenen Aufgaben.
 *
 * @function toggleNoResultsMessage
 * @param {boolean} tasksFound - Gibt an, ob Aufgaben gefunden wurden.
 * @param {string} myFilter - Der Filtertext in Kleinbuchstaben.
 * @param {string} inputId - Die ID des Eingabefeldes.
 * @returns {void}
 */
function toggleNoResultsMessage(tasksFound, myFilter, inputId) {
  const noResultsMessage = document.querySelector(`#${inputId} ~ p#noResults`);
  if (!noResultsMessage) {
    console.error(`Element 'noResults' neben '#${inputId}' nicht gefunden.`);
    return;
  }

  if (!tasksFound && myFilter.length > 0) {
    noResultsMessage.style.display = "block";
  } else {
    noResultsMessage.style.display = "none";
  }
}

/**
 * Fügt die Spalten-HTML zum angegebenen Container hinzu.
 *
 * @function getColumns
 * @param {HTMLElement} content - Der Container, zu dem die Spalten hinzugefügt werden sollen.
 * @returns {void}
 */
function getColumns(content) {
  content.innerHTML += getColumnsHTML();
}

/**
 * Aktualisiert die HTML-Anzeige der Aufgaben in den entsprechenden Spalten.
 *
 * @function updateTaskHTML
 * @returns {void}
 */
function updateTaskHTML() {
  console.log("updateTaskHTML aufgerufen");
  const todoColumn = document.getElementById("todo");
  const inProgressColumn = document.getElementById("inProgress");
  const feedbackColumn = document.getElementById("feedback");
  const doneColumn = document.getElementById("done");

  if (!todoColumn || !inProgressColumn || !feedbackColumn || !doneColumn) {
    console.error("Eine oder mehrere Spalten-Elemente nicht gefunden.");
    return;
  }

  todoColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  feedbackColumn.innerHTML = "";
  doneColumn.innerHTML = "";

  const todos = taskArray.filter((task) => task.status === "todo");
  const inProgress = taskArray.filter((task) => task.status === "inProgress");
  const feedback = taskArray.filter((task) => task.status === "feedback");
  const done = taskArray.filter((task) => task.status === "done");

  todos.forEach((task) => {
    todoColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  });

  inProgress.forEach((task) => {
    inProgressColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  });

  feedback.forEach((task) => {
    feedbackColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  });

  done.forEach((task) => {
    doneColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  });

  if (todos.length === 0) {
    createNoTasksDiv("todo", "NO TASKS TO DO");
  }
  if (inProgress.length === 0) {
    createNoTasksDiv("inProgress", "NO TASKS IN PROGRESS");
  }
  if (feedback.length === 0) {
    createNoTasksDiv("feedback", "NO TASKS IN FEEDBACK");
  }
  if (done.length === 0) {
    createNoTasksDiv("done", "NO TASKS DONE");
  }

  console.log("Task HTML aktualisiert");
}

/**
 * Erstellt ein HTML-Element für eine "Keine Aufgaben"-Meldung und fügt es zur angegebenen Spalte hinzu.
 *
 * @function createNoTasksDiv
 * @param {string} columnId - Die ID der Spalte, in die die Meldung eingefügt werden soll.
 * @param {string} message - Die Nachricht, die angezeigt werden soll.
 * @returns {void}
 */
function createNoTasksDiv(columnId, message) {
  const column = document.getElementById(columnId);
  if (column) {
    column.innerHTML += /*html*/ `
      <div class="noTasks">
        <p class="font-no-tasks">${message}</p>
      </div>
    `;
  } else {
    console.error(`Spalte mit ID '${columnId}' nicht gefunden.`);
  }
}

/**
 * Erstellt ein "Keine To-Dos"-Div und fügt es zur To-Do-Spalte hinzu.
 *
 * @function createNoToDosdiv
 * @returns {void}
 */
function createNoToDosdiv() {
  const todoColumn = document.getElementById("todo");
  if (todoColumn) {
    todoColumn.innerHTML += /*html*/ `
      <div class="noTasks">
        <p class="font-no-tasks">NO TASKS TO DO</p>
      </div>
    `;
  } else {
    console.error("Spalte mit ID 'todo' nicht gefunden.");
  }
}

/**
 * Erstellt die Kreise für die Besitzer einer Aufgabe.
 *
 * @function createOwnerCircles
 * @param {Object} task - Die Aufgabenobjekt mit den Besitzerinformationen.
 * @returns {void}
 */
function createOwnerCircles(task) {
  const userNameCircles = document.getElementById(`userNameCircles-${task.id}`);
  if (!userNameCircles) {
    console.error("Owner-Kreis-Container nicht gefunden!");
    return;
  }
  userNameCircles.innerHTML = "";

  if (!task.owner || task.owner.length === 0) {
    userNameCircles.innerHTML = generateNoOwnerCircle();
    return;
  }

  const ownersToShow = task.owner.slice(0, 2);
  const extraOwnersCount = task.owner.length - 2;

  ownersToShow.forEach((owner) => {
    userNameCircles.innerHTML += generateOwnerCircle(owner);
  });

  if (extraOwnersCount > 0) {
    userNameCircles.innerHTML += getExtraOwnersCountCircle(extraOwnersCount);
  }
}

/**
 * Bestimmt und setzt die CSS-Klasse der Aufgaben-Kategorie.
 *
 * @function findClassOfTaskCat
 * @param {Object} task - Die Aufgabenobjekt mit der Kategorieinformation.
 * @returns {void}
 */
function findClassOfTaskCat(task) {
  const taskButton = document.getElementById(`taskButton-${task.id}`);
  if (!taskButton) {
    console.error(`Task-Button für Task ID '${task.id}' nicht gefunden.`);
    return;
  }

  const category = task.taskCategory || "Undefined Category";

  taskButton.classList.remove(
    "task-category-technicalTask",
    "task-category-userExperience",
    "task-category-undefined"
  );

  if (category === "Technical Task") {
    taskButton.classList.add("task-category-technicalTask");
  } else if (category === "User Story") {
    taskButton.classList.add("task-category-userExperience");
  } else {
    taskButton.classList.add("task-category-undefined");
  }
  taskButton.textContent = category;
}

/**
 * Setzt das Prioritäts-Symbol für eine Aufgabe basierend auf deren Priorität.
 *
 * @function findPrioIcon
 * @param {Object} task - Die Aufgabenobjekt mit der Prioritätsinformation.
 * @returns {void}
 */
function findPrioIcon(task) {
  const prioIcon = document.getElementById(`priority-${task.id}`);
  if (!prioIcon) {
    console.error(`Prioritäts-Icon für Task ID '${task.id}' nicht gefunden.`);
    return;
  }

  switch (task.prio) {
    case "urgent":
      prioIcon.src = "./img/prio-high.png";
      break;
    case "medium":
      prioIcon.src = "./img/prio-mid.png";
      break;
    case "low":
      prioIcon.src = "./img/prio-low.png";
      break;
    default:
      // Fallback-Icon, falls ein unbekannter Prio-Wert reinkommt
      prioIcon.src = "./img/placeholder-icon.png";
  }
}

/**
 * Holt die Unteraufgaben einer Aufgabe oder gibt einen leeren String zurück, wenn keine vorhanden sind.
 *
 * @function getSubTasks
 * @param {Object} task - Die Aufgabenobjekt mit den Unteraufgaben.
 * @returns {string} Das generierte HTML für die Unteraufgaben oder ein leerer String.
 */
function getSubTasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "";
  }
  return generateSubTasksHTML(task);
}

/**
 * Generiert das HTML für die Unteraufgaben einer Aufgabe.
 *
 * @function generateSubTasksHTML
 * @param {Object} task - Die Aufgabenobjekt mit den Unteraufgaben.
 * @returns {string} Das generierte HTML für die Unteraufgaben.
 */
function generateSubTasksHTML(task) {
  let subtTasksHTML = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    subtTasksHTML += createSubTaskHTML(task, i);
  }
  return subtTasksHTML;
}

/**
 * Aktualisiert die Anzeige der abgeschlossenen Unteraufgaben und den Fortschrittsbalken.
 *
 * @function updateCompletedSubtasks
 * @param {string} taskId - Die ID der Aufgabe, deren Unteraufgaben aktualisiert werden sollen.
 * @returns {void}
 */
function updateCompletedSubtasks(taskId) {
  const task = taskArray.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return;

  const completedCount = task.subtasks.filter(
    (subtask) => subtask.checkbox
  ).length;
  const totalSubtasks = task.subtasks.length;

  const renderCompleted = document.getElementById(`amountOfSubtasks-${taskId}`);
  const progressBar = document.getElementById(`progress-${taskId}`);

  if (renderCompleted && progressBar) {
    if (totalSubtasks > 0) {
      renderCompleted.innerHTML = `${completedCount} / ${totalSubtasks} Subtasks`;
      progressBar.value = (completedCount / totalSubtasks) * 100;
      renderCompleted.style.display = "";
      progressBar.style.display = "";
    } else {
      renderCompleted.style.display = "none";
      progressBar.style.display = "none";
    }
  }
}

/**
 * Bestimmt die Anzahl der Unteraufgaben einer Aufgabe.
 *
 * @function findAmountOfSubtasks
 * @param {Object} task - Die Aufgabenobjekt mit den Unteraufgaben.
 * @returns {string} Die Anzahl der Unteraufgaben als String oder "0", wenn keine vorhanden sind.
 */
function findAmountOfSubtasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "0";
  }
  return task.subtasks.length.toString();
}

/**
 * Erstellt das HTML für eine einzelne Aufgabe.
 *
 * @function createTaskHTML
 * @param {Object} task - Die Aufgabenobjekt, für die das HTML erstellt werden soll.
 * @returns {string} Das generierte HTML für die Aufgabe.
 */
function createTaskHTML(task) {
  const completedSubtasks = task.subtasks
    ? task.subtasks.filter((subtask) => subtask.checkbox).length
    : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

  return getTaskHTML(task, completedSubtasks, totalSubtasks);
}

/**
 * Zeigt die Detailansicht einer Aufgabe an.
 *
 * @function showTaskCard
 * @param {string} id - Die ID der anzuzeigenden Aufgabe.
 * @returns {void}
 */
function showTaskCard(id) {
  const task = taskArray.find((task) => task.id === id);
  if (!task) {
    console.error(`Task mit ID ${id} nicht gefunden.`);
    return;
  }
  const taskCardOverlay = document.getElementById("taskDetailView");
  if (!taskCardOverlay) {
    console.error("Element mit ID 'taskDetailView' nicht gefunden.");
    return;
  }
  taskCardOverlay.innerHTML = "";
  taskCardOverlay.classList.remove("d-none");
  taskCardOverlay.innerHTML += showTaskCardHTML(task);
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

/**
 * Schließt die Detailansicht einer Aufgabe.
 *
 * @function closeDetailView
 * @returns {void}
 */
function closeDetailView() {
  const taskCardOverlay = document.getElementById("taskDetailView");
  if (!taskCardOverlay) {
    console.error("Element mit ID 'taskDetailView' nicht gefunden.");
    return;
  }
  taskCardOverlay.classList.add("d-none");
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

/**
 * Erstellt das HTML für die Detailansicht einer Aufgabe.
 *
 * @function showTaskCardHTML
 * @param {Object} task - Die Aufgabenobjekt, für die das Detail-HTML erstellt werden soll.
 * @returns {string} Das generierte HTML für die Detailansicht der Aufgabe.
 */
function showTaskCardHTML(task) {
  return /*html*/ `
    <div id="currentTaskCard${task.id}" class="currentTaskCard">
      ${getTaskCategoryButtonHTML(task)}
      ${getTaskDetailsHTML(task)}
      <div class="taskOwnersSection">
        <p class="firstTableColumnFont">Assigned To:</p>
        <div class="assignedOwnersContainer">
          ${getAssignedOwnersHTML(task)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Erstellt das HTML für die Kategorie-Schaltfläche einer Aufgabe in der Detailansicht.
 *
 * @function getTaskCategoryButtonHTML
 * @param {Object} task - Die Aufgabenobjekt mit der Kategorieinformation.
 * @returns {string} Das generierte HTML für die Kategorie-Schaltfläche.
 */
function getTaskCategoryButtonHTML(task) {
  return /*html*/ `
    <div class="headAreaTaskcard">
      <div id="taskButton-${task.id}" class="${getTaskCategoryClass(
    task.taskCategory
  )}">
        ${task.taskCategory}
      </div>
      <div class="closeCardParent">
        <img class="closeCard" onclick="closeDetailView()" src="./img/close.svg" alt="Close">
      </div>
    </div>
  `;
}

/**
 * Zeigt die Löschbestätigungsfrage an.
 *
 * @function askFordeleteTask
 * @returns {void}
 */
function askFordeleteTask() {
  const deleteDiv = document.getElementById("deleteConfirmation");
  if (!deleteDiv) {
    console.error("Element mit ID 'deleteConfirmation' nicht gefunden.");
    return;
  }
  deleteDiv.classList.remove("d-none");
}

/**
 * Löscht eine Aufgabe aus Firebase und aktualisiert die Anzeige.
 *
 * @async
 * @function deleteTask
 * @param {string} taskId - Die ID der zu löschenden Aufgabe.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    taskArray.splice(taskIndex, 1);
    closeDetailView();
    updateTaskHTML();
  } catch (error) {
    console.error(`Fehler beim Löschen des Tasks ${taskId}:`, error);
  }
}

/**
 * Schließt die Löschbestätigungsfrage.
 *
 * @function closeQuestionDelete
 * @returns {void}
 */
function closeQuestionDelete() {
  const deleteQuestDiv = document.getElementById("deleteConfirmation");
  if (!deleteQuestDiv) {
    console.error("Element mit ID 'deleteConfirmation' nicht gefunden.");
    return;
  }
  deleteQuestDiv.classList.add("d-none");
}

/**
 * Schaltet das Checkbox-Status einer Unteraufgabe um und aktualisiert Firebase.
 *
 * @async
 * @function toggleSubtaskCheckbox
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {number} subtaskIndex - Der Index der Unteraufgabe in der Aufgabenliste.
 * @returns {Promise<void>}
 */
async function toggleSubtaskCheckbox(taskId, subtaskIndex) {
  const task = taskArray.find((task) => task.id === taskId);
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task oder Subtask nicht gefunden.");
    return;
  }
  const subtask = task.subtasks[subtaskIndex];
  subtask.checkbox = !subtask.checkbox;
  try {
    await updateTaskInFirebase(task);
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Subtasks: ${error}`);
  }
  updateTaskHTML();
}

/**
 * Erstellt das HTML für die zugewiesenen Besitzer einer Aufgabe.
 *
 * @function getAssignedOwnersHTML
 * @param {Object} task - Die Aufgabenobjekt mit den Besitzerinformationen.
 * @returns {string} Das generierte HTML für die zugewiesenen Besitzer.
 */
function getAssignedOwnersHTML(task) {
  if (!task.owner || task.owner.length === 0) {
    return getNoOwnersHTML();
  }
  return task.owner.map(getOwnerItemHTML).join("\n");
}

/**
 * Bestimmt die CSS-Klasse basierend auf der Aufgaben-Kategorie.
 *
 * @function getTaskCategoryClass
 * @param {string} taskCategory - Die Kategorie der Aufgabe.
 * @returns {string} Die entsprechende CSS-Klasse für die Kategorie.
 */
function getTaskCategoryClass(taskCategory) {
  if (taskCategory === "Technical Task")
    return "task-category-technicalTask-taskCard";
  if (taskCategory === "User Story")
    return "task-category-userExperience-taskCard";
  return "task-category-undefined";
}

/**
 * Hebt einen Drag-Bereich hervor.
 *
 * @function highlight
 * @param {string} id - Die ID des Elements, das hervorgehoben werden soll.
 * @returns {void}
 */
function highlight(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add("dragAreaHighlight");
  } else {
    console.error(`Element mit ID '${id}' nicht gefunden.`);
  }
}

/**
 * Entfernt die Hervorhebung eines Drag-Bereichs.
 *
 * @function removeHighlight
 * @param {string} id - Die ID des Elements, dessen Hervorhebung entfernt werden soll.
 * @returns {void}
 */
function removeHighlight(id) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.remove("dragAreaHighlight");
  } else {
    console.error(`Element mit ID '${id}' nicht gefunden.`);
  }
}

/**
 * Verschiebt eine Aufgabe eine Kategorie nach oben (z.B. von "done" zu "feedback").
 *
 * @async
 * @function moveTaskUp
 * @param {string} taskId - Die ID der zu verschiebenden Aufgabe.
 * @param {Event} event - Das auslösende Ereignis.
 * @returns {Promise<void>}
 */
async function moveTaskUp(taskId, event) {
  event.stopPropagation();
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }

  const task = taskArray[taskIndex];

  if (task.status === "done") {
    task.status = "feedback";
  } else if (task.status === "feedback") {
    task.status = "inProgress";
  } else if (task.status === "inProgress") {
    task.status = "todo";
  } else {
    return;
  }

  try {
    await updateTaskInFirebase(task);
    updateTaskHTML();
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks nach oben:", error);
  }
}

/**
 * Verschiebt eine Aufgabe eine Kategorie nach unten (z.B. von "todo" zu "inProgress").
 *
 * @async
 * @function moveTaskDown
 * @param {string} taskId - Die ID der zu verschiebenden Aufgabe.
 * @param {Event} event - Das auslösende Ereignis.
 * @returns {Promise<void>}
 */
async function moveTaskDown(taskId, event) {
  event.stopPropagation();
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }

  const task = taskArray[taskIndex];

  if (task.status === "todo") {
    task.status = "inProgress";
  } else if (task.status === "inProgress") {
    task.status = "feedback";
  } else if (task.status === "feedback") {
    task.status = "done";
  } else {
    return;
  }

  try {
    await updateTaskInFirebase(task);
    updateTaskHTML();
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks nach unten:", error);
  }
}
