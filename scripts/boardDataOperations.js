/**
 * The base URL of your Firebase database.
 * @constant {string}
 */
const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Array of signed-in users.
 * @type {Array<Object>}
 */
let signedUsersArray = [];

/**
 * The currently signed-in user.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * The currently dragged element in the drag-and-drop operation.
 * @type {string|null}
 */
let currentDraggedElement = null;

/**
 * The task currently being edited.
 * @type {Object|null}
 */
let currentTaskBeingEdited = null;

/**
 * The array of contacts.
 * @type {Array<Object>}
 */

/**
 * The array of tasks.
 * @type {Array<Object>}
 */

/**
 * Initializes the application.
 * Loads HTML content, the current user, contacts, the board navigator, and tasks.
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
    loadBoardNavigator(); // Columns are loaded before loading tasks
    await fetchTasks("/tasks"); // Tasks are loaded after loading columns
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

/**
 * Loads contacts from the Firebase database and stores them in the `finalContacts` array.
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
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    if (responseToJson) {
      finalContacts = Object.values(responseToJson);
    }
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

/**
 * Loads the currently signed-in user from Local Storage.
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
      console.error("Error parsing stored user:", error);
    }
  }
}

/**
 * Loads tasks from the Firebase database, transforms them, and updates the HTML display.
 *
 * @async
 * @function fetchTasks
 * @param {string} [path="/tasks"] - The path to the Firebase database for tasks.
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
    console.error("Error loading tasks:", error);
  }
}

/**
 * Retrieves task data from the Firebase database based on the specified path.
 *
 * @async
 * @function fetchTaskData
 * @param {string} path - The path to the Firebase database for tasks.
 * @returns {Promise<Object|null>} The task data as a JSON object or `null` on error.
 */
async function fetchTaskData(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}.json`);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching tasks from ${path}:`, error);
    return null;
  }
}

/**
 * Transforms the task array from the Firebase response JSON into a usable format.
 *
 * @function transformTaskArray
 * @param {Object} responseToJson - The JSON object from Firebase containing tasks.
 * @returns {Array<Object>} The transformed task array.
 */
function transformTaskArray(responseToJson) {
  return Object.values(responseToJson).map((task) => transformTask(task));
}

/**
 * Transforms a single task by adjusting the owner information.
 *
 * @function transformTask
 * @param {Object} task - The task object from Firebase.
 * @returns {Object} The transformed task object.
 */
function transformTask(task) {
  if (task.owner) {
    task.owner = task.owner.map((owner) => transformOwner(owner));
  }
  return task;
}

/**
 * Transforms an owner by adding the color from the contact data.
 *
 * @function transformOwner
 * @param {Object} owner - The owner object with `firstName` and `lastName`.
 * @returns {Object} The transformed owner object with an additional `color` property.
 */
function transformOwner(owner) {
  const contact = finalContacts.find(
    (c) => c.firstName === owner.firstName && c.lastName === owner.lastName
  );
  return { ...owner, color: contact?.color || "gray" };
}

/**
 * Moves a task to another category and updates Firebase if not a guest user.
 *
 * @async
 * @function moveTo
 * @param {string} category - The target category (e.g., "inProgress", "done").
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
        console.error("Error moving task:", error);
      }
    }
  }
}

/**
 * Updates a task in Firebase.
 *
 * @async
 * @function updateTaskInFirebase
 * @param {Object} task - The task object to be updated.
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
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
  }
}

/**
 * Creates an HTML element for a "No Tasks" message and adds it to the specified column.
 *
 * @function createNoTasksDiv
 * @param {string} columnId - The ID of the column to which the message should be added.
 * @param {string} message - The message to be displayed.
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
    console.error(`Column with ID '${columnId}' not found.`);
  }
}

/**
 * Creates a "No To-Dos" div and adds it to the To-Do column.
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
    console.error("Column with ID 'todo' not found.");
  }
}

/**
 * Creates the circles for the owners of a task.
 *
 * @function createOwnerCircles
 * @param {Object} task - The task object with owner information.
 * @returns {void}
 */
function createOwnerCircles(task) {
  const userNameCircles = document.getElementById(`userNameCircles-${task.id}`);
  if (!userNameCircles) {
    console.error("Owner circles container not found!");
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
 * Determines and sets the CSS class of the task category.
 *
 * @function findClassOfTaskCat
 * @param {Object} task - The task object with category information.
 * @returns {void}
 */
function findClassOfTaskCat(task) {
  const taskButton = document.getElementById(`taskButton-${task.id}`);
  if (!taskButton) {
    console.error(`Task button for Task ID '${task.id}' not found.`);
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
 * Sets the priority icon for a task based on its priority.
 *
 * @function findPrioIcon
 * @param {Object} task - The task object with priority information.
 * @returns {void}
 */
function findPrioIcon(task) {
  const prioIcon = document.getElementById(`priority-${task.id}`);
  if (!prioIcon) {
    console.error(`Priority icon for Task ID '${task.id}' not found.`);
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
      // Fallback icon in case an unknown priority value is received
      prioIcon.src = "./img/placeholder-icon.png";
  }
}
