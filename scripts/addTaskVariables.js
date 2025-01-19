/**
 * Indicates whether the categories container was clicked.
 * @type {boolean}
 */
let categoriesContainerClick = false;

/**
 * Array for storing contacts.
 * @type {Array}
 */
let contacts = [];

/**
 * The currently selected priority.
 * @type {string}
 */
let selectedPriority = "medium";

/**
 * Array for storing subtasks.
 * @type {Array}
 */
let subtasksArr = [];

/**
 * Array for storing assigned users.
 * @type {Array}
 */
let assignedUserArr = [];

/**
 * Local storage of tasks.
 * @type {Array}
 */
let localTasks = [];

/**
 * Counter for subtask IDs.
 * @type {number}
 */
let subtaskIdCounter = 0;

/**
 * Arrays for editing subtasks.
 * @type {Array}
 */
let subtasksEdit = [];
let subtasksEdit_done = [];
let subtasksArr_done = [];

/**
 * Current category object.
 * @type {string}
 */
let categoryObject = "";

/**
 * List of addable task categories with background colors.
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
 * Array for storing assigned users.
 * @type {Array}
 */
let assignedUser = [];
