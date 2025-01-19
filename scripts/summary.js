/**
 * Firebase-Konfigurationsobjekt.
 * Enthält die URL zur Firebase-Datenbank.
 * @constant {Object}
 */
const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app",
};

/**
 * Initialisiert die Firebase-App mit der bereitgestellten Konfiguration.
 */
firebase.initializeApp(firebaseConfig);

/**
 * Referenz zur Firebase-Datenbank.
 * @constant {firebase.database.Database}
 */
const db = firebase.database();

/**
 * Array zur Speicherung von Aufgaben.
 * @type {Array<Object>}
 */
let taskArray = [];

/**
 * Array zur Speicherung von Kontaktdaten.
 * @type {Array<Object>}
 */
let finalContacts = [];

/**
 * Array zur Speicherung von Kontaktdaten für die Bearbeitung.
 * @type {Array<Object>}
 */
let finalContactsForEdit = [];

/**
 * Der aktuell angemeldete Benutzer.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * Initialisiert die Zusammenfassungsseite.
 * Lädt HTML-Inhalte, aktualisiert die Begrüßung, lädt Benutzerdaten und Aufgaben von Firebase.
 *
 * @async
 * @function initSummary
 * @returns {Promise<void>}
 */
async function initSummary() {
  await includeHTML();

  updateGreeting();

  loadUserData();
  loadTasksFromFirebase();
}

/**
 * Aktualisiert die Begrüßung basierend auf der aktuellen Tageszeit.
 * Setzt den Begrüßungstext auf "Good morning,", "Good afternoon," oder "Good evening,".
 *
 * @function updateGreeting
 * @returns {void}
 */
function updateGreeting() {
  const greetingElement = document.querySelector(".greeting-text h1");
  if (!greetingElement) return;

  const now = new Date();
  const hour = now.getHours();

  if (hour < 12) {
    greetingElement.textContent = "Good morning,";
  } else if (hour < 18) {
    greetingElement.textContent = "Good afternoon,";
  } else {
    greetingElement.textContent = "Good evening,";
  }
}

/**
 * Lädt die Benutzerdaten aus dem Local Storage und zeigt die Benutzerbegrüßung an.
 * Wenn keine Benutzerdaten gefunden werden, leitet der Benutzer zur Login-Seite weiter.
 *
 * @function loadUserData
 * @returns {void}
 */
function loadUserData() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    showUserGreeting(currentUser.firstName, currentUser.lastName);
  } else {
    console.error("Kein Benutzer im Local Storage gefunden.");
    window.location.href =
      "login.html?msg=" +
      encodeURIComponent("Bitte melden Sie sich erneut an.");
  }
}

/**
 * Zeigt die Benutzerbegrüßung mit dem Vornamen und Nachnamen an.
 *
 * @function showUserGreeting
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 * @returns {void}
 */
function showUserGreeting(firstName, lastName) {
  const greetingName = document.getElementById("nameOfUser");
  if (greetingName) {
    greetingName.innerHTML = `<p>${firstName} ${lastName}</p>`;
  }
}

/**
 * Lädt Aufgaben von Firebase und rendert die Zusammenfassungspanels.
 *
 * @function loadTasksFromFirebase
 * @returns {void}
 */
function loadTasksFromFirebase() {
  const tasksRef = db.ref("tasks");

  tasksRef.once("value", (snapshot) => {
    const tasks = snapshot.val();
    if (tasks) {
      const taskSummary = calculateTaskSummary(Object.values(tasks));
      renderPanels(taskSummary);
    } else {
      console.error("Keine Aufgaben in der Firebase-Datenbank gefunden.");
    }
  });
}

/**
 * Berechnet die Zusammenfassung der Aufgaben basierend auf ihrem Status und den kommenden Fristen.
 *
 * @function calculateTaskSummary
 * @param {Array<Object>} tasks - Das Array der Aufgabenobjekte.
 * @returns {Object} Ein Objekt, das die Anzahl der Aufgaben in verschiedenen Statuskategorien,
 *                   die Gesamtanzahl der Aufgaben und die Informationen zur kommenden Frist enthält.
 */
function calculateTaskSummary(tasks) {
  return {
    toDo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "inProgress").length,
    feedback: tasks.filter((t) => t.status === "feedback").length,
    done: tasks.filter((t) => t.status === "done").length,
    totalTasks: tasks.length,
    upcomingTask: findUpcomingDeadline(tasks),
  };
}

/**
 * Rendert die Zusammenfassungspanels basierend auf den berechneten Statistiken.
 *
 * @function renderPanels
 * @param {Object} stats - Das Objekt, das die zusammengefassten Aufgabenstatistiken enthält.
 * @param {number} stats.toDo - Anzahl der Aufgaben im Status "To-do".
 * @param {number} stats.inProgress - Anzahl der Aufgaben im Status "In Progress".
 * @param {number} stats.feedback - Anzahl der Aufgaben im Status "Feedback".
 * @param {number} stats.done - Anzahl der Aufgaben im Status "Done".
 * @param {number} stats.totalTasks - Gesamtanzahl der Aufgaben.
 * @param {Object|null} stats.upcomingTask - Informationen zur kommenden Frist.
 * @param {Object|null} stats.upcomingTask.task - Die Aufgabe mit der nächsten Frist.
 * @param {number} stats.upcomingTask.count - Anzahl der Aufgaben bis zur nächsten Frist.
 * @returns {void}
 */
function renderPanels(stats) {
  const panelContainer = document.getElementById("panelContainer");
  panelContainer.innerHTML = "";

  const panelsHTML = `
    <div class="panel-row-mid">
      ${createPanel("To-do", stats.toDo, "./img/edit-pencil.png")}
      ${createPanel("Done", stats.done, "./img/done-mark.png")}
    </div>
    <div class="panel-row-large">
      ${createLargePanel(stats.upcomingTask)}
    </div>
    <div class="panel-row-small">
      ${createPanel("Tasks in Board", stats.totalTasks, null, "panel-bottom")}  
      ${createPanel(
        "Tasks in progress",
        stats.inProgress,
        null,
        "panel-bottom"
      )}
      ${createPanel("Awaiting Feedback", stats.feedback, null, "panel-bottom")}
    </div>
  `;
  panelContainer.innerHTML = panelsHTML;
}

/**
 * Erstellt das HTML für ein einzelnes Panel.
 *
 * @function createPanel
 * @param {string} title - Der Titel des Panels.
 * @param {number} value - Der Wert oder die Anzahl, die im Panel angezeigt werden soll.
 * @param {string} [imgSrc=""] - Die Quelle des Bildes, das im Panel angezeigt werden soll. Optional.
 * @param {string} [extraClass=""] - Zusätzliche CSS-Klassen für das Panel. Optional.
 * @returns {string} Das generierte HTML für das Panel.
 */
function createPanel(title, value, imgSrc = "", extraClass = "") {
  return `
    <a href="testboard.html" class="panel-link">
      <div class="panel ${extraClass}">
        ${imgSrc ? `<img src="${imgSrc}" alt="${title} Icon" />` : ""}
        <div class="panel-content">
          <p>${value}</p>
          <span>${title}</span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Erstellt das HTML für ein großes Panel, das Informationen zur kommenden Aufgabe anzeigt.
 *
 * @function createLargePanel
 * @param {Object|null} upcomingData - Daten zur kommenden Aufgabe.
 * @param {Object|null} upcomingData.task - Die kommende Aufgabe.
 * @param {number} upcomingData.count - Anzahl der Aufgaben bis zur kommenden Frist.
 * @returns {string} Das generierte HTML für das große Panel.
 */
function createLargePanel(upcomingData) {
  const upcomingTask = upcomingData.task;
  const count = upcomingData.count;

  const date = upcomingTask
    ? formatDate(new Date(upcomingTask.date))
    : "Keine Fristen verfügbar";
  const priority = upcomingTask ? upcomingTask.prio : "No priority";
  const priorityIcon = getPriorityIcon(priority);

  return /*html*/ `
    <a href="testboard.html" class="panel-link">
      <div class="panel large">
        <div class="upComingTaskInfo">
          <p>${count}</p>
          <img class="panel-img-prio" src="${priorityIcon}" alt="${priority} Priority Icon" />
        </div>
        <div class="panel-content">
          <p>${priority}</p>
          <span>Upcoming Task</span>
        </div>
        <div class="divider">
          <hr class="dividerSummary">
        </div>
        <div class="panel-right">
          <span>${date}</span>
          <br />
          <span>Upcoming Deadline</span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Gibt das entsprechende Symbol für eine gegebene Priorität zurück.
 *
 * @function getPriorityIcon
 * @param {string} priority - Die Priorität ("urgent", "medium", "low").
 * @returns {string} Der Pfad zum entsprechenden Symbolbild.
 */
function getPriorityIcon(priority) {
  switch (priority) {
    case "urgent":
      return "./img/up-scale-orange.png";
    case "medium":
      return "./img/Prio_medium_color.svg";
    case "low":
      return "./img/Prio_low_color.svg";
    default:
      // Fallback-Icon, falls ein unbekannter Prio-Wert reinkommt
      return "./img/placeholder-icon.png";
  }
}

/**
 * Findet die nächste anstehende Frist unter den Aufgaben.
 * Sortiert die Aufgaben nach Datum und gibt die Aufgabe mit dem nächsten Datum zurück.
 *
 * @function findUpcomingDeadline
 * @param {Array<Object>} tasks - Das Array der Aufgabenobjekte.
 * @returns {Object} Ein Objekt, das die kommende Aufgabe und die Anzahl der Aufgaben bis zur Frist enthält.
 *                   Wenn keine Aufgaben mit Datum vorhanden sind, enthält es `null` für die Aufgabe und `0` für die Anzahl.
 */
function findUpcomingDeadline(tasks) {
  const tasksWithDates = tasks
    .filter((t) => t.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (tasksWithDates.length > 0) {
    const nextDeadline = tasksWithDates[0].date;
    const tasksUntilDeadline = tasksWithDates.filter(
      (t) => new Date(t.date).getTime() === new Date(nextDeadline).getTime()
    );
    return { task: tasksWithDates[0], count: tasksUntilDeadline.length };
  }

  return { task: null, count: 0 };
}

/**
 * Formatiert ein Datum in ein lesbares Format (z.B. "1. Februar 2025").
 *
 * @function formatDate
 * @param {Date} date - Das Datum, das formatiert werden soll.
 * @returns {string} Das formatierte Datum.
 */
function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
