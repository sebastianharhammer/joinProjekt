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
    loadCurrentUser();
    await fetchContacts();
    loadBoardNavigator(); // Spalten werden vor dem Laden der Aufgaben geladen
    await fetchTasks("/tasks"); // Aufgaben werden nach dem Laden der Spalten geladen
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