/**
 * Array der angemeldeten Benutzer für den Login.
 * @type {string}
 */
let signedUsersArrayLogin = "[]";

/**
 * Der aktuell angemeldete Benutzer.
 * @type {Object|null}
 */
let currentUser = null;

/**
 * Initialisiert die Anwendung.
 * Lädt die Login-Inhalte, zeigt die Startanimation, lädt die angemeldeten Benutzer und lädt den erinnerten Benutzer.
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
 * URLSearchParams-Objekt zum Abrufen von URL-Parametern.
 * @type {URLSearchParams}
 */
let urlParams = new URLSearchParams(window.location.search);

/**
 * Nachricht aus den URL-Parametern.
 * @type {string|null}
 */
const msg = urlParams.get("msg");

/**
 * Element zur Anzeige von Nachrichten.
 * @type {HTMLElement|null}
 */
const msgBox = document.getElementById("msgBox");

if (msg && msgBox) {
  msgBox.innerHTML = msg;
}

/**
 * Lädt den Login-Inhalt in den entsprechenden Container.
 *
 * @function loadLoginContent
 * @returns {void}
 */
function loadLoginContent() {
  const loginContent = document.getElementById("wholeLoginContent");
  if (!loginContent) {
    console.error("Element mit ID 'wholeLoginContent' nicht gefunden.");
    return;
  }
  loginContent.innerHTML = "";
  loginContent.innerHTML += getLoginTemplate();
}

/**
 * Zeigt die Startanimation des Logos und des Header-Logos.
 *
 * @function showStartSlide
 * @returns {void}
 */
function showStartSlide() {
  const logo = document.getElementById("logo");
  const headerLogo = document.querySelector(".v-hidden");
  if (!logo || !headerLogo) {
    console.error("Logo oder Header-Logo-Element nicht gefunden.");
    return;
  }

  setTimeout(() => {
    logo.classList.add("animate");
  }, 700);
  logo.classList.remove("d-none");

  setTimeout(() => {
    headerLogo.style.transition = "none";
    headerLogo.offsetHeight; // Reflow auslösen
    headerLogo.style.transition = "opacity 2.5s ease-in-out";
    headerLogo.classList.remove("v-hidden");
    headerLogo.classList.add("fade-in");
  }, 1200);
}

/**
 * Lädt den erinnerten Benutzer aus dem Local Storage und füllt die Login-Felder aus.
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
        console.error(
          "Eines der Login-Formular-Elemente wurde nicht gefunden."
        );
      }
    } catch (error) {
      console.error("Fehler beim Parsen des erinnerten Benutzers:", error);
    }
  }
}

/**
 * Lädt die angemeldeten Benutzer von der Firebase-Datenbank.
 *
 * @async
 * @function loadSignedUsers
 * @param {string} path - Der Pfad zur Firebase-Datenbank für angemeldete Benutzer.
 * @returns {Promise<void>}
 */
async function loadSignedUsers(path) {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    if (responseToJson) {
      signedUsersArrayLogin = JSON.stringify(Object.values(responseToJson));
    }
  } catch (error) {
    console.error("Fehler beim Laden der angemeldeten Benutzer:", error);
  }
}

/**
 * Meldet einen Gastbenutzer an.
 *
 * @function loginGuest
 * @param {Event} event - Das auslösende Ereignis.
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
 * Meldet einen Benutzer an, basierend auf den eingegebenen E-Mail und Passwort.
 *
 * @async
 * @function loginUser
 * @param {Event} event - Das auslösende Ereignis.
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
    console.error("Fehler beim Parsen von signedUsersArrayLogin:", error);
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
      console.error("Fehler beim Ändern des Login-Status:", error);
    }
  } else {
    showDomOfFailedLogin();
  }
}

/**
 * Leitet den Benutzer zur Zusammenfassungsseite weiter.
 *
 * @function forwardToSummary
 * @param {Object} user - Das Benutzerobjekt.
 * @returns {void}
 */
function forwardToSummary(user) {
  const url = `summary.html?firstName=${encodeURIComponent(
    user.firstName
  )}&lastName=${encodeURIComponent(user.lastName)}`;
  window.location.href = url;
}

/**
 * Ändert den Login-Status eines Benutzers in der Firebase-Datenbank.
 *
 * @async
 * @function changeLoginStatus
 * @param {Object} signedUser - Das angemeldete Benutzerobjekt.
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
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Fehler beim Ändern des Login-Status:", error);
  }
}

/**
 * Speichert die E-Mail und das Passwort des Benutzers im Local Storage.
 *
 * @function saveData
 * @param {Object} user - Das Benutzerobjekt.
 * @returns {void}
 */
function saveData(user) {
  if (!user.email || !user.password) {
    console.error("Benutzerobjekt enthält keine E-Mail oder kein Passwort.");
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
 * Zeigt die DOM-Elemente für einen fehlgeschlagenen Login an und setzt die Eingabefelder zurück.
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
    console.error("Element mit ID 'failedLoginDiv' nicht gefunden.");
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
 * Validiert das Registrierungsformular.
 * (Diese Funktion ist momentan leer und sollte entsprechend implementiert werden.)
 *
 * @function validateSignUpForm
 * @returns {void}
 */
function validateSignUpForm() {
  // Implementiere die Validierung des Registrierungsformulars hier.
}
