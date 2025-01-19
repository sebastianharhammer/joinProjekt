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
