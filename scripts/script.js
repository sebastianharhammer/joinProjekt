/**
 * Basis-URL für Firebase-Datenbankoperationen.
 * @constant {string}
 */
const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

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
 * Holt die Namen der Besitzer einer Aufgabe.
 * Falls keine Besitzer angegeben sind, wird "Max Mustermann" zurückgegeben.
 *
 * @param {Object} task - Das Aufgabenobjekt.
 * @param {Array<Object>} [task.owner] - Array der Besitzer des Aufgabenobjekts. Jeder Besitzer sollte die Eigenschaften `firstName` und `lastName` haben.
 * @returns {string} Ein zusammengefügter String der Besitzer-Namen oder "Max Mustermann" wenn keine Besitzer vorhanden sind.
 *
 * @example
 * const task = {
 *   owner: [
 *     { firstName: "John", lastName: "Doe" },
 *     { firstName: "Jane", lastName: "Smith" }
 *   ]
 * };
 * console.log(getOwners(task)); // Ausgabe: "John Doe Jane Smith"
 *
 * const taskWithoutOwners = {};
 * console.log(getOwners(taskWithoutOwners)); // Ausgabe: "Max Mustermann"
 */
function getOwners(task) {
  let owners = [];
  if (!task.owner || task.owner.length === 0) {
    owners.push("Max Mustermann");
  } else {
    for (let i = 0; i < task.owner.length; i++) {
      let owner = task.owner[i];
      owners.push(`${owner.firstName} ${owner.lastName}`);
    }
  }

  return owners.join(" ");
}
