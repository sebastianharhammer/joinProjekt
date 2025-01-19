/**
 * Vorname des aktuellen Benutzers im Header.
 * @type {string}
 */
let headerFirstName = "";

/**
 * Nachname des aktuellen Benutzers im Header.
 * @type {string}
 */
let headerLastName = "";

/**
 * Statusindikatoren für die Navigation.
 * @type {number}
 */
let navSummary = 0;
let navAddTask = 0;
let navBoard = 0;
let navContacts = 0;
let navPolicy = 0;
let navLegalNotice = 0;

/**
 * Zeigt oder versteckt die Benutzeroptionen im Header.
 */
function showUserOptions() {
  let userOption = document.getElementById("header-user-overlay");
  userOption.classList.toggle("d-none");

  /**
   * Behandelt Klicks außerhalb des Benutzeroverlays, um es zu schließen.
   * @param {Event} event - Das auslösende Klick-Ereignis.
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
 * Wartet auf das Vorhandensein eines Elements im DOM und führt eine Callback-Funktion aus.
 * @param {string} selector - Der CSS-Selektor des Elements.
 * @param {Function} callback - Die Funktion, die ausgeführt werden soll, wenn das Element gefunden wird.
 * @param {number} [interval=100] - Das Intervall in Millisekunden, in dem nach dem Element gesucht wird.
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

// Wartet darauf, dass das Element mit der ID 'header-user-name' geladen ist, und führt dann die Funktion headerGetUser aus
waitForElement("#header-user-name", () => {
  headerGetUser();
});

/**
 * Lädt den aktuellen Benutzer aus dem Local Storage und aktualisiert die Header-Anzeige.
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
 * Aktualisiert die Anzeige des Benutzernamens im Header mit den Initialen.
 * @param {string} firstName - Der Vorname des Benutzers.
 * @param {string} lastName - Der Nachname des Benutzers.
 */
function headerDisplayName(firstName, lastName) {
  let headerFirstNameShort = firstName.trim().charAt(0).toUpperCase();
  let headerLastNameShort = lastName.trim().charAt(0).toUpperCase();
  let userId = document.getElementById("header-user-name");
  userId.style.fill = "#29ABE2";
  userId.innerHTML = `${headerFirstNameShort}${headerLastNameShort}`;
}

/**
 * Meldet den aktuellen Benutzer ab, indem die entsprechenden Einträge im Local Storage entfernt werden.
 */
function headerUserLogout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("activeNav");
}

/**
 * Entfernt den aktiven Navigationspunkt aus dem Local Storage.
 */
function removeActiveNav() {
  localStorage.removeItem("activeNav");
}

// NAV SCRIPT -- IST AUS EINFACHHEIT IN HEADER.JS DA DIE FUNKTIION SEHR SPÄT HINZUGEFÜGT WURDE UND ES NOCH KEINE NAV.JS GAB

/**
 * Setzt den aktiven Navigationslink basierend auf dem aktuellen Status.
 * @param {string} site - Der Name der aktuellen Seite (z.B. 'summary', 'addTask').
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
 * Setzt den aktiven Navigationslink beim Laden der Seite basierend auf dem Local Storage.
 */
function setLinkActive() {
  let localStorageGetItem = localStorage.getItem("activeNav");
  navLinksOnFocus(localStorageGetItem);
}
