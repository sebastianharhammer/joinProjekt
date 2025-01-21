/**
 * Array for storing signed-in users for login.
 * @type {string}
 *
 * **Note:** Originally declared as a string, this should be an array.
 * Recommended: `let signedUsersArray = [];`
 */
let signedUsersArrayLogin = "[]";

/**
 * Initializes the application.
 * Loads the login content, displays the start animation, loads signed-in users, and loads the remembered user.
 *
 * @function init
 * @returns {void}
 */
function init() {
  loadLoginContent();
  showStartSlide();
  loadSignedUsers("/signed_users");
  loadRememberedUser();
}

/**
 * URLSearchParams object for retrieving URL parameters.
 * @type {URLSearchParams}
 */
let urlParams = new URLSearchParams(window.location.search);
/**
 * Message from the URL parameters.
 * @type {string|null}
 */
const msg = urlParams.get("msg");

/**
 * Element for displaying messages.
 * @type {HTMLElement|null}
 */
const msgBox = document.getElementById("msgBox");

if (msg && msgBox) {
  msgBox.innerHTML = msg;
}

/**
 * Loads the login content into the corresponding container.
 *
 * @function loadLoginContent
 * @returns {void}
 */
function loadLoginContent() {
  const loginContent = document.getElementById("wholeLoginContent");
  if (!loginContent) {
    console.error("Element with ID 'wholeLoginContent' not found.");
    return;
  }
  loginContent.innerHTML = "";
  loginContent.innerHTML += getLoginTemplate();
}

/**
 * Überprüft, ob die notwendigen Elemente vorhanden sind.
 *
 * @function checkElementsExist
 * @param {HTMLElement} logoElement - Das Logo-Element.
 * @param {HTMLElement} headerLogo - Das Header-Logo-Element.
 * @returns {boolean} - Gibt `true` zurück, wenn beide Elemente vorhanden sind, andernfalls `false`.
 */
function checkElementsExist(logoElement, headerLogo) {
  if (!logoElement || !headerLogo) {
    console.error("Logo oder Header-Logo nicht gefunden.");
    return false;
  }
  return true;
}

/**
 * Zeigt die Startanimation der Logos an.
 *
 * @function showStartSlide
 * @returns {void}
 */
function showStartSlide() {
  const logoElement = document.getElementById("logo");
  const headerLogo = document.querySelector(".v-hidden");
  if (!checkElementsExist(logoElement, headerLogo)) return;
  setTimeout(() => logoElement.classList.add("animate"), 700);
  logoElement.classList.remove("d-none");
  setTimeout(() => {
    headerLogo.style.transition = "none";
    void headerLogo.offsetHeight;
    headerLogo.style.transition = "opacity 2.5s ease-in-out";
    headerLogo.classList.remove("v-hidden");
    headerLogo.classList.add("fade-in");
  }, 1200);
}


/**
 * Überprüft, ob die notwendigen Formularelemente vorhanden sind.
 *
 * @function checkFormElementsExist
 * @param {HTMLElement} emailElement - Das Eingabefeld für die E-Mail.
 * @param {HTMLElement} passwordElement - Das Eingabefeld für das Passwort.
 * @param {HTMLElement} checkboxElement - Das Kontrollkästchen für "Remember Me".
 * @returns {boolean} - Gibt `true` zurück, wenn alle Elemente vorhanden sind, andernfalls `false`.
 */
function checkFormElementsExist(emailElement, passwordElement, checkboxElement) {
  if (!emailElement || !passwordElement || !checkboxElement) {
    console.error("Ein oder mehrere Formularelemente fehlen.");
    return false;
  }
  return true;
}

/**
 * Lädt den gespeicherten Benutzer aus dem Local Storage und füllt die Login-Felder aus.
 *
 * @function loadRememberedUser
 * @returns {void}
 */
function loadRememberedUser() {
  const data = localStorage.getItem("rememberedUser");
  if (!data) return;
  try {
    const { email, password } = JSON.parse(data);
    const emailElement = document.getElementById("loginMailUser");
    const passwordElement = document.getElementById("loginPasswordUser");
    const checkboxElement = document.getElementById("checkboxLogin");
    if (!checkFormElementsExist(emailElement, passwordElement, checkboxElement)) return;
    emailElement.value = email;
    passwordElement.value = password;
    checkboxElement.checked = true;
  } catch (err) {
    console.error("Fehler beim Parsen des gespeicherten Benutzers:", err);
  }
}


/**
 * Loads the signed-in users from the Firebase database.
 *
 * @async
 * @function loadSignedUsers
 * @param {string} path - The path to the Firebase database for signed-in users.
 * @returns {Promise<void>}
 */
async function loadSignedUsers(path) {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    if (responseToJson) {
      signedUsersArrayLogin = JSON.stringify(Object.values(responseToJson));
    }
  } catch (error) {
    console.error("Error loading signed-in users:", error);
  }
}

/**
 * Logs in a guest user.
 *
 * @function loginGuest
 * @param {Event} event - The triggering event.
 * @returns {void}
 */
function loginGuest(event) {
  event.preventDefault();
  const guestUser = {
    firstName: "Guest",
    lastName: "User",
  };
  localStorage.setItem("currentUser", JSON.stringify(guestUser));
  currentUser = guestUser;
  window.location.href = "summary.html";
}

/**
 * Logs in a user based on the entered email and password.
 *
 * @async
 * @function loginUser
 * @param {Event} event - The triggering event.
 * @returns {Promise<void>}
 */
async function loginUser(e) {
  e.preventDefault();
  const m = document.getElementById("loginMailUser")?.value,
    p = document.getElementById("loginPasswordUser")?.value,
    r = document.getElementById("checkboxLogin")?.checked;
  if (!m || !p) return showDomOfFailedLogin();
  try {
    const u = JSON.parse(signedUsersArrayLogin).find(
      (x) => x.email === m && x.password === p
    );
    if (!u) return showDomOfFailedLogin();
    await changeLoginStatus(u);
    localStorage.setItem("currentUser", JSON.stringify(u));
    currentUser = u;
    if (r) saveData(u);
    forwardToSummary(u);
  } catch (err) {
    console.error("Error:", err);
    showDomOfFailedLogin();
  }
}

/**
 * Redirects the user to the summary page.
 *
 * @function forwardToSummary
 * @param {Object} user - The user object.
 * @returns {void}
 */
function forwardToSummary(user) {
  const url = `summary.html?firstName=${encodeURIComponent(
    user.firstName
  )}&lastName=${encodeURIComponent(user.lastName)}`;
  window.location.href = url;
}

/**
 * Changes the login status of a user in the Firebase database.
 *
 * @async
 * @function changeLoginStatus
 * @param {Object} signedUser - The signed-in user object.
 * @returns {Promise<void>}
 */
async function changeLoginStatus(signedUser) {
  try {
    const userPath = `/signed_users/user${signedUser.id}`;
    const response = await fetch(BASE_URL + userPath + ".json", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isLoggedin: true }),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error changing login status:", error);
  }
}

/**
 * Saves the user's email and password to Local Storage.
 *
 * @function saveData
 * @param {Object} user - The user object.
 * @returns {void}
 */
function saveData(user) {
  if (!user.email || !user.password) {
    console.error("User object does not contain email or password.");
    return;
  }

  localStorage.setItem(
    "rememberedUser",
    JSON.stringify({
      email: user.email,
      password: user.password,
    })
  );
}

/**
 * Displays DOM elements for a failed login and resets the input fields.
 *
 * @function showDomOfFailedLogin
 * @returns {void}
 */
function showDomOfFailedLogin() {
  const d = document.getElementById("failedLoginDiv"),
    c = document.getElementsByClassName("loginNameInput");
  d
    ? d.classList.remove("d-none")
    : console.error("Element with ID 'failedLoginDiv' not found.");
  for (let el of c) el.style.border = "1px solid red";
  setTimeout(() => {
    if (d) d.classList.add("d-none");
    for (let el of c) el.style.border = "1px solid rgb(168, 168, 168)";
  }, 2000);
}

/**
 * Validates the registration form.
 * (This function is currently empty and should be implemented accordingly.)
 *
 * @function validateSignUpForm
 * @returns {void}
 */
function validateSignUpForm() {
  // Implement the registration form validation here.
}
