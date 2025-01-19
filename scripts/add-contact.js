/**
 * Lädt den aktuell angemeldeten Benutzer aus dem Local Storage.
 */
function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

/**
 * Überprüft, ob der aktuelle Benutzer ein Gastbenutzer ist.
 * @returns {boolean} Gibt true zurück, wenn der Benutzer ein Gast ist, sonst false.
 */
function isGuestUser() {
  return (
    currentUser &&
    currentUser.firstName === "Guest" &&
    currentUser.lastName === "User"
  );
}

// Lädt den aktuellen Benutzer, sobald das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", loadCurrentUser);

/**
 * Zeigt das Formular zum Hinzufügen eines neuen Kontakts an.
 */
function addContact() {
  const addContactTemplate = document.getElementById("add-contact-content");
  const background = document.getElementById("add-contact-background");

  if (addContactTemplate && background) {
    addContactTemplate.classList.add("show-add-contact");
    background.classList.remove("d-none");
    addContactTemplate.innerHTML = getAddContactHTML();
  }
}

/**
 * Verbirgt das Formular zum Hinzufügen eines neuen Kontakts und lädt die Kontaktinformationen.
 */
function hideAddContact() {
  const addContactTemplate = document.getElementById("add-contact-content");
  const background = document.getElementById("add-contact-background");

  if (addContactTemplate && background) {
    addContactTemplate.classList.remove("show-add-contact");
    background.classList.add("d-none");
    getContactInfo();
  }
}

/**
 * Verarbeitet die Informationen eines neuen Kontakts und speichert ihn.
 */
async function processContactInfo() {
  const { firstName, lastName } = extractNameParts();
  const email = document.getElementById("add-contact-email").value.trim();
  const phone = document.getElementById("add-contact-phone").value.trim();

  await pushContactInfo(firstName, lastName, email, phone);
  hideAddContact();
  setTimeout(() => showSuccessMessage(), 300);
}

/**
 * Zeigt eine Erfolgsmeldung an, nachdem ein Kontakt erfolgreich erstellt wurde.
 */
function showSuccessMessage() {
  const message = document.createElement("div");
  message.id = "success-message-container";
  message.innerHTML = "Kontakt erfolgreich erstellt!";
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add("show");
  }, 10);

  setTimeout(() => {
    message.classList.remove("show");
    setTimeout(() => message.remove(), 500);
  }, 2500);
}

/**
 * Leert die Eingabefelder im Kontaktformular.
 */
function clearAddContactInput() {
  const nameInput = document.getElementById("add-contact-name");
  const emailInput = document.getElementById("add-contact-email");
  const phoneInput = document.getElementById("add-contact-phone");

  if (nameInput && emailInput && phoneInput) {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
  }
}

/**
 * Extrahiert den Vor- und Nachnamen aus dem Eingabefeld.
 * @returns {Object} Ein Objekt mit den Feldern firstName und lastName.
 */
function extractNameParts() {
  const input = document.getElementById("add-contact-name").value.trim();
  const nameParts = input.split(" ");
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
  };
}

/**
 * Holt die Kontaktinformationen von der Server-API und speichert sie lokal.
 */
async function getContactInfo() {
  try {
    const response = await fetch(`${BASE_URL}/contacts/.json`);
    localContacts = (await response.json()) || {};
  } catch {
    console.error("Failed to fetch contacts.");
  }
}

/**
 * Fügt einen neuen Kontakt zur Datenbank hinzu.
 * @param {string} firstName - Der Vorname des Kontakts.
 * @param {string} lastName - Der Nachname des Kontakts.
 * @param {string} email - Die E-Mail-Adresse des Kontakts.
 * @param {string} phone - Die Telefonnummer des Kontakts.
 */
async function pushContactInfo(firstName, lastName, email, phone) {
  const newContact = {
    firstName,
    lastName,
    email,
    phone,
    color: getRandomColor(),
  };

  if (isGuestUser()) {
    const pseudoKey = `guest-${Date.now()}`;
    if (contactsData) {
      contactsData.push({ firebaseKey: pseudoKey, ...newContact });
      if (typeof renderSortedContacts === "function")
        renderSortedContacts(contactsData);
      if (typeof renderRightSideContainer === "function")
        renderRightSideContainer();
    }
    return;
  }

  try {
    await fetch(`${BASE_URL}/contacts.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });
    if (typeof fetchContactsFromFirebase === "function")
      fetchContactsFromFirebase();
  } catch {
    console.error("Failed to add contact.");
  }
}

/**
 * Generiert eine zufällige Farbe aus einer vordefinierten Liste.
 * @returns {string} Eine zufällig ausgewählte Farbe im Hex-Format.
 */
function getRandomColor() {
  const colors = [
    "#FF5733",
    "#33A1FF",
    "#33FF99",
    "#FF33A8",
    "#FFC300",
    "#8C33FF",
    "#FF6F61",
    "#33FFC6",
    "#FF9F1C",
    "#5CDB95",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Handhabt die Erstellung eines neuen Kontakts, indem die Eingaben validiert und verarbeitet werden.
 */
function handleContactCreation() {
  const isValid = validateInputs();
  if (isValid) {
    processContactInfo();
  }
}

/**
 * Validiert die Eingabefelder des Kontaktformulars.
 * @returns {boolean} Gibt true zurück, wenn alle Eingaben gültig sind, sonst false.
 */
function validateInputs() {
  const nameInput = document.getElementById("add-contact-name");
  const emailInput = document.getElementById("add-contact-email");
  const phoneInput = document.getElementById("add-contact-phone");
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const phoneError = document.getElementById("phone-error");

  let isValid = true;

  if (!nameInput.value.trim()) {
    nameError.style.display = "block";
    isValid = false;
  } else {
    nameError.style.display = "none";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
    emailError.style.display = "block";
    isValid = false;
  } else {
    emailError.style.display = "none";
  }

  const phoneRegex = /^[0-9+ ]*$/;
  if (!phoneInput.value.trim() || !phoneRegex.test(phoneInput.value)) {
    phoneError.style.display = "block";
    isValid = false;
  } else {
    phoneError.style.display = "none";
  }

  return isValid;
}
