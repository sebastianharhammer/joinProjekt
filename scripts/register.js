/**
 * Initializes the application when the page loads.
 * Loads signed-in users and the registration form.
 *
 * @function onloadFunc
 * @returns {void}
 */
function onloadFunc() {
  loadUsers("signed_users");
  loadRegisterForm();
}

/**
 * The base URL of your Firebase database.
 * @constant {string}
 */
const BASE_URL =
  "https://eigenesjoin-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Array for storing signed-in users for login.
 * @type {string}
 *
 * **Note:** Originally declared as a string, this should be an array.
 * Recommended: `let signedUsersArray = [];`
 */
let signedUsersArray = "[]";

/**
 * Loads the registration form and inserts it into the corresponding container.
 *
 * @function loadRegisterForm
 * @returns {void}
 */
function loadRegisterForm() {
  const registerContent = document.getElementById("registerContent");
  if (!registerContent) {
    console.error("Element with ID 'registerContent' not found.");
    return;
  }
  registerContent.innerHTML = "";
  registerContent.innerHTML += getRegisterContent();
}

/**
 * Loads the signed-in users from the Firebase database.
 *
 * @async
 * @function loadUsers
 * @param {string} path - The path to the Firebase database for signed-in users.
 * @returns {Promise<void>}
 */
async function loadUsers(path) {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    if (responseToJson) {
      signedUsersArray = Object.values(responseToJson);
      // **Note:** Since signedUsersArray is originally a string, pushing to it may fail.
      // Recommended: Initialize signedUsersArray as an empty array (`let signedUsersArray = [];`)
    }
  } catch (error) {
    console.error("Error loading signed-in users:", error);
  }
}

/**
 * Sends the registration data to the Firebase database.
 *
 * @async
 * @function postSignUpData
 * @param {string} path - The path to the Firebase database for users.
 * @returns {Promise<void>}
 */
async function postSignUpData(path) {
  const userFirstName = document.getElementById("loginFirstName").value;
  const userLastName = document.getElementById("loginLastName").value;
  const userMail = document.getElementById("loginMail").value;
  const userPassword = document.getElementById("loginPassword").value;
  const userPasswordConfirmed = document.getElementById(
    "loginPasswordConfirm"
  ).value;
  const userId = await getNextUserId(path);
  const checkBox = document.getElementById("registerCheckbox");

  if (userPasswordConfirmed === userPassword && checkBox.checked) {
    const userData = {
      firstName: userFirstName,
      lastName: userLastName,
      email: userMail,
      password: userPassword,
      id: userId,
      isLoggedin: false,
    };

    try {
      const response = await fetch(`${BASE_URL}${path}/user${userId}.json`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const responseToJson = await response.json();
      signedUsersArray.push(responseToJson); // **Note:** If signedUsersArray is a string, this will not work.
      showSuccessOverlay();
      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      console.error("Error sending registration data:", error);
    }
  } else {
    console.log("Passwords do not match or checkbox is not checked.");
  }
}

/**
 * Displays a success message after successful registration.
 *
 * @function showSuccessOverlay
 * @returns {void}
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("overlaySignUpSuccess");
  if (!overlay) {
    console.error("Element with ID 'overlaySignUpSuccess' not found.");
    return;
  }
  overlay.classList.remove("d-none");
  overlay.classList.add("overlaySignUpSuccess-show");
  setTimeout(function () {
    overlay.classList.remove("overlaySignUpSuccess-show");
    overlay.classList.add("d-none");
  }, 900);
}

/**
 * Adds a user and redirects to the login page.
 *
 * @function addUser
 * @returns {void}
 */
function addUser() {
  const email = document.getElementById("loginMail");
  const password = document.getElementById("loginPassword");

  // **Note:** The variable `users` is not defined here. Ensure it is defined globally or declared earlier.
  users.push({ email: email.value, password: password.value });
  window.location.href = "login.html?msg=You have successfully registered";
}

/**
 * Compares the entered passwords and updates the UI accordingly.
 *
 * @function comparePasswords
 * @returns {void}
 */
function comparePasswords() {
  const paramToCompare = document.getElementById("loginPassword").value;
  const passwordConfirmValue = document.getElementById(
    "loginPasswordConfirm"
  ).value;
  const passWordBorder = document.getElementById("passWordBorder");

  if (!passWordBorder) {
    console.error("Element with ID 'passWordBorder' not found.");
    return;
  }

  passWordBorder.classList.remove("defaultBorderInputSignUp", "greenBorder");
  let foundPassword = false;

  if (paramToCompare === passwordConfirmValue) {
    foundPassword = true;
    passWordBorder.classList.add("greenBorder");
  } else {
    foundPassword = false;
    passWordBorder.classList.add("redBorder");
  }

  showResultsMessage(foundPassword);
  validate();
}

/**
 * Validates the registration form and enables/disables the sign-up button.
 *
 * @function validate
 * @returns {void}
 */
function validate() {
  const userFirstName = document.getElementById("loginFirstName").value;
  const userLastName = document.getElementById("loginLastName").value;
  const userMail = document.getElementById("loginMail").value;
  const userPassword = document.getElementById("loginPassword").value;
  const userPasswordConfirmed = document.getElementById(
    "loginPasswordConfirm"
  ).value;
  const checkBox = document.getElementById("registerCheckbox").checked;
  const signUpButton = document.getElementById("signUpButton");

  if (
    userFirstName &&
    userLastName &&
    userMail &&
    userPassword &&
    userPasswordConfirmed &&
    userPassword === userPasswordConfirmed &&
    checkBox
  ) {
    signUpButton.disabled = false;
  } else {
    signUpButton.disabled = true;
  }
}

/**
 * Displays a message indicating whether the passwords match.
 *
 * @function showResultsMessage
 * @param {boolean} foundPassword - Indicates whether the passwords match.
 * @returns {void}
 */
function showResultsMessage(foundPassword) {
  const alertDiv = document.getElementById("alert-password");
  if (!alertDiv) {
    console.error("Element with ID 'alert-password' not found.");
    return;
  }

  alertDiv.innerHTML = "";

  if (foundPassword) {
    alertDiv.innerHTML += /*html*/ `
      <p class="correctPasswordFont">Your password matches and is correct.</p>
      <p class="correctPasswordFontNotice">Accept the privacy policy to sign up.</p>
    `;
  } else {
    alertDiv.innerHTML += /*html*/ `
      <p class="alertPasswordFont">Your passwords don't match, please try again.</p>
    `;
  }
}

/**
 * Retrieves the next available user ID from the Firebase database.
 *
 * @async
 * @function getNextUserId
 * @param {string} path - The path to the Firebase database for users.
 * @returns {Promise<number>} The next available user ID.
 */
async function getNextUserId(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}.json`);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();
    let nextId = 1;

    if (data) {
      for (const key in data) {
        const userData = data[key];
        if (userData.id && !isNaN(userData.id)) {
          const idNumber = parseInt(userData.id, 10);
          if (idNumber >= nextId) {
            nextId = idNumber + 1;
          }
        }
      }
    }
    return nextId;
  } catch (error) {
    console.error("Error fetching the next user ID:", error);
    return 1; // Fallback ID
  }
}

/**
 * Validates the entered email address and displays appropriate messages.
 *
 * @function validateEmail
 * @returns {void}
 */
function validateEmail() {
  const emailField = document.getElementById("loginMail");
  const emailAlert = document.getElementById("emailAlert");

  if (!emailField || !emailAlert) {
    console.error("Email field or email alert element not found.");
    return;
  }

  const emailValue = emailField.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailAlert.innerHTML = "";

  if (emailValue === "") {
    emailAlert.innerHTML = `<p class="alertEmailFont">Email field cannot be empty.</p>`;
  } else if (!emailRegex.test(emailValue)) {
    emailAlert.innerHTML = `<p class="alertEmailFont">Please enter a valid email address.</p>`;
  }
}
