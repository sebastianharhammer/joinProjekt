/**
 * The base URL for adding tasks in Firebase.
 * @constant {string}
 */
const ADD_TASK_BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Indicates whether the categories container was clicked.
 * @type {boolean}
 */
let categoriesContainerClick = false;

/**
 * Array of contacts.
 * @type {Array<Object>}
 */
let contacts = [];

/**
 * The currently selected priority for a task.
 * @type {string}
 */
let selectedPriority = "medium";

/**
 * Array of subtasks.
 * @type {Array<Object>}
 */
let subtasksArr = [];

/**
 * Array of assigned users.
 * @type {Array<Object>}
 */
let assignedUserArr = [];

/**
 * Local array of tasks.
 * @type {Array<Object>}
 */
let localTasks = [];

/**
 * Counter for subtask IDs.
 * @type {number}
 */
let subtaskIdCounter = 0;

/**
 * Array of edited subtasks.
 * @type {Array<Object>}
 */
let subtasksEdit = [];

/**
 * Array of completed edited subtasks.
 * @type {Array<Object>}
 */
let subtasksEdit_done = [];

/**
 * Array of completed subtasks.
 * @type {Array<Object>}
 */
let subtasksArr_done = [];

/**
 * Category object.
 * @type {string}
 */
let categoryObject = "";

/**
 * Array of available categories for adding tasks.
 * @type {Array<Object>}
 */
let addTaskcategories = [
  { category: "User Story", "bg-color": "#0038FF" },
  { category: "Technical Task", "bg-color": "#1FD7C1" },
];

/**
 * Array of assigned users.
 * @type {Array<Object>}
 */
let assignedUser = [];

/**
 * The current status of the task.
 * @type {string}
 */
let localStatus = "";
