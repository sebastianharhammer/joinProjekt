/**
 * First name of the current user in the header.
 * @type {string}
 */
let headerFirstName = "";

/**
 * Last name of the current user in the header.
 * @type {string}
 */
let headerLastName = "";

/**
 * Status indicators for navigation.
 * @type {number}
 */
let navSummary = 0;
let navAddTask = 0;
let navBoard = 0;
let navContacts = 0;
let navPolicy = 0;
let navLegalNotice = 0;

/**
 * Shows or hides the user options in the header.
 */
function showUserOptions() {
  let userOption = document.getElementById("header-user-overlay");
  userOption.classList.toggle("d-none");

  /**
   * Handles clicks outside the user overlay to close it.
   * @param {Event} event - The triggering click event.
   */
  const handleOutsideClick = (event) => {
    const overlay = document.getElementById("header-user-overlay");
    const headerUser = document.querySelector(".header-user-icon");
    if (
      !overlay.classList.contains("d-none") &&
      !overlay.contains(event.target) &&
      !headerUser.contains(event.target)
    ) {
      overlay.classList.add("d-none");
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

/**
 * Waits for an element to exist in the DOM and executes a callback function.
 * @param {string} selector - The CSS selector of the element.
 * @param {Function} callback - The function to execute once the element is found.
 * @param {number} [interval=100] - The interval in milliseconds to check for the element.
 */
function waitForElement(selector, callback, interval = 100) {
  const checkExist = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(checkExist);
      callback();
    }
  }, interval);
}

// Waits for the element with ID 'header-user-name' to load and then executes the headerGetUser function
waitForElement("#header-user-name", () => {
  headerGetUser();
});

/**
 * Loads the current user from Local Storage and updates the header display.
 */
function headerGetUser() {
  let object = localStorage.getItem("currentUser");
  if (object) {
    let objectToJson = JSON.parse(object);
    headerFirstName = objectToJson.firstName;
    headerLastName = objectToJson.lastName;
    headerDisplayName(headerFirstName, headerLastName);
  }
}

/**
 * Updates the display of the user's name in the header with initials.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 */
function headerDisplayName(firstName, lastName) {
  let headerFirstNameShort = firstName.trim().charAt(0).toUpperCase();
  let headerLastNameShort = lastName.trim().charAt(0).toUpperCase();
  let userId = document.getElementById("header-user-name");
  userId.style.fill = "#29ABE2";
  userId.innerHTML = `${headerFirstNameShort}${headerLastNameShort}`;
}

/**
 * Logs out the current user by removing the corresponding entries from Local Storage.
 */
function headerUserLogout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("activeNav");
}

/**
 * Removes the active navigation point from Local Storage.
 */
function removeActiveNav() {
  localStorage.removeItem("activeNav");
}

// NAV SCRIPT -- IS IN HEADER.JS FOR SIMPLICITY AS THE FUNCTION WAS ADDED LATE AND THERE WAS NO NAV.JS YET

/**
 * Sets the active navigation link based on the current status.
 * @param {string} site - The name of the current page (e.g., 'summary', 'addTask').
 */
function navLinksOnFocus(site) {
  let summary = document.getElementById("nav-summary");
  let addTask = document.getElementById("nav-add-task");
  let board = document.getElementById("nav-board");
  let contacts = document.getElementById("nav-contacts");
  let policy = document.getElementById("nav-privacy-policy");
  let legalNotice = document.getElementById("nav-legal-notice");

  localStorage.setItem("activeNav", site);

  let localStorageGetItem = localStorage.getItem("activeNav");

  if (localStorageGetItem === "summary") {
    summary.classList.add("link-active");
  }
  if (localStorageGetItem === "addTask") {
    addTask.classList.add("link-active");
  }
  if (localStorageGetItem === "board") {
    board.classList.add("link-active");
  }
  if (localStorageGetItem === "contacts") {
    contacts.classList.add("link-active");
  }
  if (localStorageGetItem === "policy") {
    policy.classList.add("link-active");
  }
  if (localStorageGetItem === "legalNotice") {
    legalNotice.classList.add("link-active");
  }
}

/**
 * Sets the active navigation link on page load based on Local Storage.
 */
function setLinkActive() {
  let localStorageGetItem = localStorage.getItem("activeNav");
  navLinksOnFocus(localStorageGetItem);
}
