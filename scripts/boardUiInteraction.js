/**
 * Starts the drag operation for a task.
 *
 * @function startDragging
 * @param {string} id - The ID of the task to be dragged.
 * @returns {void}
 */
function startDragging(id) {
  currentDraggedElement = id;
}

/**
 * Allows dropping an element by preventing the default behavior.
 *
 * @function allowDrop
 * @param {Event} event - The drag-and-drop event.
 * @returns {void}
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Loads the board navigator and columns into the HTML display.
 *
 * @function loadBoardNavigator
 * @returns {void}
 */
function loadBoardNavigator() {
  const content = document.getElementById("wholeBoard");
  if (!content) {
    console.error("Element with ID 'wholeBoard' not found.");
    return;
  }
  content.innerHTML = "";
  content.innerHTML += getBoardNavigatorHTML();
  content.innerHTML += getColumnsHTML();
}

/**
 * Filters tasks based on the input in the filter field.
 *
 * @function filterTaskFunction
 * @returns {void}
 */
function filterTaskFunction() {
  filterTasksByInput("filterTask");
}

/**
 * Filters tasks based on the input in the mobile filter field.
 *
 * @function filterTaskFunctionMobile
 * @returns {void}
 */
function filterTaskFunctionMobile() {
  filterTasksByInput("filterTask-mobile");
}

/**
 * Filters tasks based on the value of a specific input field.
 *
 * @function filterTasksByInput
 * @param {string} inputId - The ID of the input field.
 * @returns {void}
 */
function filterTasksByInput(inputId) {
  const myFilter = getFilterValue(inputId);
  const tasksFound = filterTasks(myFilter);
  toggleNoResultsMessage(tasksFound, myFilter, inputId);
}

/**
 * Retrieves the filter value from an input field.
 *
 * @function getFilterValue
 * @param {string} inputId - The ID of the input field.
 * @returns {string} The filter value in lowercase.
 */
function getFilterValue(inputId) {
  const element = document.getElementById(inputId);
  if (!element) {
    console.error(`Element with ID '${inputId}' not found.`);
    return "";
  }
  return element.value.toLowerCase();
}

/**
 * Filters the tasks based on the provided filter text.
 *
 * @function filterTasks
 * @param {string} myFilter - The filter text in lowercase.
 * @returns {boolean} Returns true if at least one task is found, otherwise false.
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
 * Applies the filter to a single task and shows or hides it accordingly.
 *
 * @function applyFilterToTask
 * @param {HTMLElement|null} paramToFind - The HTML element containing the task title.
 * @param {HTMLElement|null} param2ToFind - The HTML element containing the task description.
 * @param {HTMLElement|null} wholeTask - The entire task element on the board.
 * @param {string} myFilter - The filter text in lowercase.
 * @returns {boolean} Returns true if the task matches the filter, otherwise false.
 */
function applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) {
  if (!wholeTask) {
    console.error("Element 'wholeTask' not found.");
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
 * Shows or hides the "No Results" message based on the found tasks.
 *
 * @function toggleNoResultsMessage
 * @param {boolean} tasksFound - Indicates whether tasks were found.
 * @param {string} myFilter - The filter text in lowercase.
 * @param {string} inputId - The ID of the input field.
 * @returns {void}
 */
function toggleNoResultsMessage(tasksFound, myFilter, inputId) {
  const noResultsMessage = document.querySelector(`#${inputId} ~ p#noResults`);
  if (!noResultsMessage) {
    console.error(`Element 'noResults' next to '#${inputId}' not found.`);
    return;
  }

  if (!tasksFound && myFilter.length > 0) {
    noResultsMessage.style.display = "block";
  } else {
    noResultsMessage.style.display = "none";
  }
}

/**
 * Adds the columns HTML to the specified container.
 *
 * @function getColumns
 * @param {HTMLElement} content - The container to which the columns should be added.
 * @returns {void}
 */
function getColumns(content) {
  content.innerHTML += getColumnsHTML();
}

/**
 * Updates the HTML display of tasks in the corresponding columns.
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
    console.error("One or more column elements not found.");
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
