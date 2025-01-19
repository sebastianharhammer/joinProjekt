/**
 * Startet den Drag-Vorgang für eine Aufgabe.
 *
 * @function startDragging
 * @param {string} id - Die ID der zu ziehenden Aufgabe.
 * @returns {void}
 */
function startDragging(id) {
    currentDraggedElement = id;
}

/**
   * Erlaubt das Ablegen eines Elements, indem das Standardverhalten verhindert wird.
   *
   * @function allowDrop
   * @param {Event} event - Das Drag-and-Drop-Ereignis.
   * @returns {void}
   */
function allowDrop(event) {
    event.preventDefault();
}

/**
 * Lädt den Board-Navigator und die Spalten in die HTML-Anzeige.
 *
 * @function loadBoardNavigator
 * @returns {void}
 */
function loadBoardNavigator() {
    const content = document.getElementById("wholeBoard");
    if (!content) {
    console.error("Element mit ID 'wholeBoard' nicht gefunden.");
    return;
    }
    content.innerHTML = "";
    content.innerHTML += getBoardNavigatorHTML();
    content.innerHTML += getColumnsHTML();
}

/**
   * Filtert Aufgaben basierend auf der Eingabe im Filterfeld.
   *
   * @function filterTaskFunction
   * @returns {void}
   */
function filterTaskFunction() {
    filterTasksByInput("filterTask");
}

/**
   * Filtert Aufgaben basierend auf der Eingabe im mobilen Filterfeld.
   *
   * @function filterTaskFunctionMobile
   * @returns {void}
   */
function filterTaskFunctionMobile() {
    filterTasksByInput("filterTask-mobile");
}

/**
   * Filtert Aufgaben basierend auf dem Wert eines bestimmten Eingabefeldes.
   *
   * @function filterTasksByInput
   * @param {string} inputId - Die ID des Eingabefeldes.
   * @returns {void}
   */
function filterTasksByInput(inputId) {
    const myFilter = getFilterValue(inputId);
    const tasksFound = filterTasks(myFilter);
    toggleNoResultsMessage(tasksFound, myFilter, inputId);
}

/**
   * Holt den Filterwert aus einem Eingabefeld.
   *
   * @function getFilterValue
   * @param {string} inputId - Die ID des Eingabefeldes.
   * @returns {string} Der Filterwert in Kleinbuchstaben.
   */
function getFilterValue(inputId) {
    const element = document.getElementById(inputId);
    if (!element) {
    console.error(`Element mit ID '${inputId}' nicht gefunden.`);
    return "";
    }
    return element.value.toLowerCase();
}

/**
   * Filtert die Aufgaben basierend auf dem angegebenen Filtertext.
   *
   * @function filterTasks
   * @param {string} myFilter - Der Filtertext in Kleinbuchstaben.
   * @returns {boolean} Gibt true zurück, wenn mindestens eine Aufgabe gefunden wurde, sonst false.
   */
function filterTasks(myFilter) {
    let tasksFound = false;
    taskArray.forEach((task) => {
    const paramToFind = document.getElementById(`title${task.id}`);
    const param2ToFind = document.getElementById(`description${task.id}`);
    const wholeTask = document.getElementById(`boardTask${task.id}`);

    if (paramToFind || (param2ToFind && wholeTask)) {
        tasksFound =
        applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) ||
        tasksFound;
    }
    });
    return tasksFound;
}

/**
   * Wendet den Filter auf eine einzelne Aufgabe an und zeigt oder versteckt sie entsprechend.
   *
   * @function applyFilterToTask
   * @param {HTMLElement|null} paramToFind - Das HTML-Element, das den Titel der Aufgabe enthält.
   * @param {HTMLElement|null} param2ToFind - Das HTML-Element, das die Beschreibung der Aufgabe enthält.
   * @param {HTMLElement|null} wholeTask - Das gesamte Aufgaben-Element im Board.
   * @param {string} myFilter - Der Filtertext in Kleinbuchstaben.
   * @returns {boolean} Gibt true zurück, wenn die Aufgabe dem Filter entspricht, sonst false.
   */
function applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) {
    if (!wholeTask) {
    console.error("Element 'wholeTask' nicht gefunden.");
    return false;
    }

    const titleMatch =
    paramToFind && paramToFind.innerText.toLowerCase().includes(myFilter);
    const descriptionMatch =
    param2ToFind && param2ToFind.innerText.toLowerCase().includes(myFilter);
    if (titleMatch || descriptionMatch) {
    wholeTask.style.display = "";
    return true;
    } else {
    wholeTask.style.display = "none";
    return false;
    }
}

/**
   * Zeigt oder versteckt die "Keine Ergebnisse"-Meldung basierend auf den gefundenen Aufgaben.
   *
   * @function toggleNoResultsMessage
   * @param {boolean} tasksFound - Gibt an, ob Aufgaben gefunden wurden.
   * @param {string} myFilter - Der Filtertext in Kleinbuchstaben.
   * @param {string} inputId - Die ID des Eingabefeldes.
   * @returns {void}
   */
function toggleNoResultsMessage(tasksFound, myFilter, inputId) {
    const noResultsMessage = document.querySelector(`#${inputId} ~ p#noResults`);
    if (!noResultsMessage) {
    console.error(`Element 'noResults' neben '#${inputId}' nicht gefunden.`);
    return;
    }

    if (!tasksFound && myFilter.length > 0) {
    noResultsMessage.style.display = "block";
    } else {
    noResultsMessage.style.display = "none";
    }
}

/**
   * Fügt die Spalten-HTML zum angegebenen Container hinzu.
   *
   * @function getColumns
   * @param {HTMLElement} content - Der Container, zu dem die Spalten hinzugefügt werden sollen.
   * @returns {void}
   */
function getColumns(content) {
    content.innerHTML += getColumnsHTML();
}

/**
   * Aktualisiert die HTML-Anzeige der Aufgaben in den entsprechenden Spalten.
   *
   * @function updateTaskHTML
   * @returns {void}
   */
function updateTaskHTML() {
    const todoColumn = document.getElementById("todo");
    const inProgressColumn = document.getElementById("inProgress");
    const feedbackColumn = document.getElementById("feedback");
    const doneColumn = document.getElementById("done");
    if (!todoColumn || !inProgressColumn || !feedbackColumn || !doneColumn) {
    console.error("Eine oder mehrere Spalten-Elemente nicht gefunden.");
    return;
    }
    todoColumn.innerHTML = "";
    inProgressColumn.innerHTML = "";
    feedbackColumn.innerHTML = "";
    doneColumn.innerHTML = "";

    const todos = taskArray.filter((task) => task.status === "todo");
    const inProgress = taskArray.filter((task) => task.status === "inProgress");
    const feedback = taskArray.filter((task) => task.status === "feedback");
    const done = taskArray.filter((task) => task.status === "done");

    todos.forEach((task) => {
    todoColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
    });

    inProgress.forEach((task) => {
    inProgressColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
    });

    feedback.forEach((task) => {
    feedbackColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
    });

    done.forEach((task) => {
    doneColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
    });

    if (todos.length === 0) {
    createNoTasksDiv("todo", "NO TASKS TO DO");
    }
    if (inProgress.length === 0) {
    createNoTasksDiv("inProgress", "NO TASKS IN PROGRESS");
    }
    if (feedback.length === 0) {
    createNoTasksDiv("feedback", "NO TASKS IN FEEDBACK");
    }
    if (done.length === 0) {
    createNoTasksDiv("done", "NO TASKS DONE");
    }
}