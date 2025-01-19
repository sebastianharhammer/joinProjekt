/**
 * Holt die Unteraufgaben einer Aufgabe oder gibt einen leeren String zurück, wenn keine vorhanden sind.
 *
 * @function getSubTasks
 * @param {Object} task - Die Aufgabenobjekt mit den Unteraufgaben.
 * @returns {string} Das generierte HTML für die Unteraufgaben oder ein leerer String.
 */
function getSubTasks(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
    return "";
    }
    return generateSubTasksHTML(task);
}

/**
   * Generiert das HTML für die Unteraufgaben einer Aufgabe.
   *
   * @function generateSubTasksHTML
   * @param {Object} task - Die Aufgabenobjekt mit den Unteraufgaben.
   * @returns {string} Das generierte HTML für die Unteraufgaben.
   */
function generateSubTasksHTML(task) {
    let subtTasksHTML = "";
    for (let i = 0; i < task.subtasks.length; i++) {
    subtTasksHTML += createSubTaskHTML(task, i);
    }
    return subtTasksHTML;
}

/**
   * Aktualisiert die Anzeige der abgeschlossenen Unteraufgaben und den Fortschrittsbalken.
   *
   * @function updateCompletedSubtasks
   * @param {string} taskId - Die ID der Aufgabe, deren Unteraufgaben aktualisiert werden sollen.
   * @returns {void}
   */
function updateCompletedSubtasks(taskId) {
    const task = taskArray.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    const completedCount = task.subtasks.filter(
    (subtask) => subtask.checkbox
    ).length;
    const totalSubtasks = task.subtasks.length;

    const renderCompleted = document.getElementById(`amountOfSubtasks-${taskId}`);
    const progressBar = document.getElementById(`progress-${taskId}`);

    if (renderCompleted && progressBar) {
    if (totalSubtasks > 0) {
        renderCompleted.innerHTML = `${completedCount} / ${totalSubtasks} Subtasks`;
        progressBar.value = (completedCount / totalSubtasks) * 100;
        renderCompleted.style.display = "";
        progressBar.style.display = "";
        } else{
        renderCompleted.style.display = "none";
        progressBar.style.display = "none";
        }
    }
}

/**
   * Bestimmt die Anzahl der Unteraufgaben einer Aufgabe.
   *
   * @function findAmountOfSubtasks
   * @param {Object} task - Die Aufgabenobjekt mit den Unteraufgaben.
   * @returns {string} Die Anzahl der Unteraufgaben als String oder "0", wenn keine vorhanden sind.
   */
function findAmountOfSubtasks(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
    return "0";
    }
    return task.subtasks.length.toString();
}

/**
   * Erstellt das HTML für eine einzelne Aufgabe.
   *
   * @function createTaskHTML
   * @param {Object} task - Die Aufgabenobjekt, für die das HTML erstellt werden soll.
   * @returns {string} Das generierte HTML für die Aufgabe.
   */
function createTaskHTML(task) {
    const completedSubtasks = task.subtasks
    ? task.subtasks.filter((subtask) => subtask.checkbox).length
    : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    return getTaskHTML(task, completedSubtasks, totalSubtasks);
}

/**
   * Zeigt die Detailansicht einer Aufgabe an.
   *
   * @function showTaskCard
   * @param {string} id - Die ID der anzuzeigenden Aufgabe.
   * @returns {void}
   */
function showTaskCard(id) {
    const task = taskArray.find((task) => task.id === id);
    if (!task) {
    console.error(`Task mit ID ${id} nicht gefunden.`);
    return;
    }
    const taskCardOverlay = document.getElementById("taskDetailView");
    if (!taskCardOverlay) {
    console.error("Element mit ID 'taskDetailView' nicht gefunden.");
    return;
    }
    taskCardOverlay.innerHTML = "";
    taskCardOverlay.classList.remove("d-none");
    taskCardOverlay.innerHTML += showTaskCardHTML(task);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
}

/**
   * Schließt die Detailansicht einer Aufgabe.
   *
   * @function closeDetailView
   * @returns {void}
   */
function closeDetailView() {
    const taskCardOverlay = document.getElementById("taskDetailView");
    if (!taskCardOverlay) {
    console.error("Element mit ID 'taskDetailView' nicht gefunden.");
    return;
    }
    taskCardOverlay.classList.add("d-none");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
}

/**
   * Erstellt das HTML für die Detailansicht einer Aufgabe.
   *
   * @function showTaskCardHTML
   * @param {Object} task - Die Aufgabenobjekt, für die das Detail-HTML erstellt werden soll.
   * @returns {string} Das generierte HTML für die Detailansicht der Aufgabe.
   */
function showTaskCardHTML(task) {
    return /*html*/ `
    <div id="currentTaskCard${task.id}" class="currentTaskCard">
        ${getTaskCategoryButtonHTML(task)}
        ${getTaskDetailsHTML(task)}
        <div class="taskOwnersSection">
            <p class="firstTableColumnFont">Assigned To:</p>
            <div class="assignedOwnersContainer">
            ${getAssignedOwnersHTML(task)}
            </div>
        </div>
    </div>
    `;
}

/**
   * Erstellt das HTML für die Kategorie-Schaltfläche einer Aufgabe in der Detailansicht.
   *
   * @function getTaskCategoryButtonHTML
   * @param {Object} task - Die Aufgabenobjekt mit der Kategorieinformation.
   * @returns {string} Das generierte HTML für die Kategorie-Schaltfläche.
   */
function getTaskCategoryButtonHTML(task) {
    return /*html*/ `
    <div class="headAreaTaskcard">
        <div id="taskButton-${task.id}" class="${getTaskCategoryClass(
    task.taskCategory
    )}">
        ${task.taskCategory}
        </div>
        <div class="closeCardParent">
            <img class="closeCard" onclick="closeDetailView()" src="./img/close.svg" alt="Close">
        </div>
    </div>
    `;
}

/**
   * Zeigt die Löschbestätigungsfrage an.
   *
   * @function askFordeleteTask
   * @returns {void}
   */
function askFordeleteTask() {
    const deleteDiv = document.getElementById("deleteConfirmation");
    if (!deleteDiv) {
    console.error("Element mit ID 'deleteConfirmation' nicht gefunden.");
    return;
    }
    deleteDiv.classList.remove("d-none");
}

/**
   * Löscht eine Aufgabe aus Firebase und aktualisiert die Anzeige.
   *
   * @async
   * @function deleteTask
   * @param {string} taskId - Die ID der zu löschenden Aufgabe.
   * @returns {Promise<void>}
   */
async function deleteTask(taskId) {
    const taskIndex = taskArray.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
    }
    try {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    taskArray.splice(taskIndex, 1);
    closeDetailView();
    updateTaskHTML();
    } catch (error) {
    console.error(`Fehler beim Löschen des Tasks ${taskId}:`, error);
    }
}

/**
   * Schließt die Löschbestätigungsfrage.
   *
   * @function closeQuestionDelete
   * @returns {void}
   */
function closeQuestionDelete() {
    const deleteQuestDiv = document.getElementById("deleteConfirmation");
    if (!deleteQuestDiv) {
    console.error("Element mit ID 'deleteConfirmation' nicht gefunden.");
    return;
    }
    deleteQuestDiv.classList.add("d-none");
}

/**
   * Schaltet das Checkbox-Status einer Unteraufgabe um und aktualisiert Firebase.
   *
   * @async
   * @function toggleSubtaskCheckbox
   * @param {string} taskId - Die ID der Aufgabe.
   * @param {number} subtaskIndex - Der Index der Unteraufgabe in der Aufgabenliste.
   * @returns {Promise<void>}
   */
async function toggleSubtaskCheckbox(taskId, subtaskIndex) {
    const task = taskArray.find((task) => task.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task oder Subtask nicht gefunden.");
    return;
    }
    const subtask = task.subtasks[subtaskIndex];
    subtask.checkbox = !subtask.checkbox;
    try {
    await updateTaskInFirebase(task);
    } catch (error) {
    console.error(`Fehler beim Aktualisieren des Subtasks: ${error}`);
    }
    updateTaskHTML();
}

/**
   * Erstellt das HTML für die zugewiesenen Besitzer einer Aufgabe.
   *
   * @function getAssignedOwnersHTML
   * @param {Object} task - Die Aufgabenobjekt mit den Besitzerinformationen.
   * @returns {string} Das generierte HTML für die zugewiesenen Besitzer.
   */
function getAssignedOwnersHTML(task) {
    if (!task.owner || task.owner.length === 0) {
    return getNoOwnersHTML();
    }
    return task.owner.map(getOwnerItemHTML).join("\n");
}

/**
   * Bestimmt die CSS-Klasse basierend auf der Aufgaben-Kategorie.
   *
   * @function getTaskCategoryClass
   * @param {string} taskCategory - Die Kategorie der Aufgabe.
   * @returns {string} Die entsprechende CSS-Klasse für die Kategorie.
   */
function getTaskCategoryClass(taskCategory) {
    if (taskCategory === "Technical Task")
    return "task-category-technicalTask-taskCard";
    if (taskCategory === "User Story")
    return "task-category-userExperience-taskCard";
    return "task-category-undefined";
}

/**
   * Hebt einen Drag-Bereich hervor.
   *
   * @function highlight
   * @param {string} id - Die ID des Elements, das hervorgehoben werden soll.
   * @returns {void}
   */
function highlight(id) {
    const element = document.getElementById(id);
    if (element) {
    element.classList.add("dragAreaHighlight");
    } else {
    console.error(`Element mit ID '${id}' nicht gefunden.`);
    }
}

/**
   * Entfernt die Hervorhebung eines Drag-Bereichs.
   *
   * @function removeHighlight
   * @param {string} id - Die ID des Elements, dessen Hervorhebung entfernt werden soll.
   * @returns {void}
   */
function removeHighlight(id) {
    const element = document.getElementById(id);
    if (element) {
    element.classList.remove("dragAreaHighlight");
    } else {
    console.error(`Element mit ID '${id}' nicht gefunden.`);
    }
}

/**
   * Verschiebt eine Aufgabe eine Kategorie nach oben (z.B. von "done" zu "feedback").
   *
   * @async
   * @function moveTaskUp
   * @param {string} taskId - Die ID der zu verschiebenden Aufgabe.
   * @param {Event} event - Das auslösende Ereignis.
   * @returns {Promise<void>}
   */
async function moveTaskUp(taskId, event) {
    event.stopPropagation();
    const taskIndex = taskArray.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      console.error(`Task mit ID ${taskId} nicht gefunden.`);
      return;
    }
  
    const task = taskArray[taskIndex];
  
    if (task.status === "done") {
      task.status = "feedback";
    } else if (task.status === "feedback") {
      task.status = "inProgress";
    } else if (task.status === "inProgress") {
      task.status = "todo";
    } else {
      return;
    }
  
    try {
      await updateTaskInFirebase(task);
      updateTaskHTML();
    } catch (error) {
      console.error("Fehler beim Verschieben des Tasks nach oben:", error);
    }
  }
  
  /**
   * Verschiebt eine Aufgabe eine Kategorie nach unten (z.B. von "todo" zu "inProgress").
   *
   * @async
   * @function moveTaskDown
   * @param {string} taskId - Die ID der zu verschiebenden Aufgabe.
   * @param {Event} event - Das auslösende Ereignis.
   * @returns {Promise<void>}
   */
  async function moveTaskDown(taskId, event) {
    event.stopPropagation();
    const taskIndex = taskArray.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      console.error(`Task mit ID ${taskId} nicht gefunden.`);
      return;
    }
  
    const task = taskArray[taskIndex];
  
    if (task.status === "todo") {
      task.status = "inProgress";
    } else if (task.status === "inProgress") {
      task.status = "feedback";
    } else if (task.status === "feedback") {
      task.status = "done";
    } else {
      return;
    }
  
    try {
      await updateTaskInFirebase(task);
      updateTaskHTML();
    } catch (error) {
      console.error("Fehler beim Verschieben des Tasks nach unten:", error);
    }
  }