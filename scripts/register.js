/**
 * Initialisiert die Anwendung beim Laden der Seite.
 * Lädt die angemeldeten Benutzer und das Registrierungsformular.
 *
 * @function onloadFunc
 * @returns {void}
 */
function onloadFunc() {
  loadUsers("signed_users");
  loadRegisterForm();
}

/**
 * Die Basis-URL deiner Firebase-Datenbank.
 * @constant {string}
 */
const BASE_URL =
  "https://join-c80fa-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Array der angemeldeten Benutzer für das Login.
 * @type {string}
 *
 * **Hinweis:** Ursprünglich als String deklariert, sollte dies ein Array sein.
 * Empfohlen: `let signedUsersArray = [];`
 */
let signedUsersArray = "[]";

/**
 * Lädt das Registrierungsformular und fügt es in den entsprechenden Container ein.
 *
 * @function loadRegisterForm
 * @returns {void}
 */
function loadRegisterForm() {
  const registerContent = document.getElementById("registerContent");
  if (!registerContent) {
    console.error("Element mit ID 'registerContent' nicht gefunden.");
    return;
  }
  registerContent.innerHTML = "";
  registerContent.innerHTML += getRegisterContent();
}

/**
 * Lädt die angemeldeten Benutzer von der Firebase-Datenbank.
 *
 * @async
 * @function loadUsers
 * @param {string} path - Der Pfad zur Firebase-Datenbank für angemeldete Benutzer.
 * @returns {Promise<void>}
 */
async function loadUsers(path) {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    if (responseToJson) {
      signedUsersArray = Object.values(responseToJson);
      // **Hinweis:** Da signedUsersArray ursprünglich ein String ist, kann das Pushen fehlschlagen.
      // Empfohlen: Initialisiere signedUsersArray als leeres Array (`let signedUsersArray = [];`)
    }
  } catch (error) {
    console.error("Fehler beim Laden der angemeldeten Benutzer:", error);
  }
}

/**
 * Sendet die Registrierungsdaten an die Firebase-Datenbank.
 *
 * @async
 * @function postSignUpData
 * @param {string} path - Der Pfad zur Firebase-Datenbank für Benutzer.
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
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }

      const responseToJson = await response.json();
      signedUsersArray.push(responseToJson); // **Hinweis:** Falls signedUsersArray ein String ist, funktioniert das nicht.
      showSuccessOverlay();
      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      console.error("Fehler beim Senden der Registrierungsdaten:", error);
    }
  } else {
    console.log(
      "Passwörter stimmen nicht überein oder Checkbox nicht aktiviert."
    );
  }
}

/**
 * Zeigt eine Erfolgsmeldung nach erfolgreicher Registrierung an.
 *
 * @function showSuccessOverlay
 * @returns {void}
 */
function showSuccessOverlay() {
  const overlay = document.getElementById("overlaySignUpSuccess");
  if (!overlay) {
    console.error("Element mit ID 'overlaySignUpSuccess' nicht gefunden.");
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
 * Fügt einen Benutzer hinzu und leitet zur Login-Seite weiter.
 *
 * @function addUser
 * @returns {void}
 */
function addUser() {
  const email = document.getElementById("loginMail");
  const password = document.getElementById("loginPassword");

  // **Hinweis:** Die Variable `users` ist hier nicht definiert. Stelle sicher, dass sie global oder vorher deklariert ist.
  users.push({ email: email.value, password: password.value });
  window.location.href = "login.html?msg=Du hast dich erfolgreich registriert";
}

/**
 * Vergleicht die eingegebenen Passwörter und aktualisiert die UI entsprechend.
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
    console.error("Element mit ID 'passWordBorder' nicht gefunden.");
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
 * Validiert das Registrierungsformular und aktiviert/deaktiviert den Registrierungsbutton.
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
 * Zeigt eine Nachricht an, ob die Passwörter übereinstimmen.
 *
 * @function showResultsMessage
 * @param {boolean} foundPassword - Gibt an, ob die Passwörter übereinstimmen.
 * @returns {void}
 */
function showResultsMessage(foundPassword) {
  const alertDiv = document.getElementById("alert-password");
  if (!alertDiv) {
    console.error("Element mit ID 'alert-password' nicht gefunden.");
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
      <p class="alertPasswordFont">Your passwords don't match, please try again</p>
    `;
  }
}

/**
 * Holt die nächste verfügbare Benutzer-ID aus der Firebase-Datenbank.
 *
 * @async
 * @function getNextUserId
 * @param {string} path - Der Pfad zur Firebase-Datenbank für Benutzer.
 * @returns {Promise<number>} Die nächste verfügbare Benutzer-ID.
 */
async function getNextUserId(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}.json`);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
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
    console.error("Fehler beim Abrufen der nächsten Benutzer-ID:", error);
    return 1; // Fallback-ID
  }
}

/**
 * Validiert die eingegebene E-Mail-Adresse und zeigt entsprechende Nachrichten an.
 *
 * @function validateEmail
 * @returns {void}
 */
function validateEmail() {
  const emailField = document.getElementById("loginMail");
  const emailAlert = document.getElementById("emailAlert");

  if (!emailField || !emailAlert) {
    console.error("E-Mail-Feld oder E-Mail-Alert-Element nicht gefunden.");
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
