/**
 * Initialisiert die Anwendung, indem Aufgaben und Benutzer geladen und das HTML eingebunden werden.
 */
function init() {
  getTasks();
  getUsers();
  includeHTML();
  renderAddTaskHTML();
  handleDropdownInteraction();
  setPriority("medium");
}

/**
 * Holt die Aufgaben von Firebase und speichert sie lokal.
 */
async function getTasks() {
    try {
      let response = await fetch(BASE_URL + "/testingTasks/.json", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      let responseToJson = await response.json();
      localTasks = responseToJson;
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }

/**
 * Holt die Benutzerkontakte von Firebase und speichert sie.
 */
async function getUsers() {
    try {
      let response = await fetch(BASE_URL + "/contacts/.json", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      let responseToJson = await response.json();
      finalContacts = responseToJson || {};
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
    returnArrayContacts();
}

/**
 * Wandelt die Kontaktliste in ein Array um und rendert die Dropdown-Optionen.
 */
function returnArrayContacts() {
    if (!validateContacts()) return;
    const contactsArray = convertContactsToArray();
    renderContactOptions(contactsArray);
}

/**
 * Überprüft, ob gültige Kontakte vorhanden sind.
 * @returns {boolean} True wenn Kontakte vorhanden sind, sonst False
 */
function validateContacts() {
    if (!finalContacts || Object.keys(finalContacts).length === 0) {
        console.error("No contacts found.");
        return false;
    }
    return true;
}

/**
 * Konvertiert das Kontakt-Objekt in ein Array.
 * @returns {Array} Array der Kontakte
 */
function convertContactsToArray() {
    return Object.values(finalContacts);
}

/**
 * Rendert die Kontakt-Optionen im Dropdown-Menü.
 * @param {Array} contactsArray - Array der zu rendernden Kontakte
 */
function renderContactOptions(contactsArray) {
    const dropdown = document.getElementById("custom-dropdown");
    const optionsContainer = dropdown.querySelector(".dropdown-options");
    optionsContainer.innerHTML = "";
    
    contactsArray.forEach((contactInDrop) => {
        if (!contactInDrop || !contactInDrop.firstName || !contactInDrop.lastName)
            return;
        const optionHTML = assignUserHTML(contactInDrop);
        const optionElement = document.createElement("div");
        optionElement.classList.add("dropdown-contact");
        optionElement.innerHTML = optionHTML;
        optionsContainer.appendChild(optionElement);
    });
}

/**
 * Erstellt eine neue Aufgabe basierend auf den Formulardaten.
 * @param {Event} event - Das auslösende Ereignis.
 */
async function createTask(event) {
  event.preventDefault();
  const taskData = getTaskFormData();
  if (validateTask(taskData.title, taskData.date, taskData.category)) {
    return;
  }
  try {
    const newTask = await buildNewTask(taskData);
    await saveTask(newTask);
    handleSuccessfulTaskCreation();
  } catch (error) {
    console.error("Failed to create the task:", error);
  }
}

/**
 * Holt die Daten aus dem Aufgabenformular.
 * @returns {Object} Die gesammelten Formulardaten.
 */
function getTaskFormData() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    date: document.getElementById("addTaskInputDueDate").value,
    category: categoryObject,
    priority: selectedPriority,
    subtasks: [...subtasksArr],
    assignedUsers: [...assignedUserArr],
  };
}

/**
 * Baut ein neues Aufgabenobjekt basierend auf den Formulardaten.
 * @param {Object} taskData - Die Daten der neuen Aufgabe.
 * @returns {Object} Das erstellte Aufgabenobjekt.
 */
async function buildNewTask(taskData) {
  const nextId = await getNextTaskId();
  return {
    id: nextId,
    status: "todo",
    title: taskData.title,
    description: taskData.description,
    date: taskData.date,
    taskCategory: taskData.category || "Undefined Category",
    prio: taskData.priority,
    subtasks: taskData.subtasks,
    owner: taskData.assignedUsers,
  };
}

/**
 * Speichert die neue Aufgabe in der lokalen Liste und sendet sie an Firebase.
 * @param {Object} newTask - Die zu speichernde Aufgabe.
 */
async function saveTask(newTask) {
  taskArray.push(newTask);
  await pushTaskToFirebase(newTask);
}

/**
 * Behandelt die erfolgreiche Erstellung einer Aufgabe, zeigt eine Bestätigung und leitet weiter.
 */
function handleSuccessfulTaskCreation() {
  showAddTaskSuccesMessage();
  setTimeout(() => {
    window.location.href = "testboard.html";
  }, 1500);
}

/**
 * Behandelt das Abbrechen der Aufgabenerstellung, setzt das Formular und UI zurück.
 * @param {Event} event - Das auslösende Ereignis.
 */
function handleCancel(event) {
  event.preventDefault();
  resetFormValues();
  resetUIElements();
}

/**
 * Setzt die Werte des Formulars zurück.
 */
function resetFormValues() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("addTaskInputDueDate").value = "";
  document.getElementById("categoryInput").value = "";
  document.getElementById("subtaskInput").value = "";
  document.getElementById("subtasksContent").innerHTML = "";
  subtasksArr = [];
  assignedUserArr = [];
  categoryObject = "";
  selectedPriority = "";
}

/**
 * Setzt die UI-Elemente zurück, wie z.B. Benutzercontainer und Prioritätsauswahl.
 */
function resetUIElements() {
  document.getElementById("assigned-users-short").innerHTML = "";
  const userContainers = document.querySelectorAll(".assigned-user-container");
  userContainers.forEach((container) => {
    container.style.backgroundColor = "";
    container.style.color = "";
    container.style.borderRadius = "";
    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  });
  setPriority("medium");
}

/**
 * Validiert die Aufgabe anhand von Titel, Datum und Kategorie.
 * @param {string} title - Der Titel der Aufgabe.
 * @param {string} date - Das Fälligkeitsdatum der Aufgabe.
 * @param {string} category - Die Kategorie der Aufgabe.
 * @returns {boolean} Gibt true zurück, wenn Fehler vorhanden sind.
 */
function validateTask(title, date, category) {
  let hasErrors = false;
  if (!validateTitle(title)) hasErrors = true;
  if (!validateDate(date)) hasErrors = true;
  if (!validateCategory(category)) hasErrors = true;
  return hasErrors;
}

/**
 * Validiert den Titel der Aufgabe.
 * @param {string} title - Der zu validierende Titel.
 * @returns {boolean} Gibt true zurück, wenn der Titel gültig ist.
 */
function validateTitle(title) {
  if (!title) {
    showFieldError("addTitleError", "Title is required!");
    return false;
  }
  return true;
}

/**
 * Validiert das Datum der Aufgabe.
 * @param {string} date - Das zu validierende Datum.
 * @returns {boolean} Gibt true zurück, wenn das Datum gültig ist.
 */
function validateDate(date) {
  if (!date) {
    showFieldError("addDateError", "Date is required!");
    return false;
  }
  if (date < new Date().toISOString().split("T")[0]) {
    showFieldError("addDateError", "Date can't be in the past!");
    return false;
  }
  return true;
}

/**
 * Validiert die Kategorie der Aufgabe.
 * @param {string} category - Die zu validierende Kategorie.
 * @returns {boolean} Gibt true zurück, wenn die Kategorie gültig ist.
 */
function validateCategory(category) {
  if (!category) {
    showFieldError("addCategoryError", "Category is required!");
    return false;
  }
  return true;
}

/**
 * Zeigt eine Fehlermeldung für ein bestimmtes Feld an und deaktiviert den Erstellen-Button vorübergehend.
 * @param {string} elementId - Die ID des Elements, das die Fehlermeldung anzeigen soll.
 * @param {string} message - Die Fehlermeldung.
 */
function showFieldError(elementId, message) {
  const button = document.getElementById("add-task-create");
  document.getElementById(elementId).innerHTML = message;
  button.disabled = true;
  button.style.backgroundColor = "#000000";
  button.style.color = "#2B3647";
  setTimeout(() => {
    button.disabled = false;
    button.style.backgroundColor = "#2B3647";
    button.style.color = "#FFFFFF";
    document.getElementById(elementId).innerHTML = "";
  }, 3000);
}

/**
 * Zeigt eine Erfolgsmeldung nach erfolgreichem Hinzufügen einer Aufgabe an.
 */
function showAddTaskSuccesMessage() {
  let succes = document.getElementById("task-succes");
  let messageContainer = document.getElementById("task-message-container");
  messageContainer.classList.remove("d-none");
  succes.classList.add("show-add-task");
  setTimeout(() => {
    messageContainer.classList.add("d-none");
    succes.classList.remove("show-add-task");
  }, 750);
}

/**
 * Holt alle Aufgaben von Firebase.
 * @returns {Object|null} Die Aufgaben oder null im Fehlerfall
 */
async function fetchTasksFromFirebase() {
  try {
    const response = await fetch(BASE_URL + "/tasks.json", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return null;
  }
}

/**
 * Holt die nächste verfügbare Aufgaben-ID.
 * @returns {number} Die nächste Aufgaben-ID.
 */
async function getNextTaskId() {
  const tasks = await fetchTasksFromFirebase();
  if (!tasks) return 20;
  
  const taskIds = Object.values(tasks).map((task) => task.id);
  const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0;
  return maxId + 1;
}

/**
 * Sendet die neue Aufgabe an Firebase zur Speicherung.
 * @param {Object} newTask - Die zu speichernde Aufgabe.
 */
async function pushTaskToFirebase(newTask) {
  try {
    let key = newTask.id;
    let response = await fetch(BASE_URL + `/tasks/${key}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

/**
 * Zeigt den Clear-Button an und versteckt das Plus-Icon bei der Unteraufgabenerstellung.
 */
function showClearButton() {
    document.getElementById("clear-add-icons").classList.remove("d-none");
    document.getElementById("subtasks-plus-icon").classList.add("d-none");
  }

/**
 * Wechselt die Sichtbarkeit des Dropdown-Menüs.
 * @param {HTMLElement} optionsContainer - Der Container für die Dropdown-Optionen.
 */
function toggleDropdown(optionsContainer) {
    const isOpen = optionsContainer.style.display === "block";
    optionsContainer.style.display = isOpen ? "none" : "block";
  }

/**
 * Behandelt die Interaktion mit dem Dropdown-Menü für Benutzerzuweisungen.
 */
function handleDropdownInteraction() {
    const dropdown = document.getElementById("custom-dropdown");
    const optionsContainer = dropdown.querySelector(".dropdown-options");
    dropdown.addEventListener("click", (e) =>
      handleDropdownClick(e, optionsContainer)
    );
    optionsContainer.addEventListener("click", handleOptionsClick);
  }
  
  /** 
   * Behandelt den Klick auf das Dropdown-Menü.
   * @param {Event} event - Das auslösende Ereignis.
   * @param {HTMLElement} optionsContainer - Der Container für die Dropdown-Optionen.
   */
function handleDropdownClick(event, optionsContainer) {
    const userContainer = event.target.closest(".assigned-user-container");
    if (userContainer) {
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    toggleDropdown(optionsContainer);
  }