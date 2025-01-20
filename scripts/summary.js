/**
 * Firebase configuration object.
 * Contains the URL to the Firebase database.
 * @constant {Object}
 */
const firebaseConfig = {
  databaseURL:
    "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app",
};

/**
 * Initializes the Firebase app with the provided configuration.
 */
firebase.initializeApp(firebaseConfig);

/**
 * Reference to the Firebase database.
 * @constant {firebase.database.Database}
 */
const db = firebase.database();

/**
 * Array for storing tasks.
 * @type {Array<Object>}
 */
let taskArray = [];

/**
 * Array for storing contact data.
 * @type {Array<Object>}
 */
let finalContacts = [];

/**
 * Array for storing contact data for editing.
 * @type {Array<Object>}
 */
let finalContactsForEdit = [];

/**
 * The currently logged-in user.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * Initializes the summary page.
 * Loads HTML content, updates the greeting, loads user data, and tasks from Firebase.
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
 * Updates the greeting based on the current time of day.
 * Sets the greeting text to "Good morning,", "Good afternoon,", or "Good evening,".
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
 * Loads user data from Local Storage and displays the user greeting.
 * If no user data is found, redirects the user to the login page.
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
    console.error("No user found in Local Storage.");
    window.location.href =
      "login.html?msg=" + encodeURIComponent("Please log in again.");
  }
}

/**
 * Displays the user greeting with the first and last name.
 *
 * @function showUserGreeting
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {void}
 */
function showUserGreeting(firstName, lastName) {
  const greetingName = document.getElementById("nameOfUser");
  if (greetingName) {
    greetingName.innerHTML = `<p>${firstName} ${lastName}</p>`;
  }
}

/**
 * Loads tasks from Firebase and renders the summary panels.
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
      console.error("No tasks found in the Firebase database.");
    }
  });
}

/**
 * Calculates the summary of tasks based on their status and upcoming deadlines.
 *
 * @function calculateTaskSummary
 * @param {Array<Object>} tasks - The array of task objects.
 * @returns {Object} An object containing the number of tasks in various status categories,
 *                   the total number of tasks, and information about the upcoming deadline.
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
 * Renders the summary panels based on the calculated statistics.
 *
 * @function renderPanels
 * @param {Object} stats - The object containing the summarized task statistics.
 * @param {number} stats.toDo - Number of tasks in "To-do" status.
 * @param {number} stats.inProgress - Number of tasks in "In Progress" status.
 * @param {number} stats.feedback - Number of tasks in "Feedback" status.
 * @param {number} stats.done - Number of tasks in "Done" status.
 * @param {number} stats.totalTasks - Total number of tasks.
 * @param {Object|null} stats.upcomingTask - Information about the upcoming deadline.
 * @param {Object|null} stats.upcomingTask.task - The task with the next deadline.
 * @param {number} stats.upcomingTask.count - Number of tasks until the next deadline.
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
 * Creates the HTML for a single panel.
 *
 * @function createPanel
 * @param {string} title - The title of the panel.
 * @param {number} value - The value or count to display in the panel.
 * @param {string} [imgSrc=""] - The source of the image to display in the panel. Optional.
 * @param {string} [extraClass=""] - Additional CSS classes for the panel. Optional.
 * @returns {string} The generated HTML for the panel.
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
 * Creates the HTML for a large panel displaying information about the upcoming task.
 *
 * @function createLargePanel
 * @param {Object|null} upcomingData - Data about the upcoming task.
 * @param {Object|null} upcomingData.task - The upcoming task.
 * @param {number} upcomingData.count - Number of tasks until the upcoming deadline.
 * @returns {string} The generated HTML for the large panel.
 */
function createLargePanel(upcomingData) {
  const upcomingTask = upcomingData.task;
  const count = upcomingData.count;

  const date = upcomingTask
    ? formatDate(new Date(upcomingTask.date))
    : "No deadlines available";
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
 * Returns the corresponding symbol for a given priority.
 *
 * @function getPriorityIcon
 * @param {string} priority - The priority level ("urgent", "medium", "low").
 * @returns {string} The path to the corresponding icon image.
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
      // Fallback icon in case of an unknown priority value
      return "./img/placeholder-icon.png";
  }
}

/**
 * Finds the next upcoming deadline among the tasks.
 * Sorts the tasks by date and returns the task with the nearest date.
 *
 * @function findUpcomingDeadline
 * @param {Array<Object>} tasks - The array of task objects.
 * @returns {Object} An object containing the upcoming task and the number of tasks until the deadline.
 *                   If no tasks with dates are present, it contains `null` for the task and `0` for the count.
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
 * Formats a date into a readable format (e.g., "1. February 2025").
 *
 * @function formatDate
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date.
 */
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
