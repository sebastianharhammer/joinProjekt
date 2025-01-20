/**
 * Base URL for Firebase database operations.
 * @constant {string}
 */
const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

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
 * Retrieves the names of the owners of a task.
 * If no owners are specified, "Max Mustermann" is returned.
 *
 * @param {Object} task - The task object.
 * @param {Array<Object>} [task.owner] - Array of owners of the task object. Each owner should have the properties `firstName` and `lastName`.
 * @returns {string} A concatenated string of owner names or "Max Mustermann" if no owners are present.
 *
 * @example
 * const task = {
 *   owner: [
 *     { firstName: "John", lastName: "Doe" },
 *     { firstName: "Jane", lastName: "Smith" }
 *   ]
 * };
 * console.log(getOwners(task)); // Output: "John Doe Jane Smith"
 *
 * const taskWithoutOwners = {};
 * console.log(getOwners(taskWithoutOwners)); // Output: "Max Mustermann"
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
