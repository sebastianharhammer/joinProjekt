/**
 * Array for storing signed-in users for login.
 * @type {string}
 *
 * **Note:** Originally declared as a string, this should be an array.
 * Recommended: `let signedUsersArray = [];`
 */
let signedUsersArrayLogin = "[]";

/**
 * The currently logged-in user.
 * @type {Object|null}
 */
let currentUser = null;

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
 * Displays the start animation of the logo and the header logo.
 *
 * @function showStartSlide
 * @returns {void}
 */
function showStartSlide() {
  const logo = document.getElementById("logo");
  const headerLogo = document.querySelector(".v-hidden");
  if (!logo || !headerLogo) {
    console.error("Logo or header logo element not found.");
    return;
  }

  setTimeout(() => {
    logo.classList.add("animate");
  }, 700);
  logo.classList.remove("d-none");

  setTimeout(() => {
    headerLogo.style.transition = "none";
    headerLogo.offsetHeight; // Trigger reflow
    headerLogo.style.transition = "opacity 2.5s ease-in-out";
    headerLogo.classList.remove("v-hidden");
    headerLogo.classList.add("fade-in");
  }, 1200);
}

/**
 * Loads the remembered user from Local Storage and fills in the login fields.
 *
 * @function loadRememberedUser
 * @returns {void}
 */
function loadRememberedUser() {
  const rememberedUser = localStorage.getItem("rememberedUser");
  if (rememberedUser) {
    try {
      const userData = JSON.parse(rememberedUser);
      const emailInput = document.getElementById("loginMailUser");
      const passwordInput = document.getElementById("loginPasswordUser");
      const checkbox = document.getElementById("checkboxLogin");

      if (emailInput && passwordInput && checkbox) {
        emailInput.value = userData.email;
        passwordInput.value = userData.password;
        checkbox.checked = true;
      } else {
        console.error("One of the login form elements was not found.");
      }
    } catch (error) {
      console.error("Error parsing the remembered user:", error);
    }
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
async function loginUser(event) {
  event.preventDefault();
  const userMail = document.getElementById("loginMailUser")?.value;
  const userPassword = document.getElementById("loginPasswordUser")?.value;
  const rememberMe = document.getElementById("checkboxLogin")?.checked;

  if (!userMail || !userPassword) {
    showDomOfFailedLogin();
    return;
  }

  let signedUser;
  try {
    signedUser = JSON.parse(signedUsersArrayLogin).find(
      (u) => u.email === userMail && u.password === userPassword
    );
  } catch (error) {
    console.error("Error parsing signedUsersArrayLogin:", error);
    showDomOfFailedLogin();
    return;
  }

  if (signedUser) {
    try {
      await changeLoginStatus(signedUser);
      localStorage.setItem("currentUser", JSON.stringify(signedUser));
      currentUser = signedUser;
      if (rememberMe) {
        saveData(signedUser);
      }
      forwardToSummary(signedUser);
    } catch (error) {
      console.error("Error changing login status:", error);
    }
  } else {
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
  const failedLoginDiv = document.getElementById("failedLoginDiv");
  const changeBorders = document.getElementsByClassName("loginNameInput");

  if (failedLoginDiv) {
    failedLoginDiv.classList.remove("d-none");
  } else {
    console.error("Element with ID 'failedLoginDiv' not found.");
  }

  for (let i = 0; i < changeBorders.length; i++) {
    changeBorders[i].style.border = "1px solid red";
  }

  setTimeout(function () {
    if (failedLoginDiv) {
      failedLoginDiv.classList.add("d-none");
    }
    for (let i = 0; i < changeBorders.length; i++) {
      changeBorders[i].style.border = "1px solid rgb(168, 168, 168)";
    }
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
