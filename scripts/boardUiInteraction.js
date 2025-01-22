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
 * Updates the HTML content of task columns based on task status.
 * Clears the columns and re-renders tasks into the appropriate columns.
 */
function updateTaskHTML() {
  const columns = getTaskColumns();
  
  if (!checkColumnsExist(columns)) return;

  resetColumns(columns);
  
  const tasksByStatus = groupTasksByStatus();

  updateEachColumnWithTasks(columns, tasksByStatus);
}

/**
 * Returns the DOM elements for each task column.
 */
function getTaskColumns() {
  return {
    todo: document.getElementById("todo"),
    inProgress: document.getElementById("inProgress"),
    feedback: document.getElementById("feedback"),
    done: document.getElementById("done")
  };
}

/**
 * Checks if all the required column elements exist in the DOM.
 * Returns true if all columns are found, otherwise logs an error.
 */
function checkColumnsExist(columns) {
  if (Object.values(columns).includes(null)) {
    console.error("One or more column elements not found.");
    return false;
  }
  return true;
}

/**
 * Loops over each column and adds the tasks to the respective column.
 */
function updateEachColumnWithTasks(columns, tasksByStatus) {
  Object.keys(columns).forEach((status) => {
    const tasks = tasksByStatus[status];
    addTasksToColumn(tasks, columns[status], status);
    checkAndCreateNoTasksDiv(tasks, status);
  });
}


/**
 * Resets the inner HTML content of each column to an empty string.
 * @param {Object} columns - An object with column IDs as keys and column elements as values.
 */
function resetColumns(columns) {
  Object.values(columns).forEach(column => {
    column.innerHTML = "";
  });
}

/**
 * Groups tasks by their status into categories: todo, inProgress, feedback, done.
 * @returns {Object} An object with statuses as keys and an array of tasks as values.
 */
function groupTasksByStatus() {
  return {
    todo: taskArray.filter(task => task.status === "todo"),
    inProgress: taskArray.filter(task => task.status === "inProgress"),
    feedback: taskArray.filter(task => task.status === "feedback"),
    done: taskArray.filter(task => task.status === "done")
  };
}

/**
 * Adds tasks to the appropriate column in the HTML and includes additional task details.
 * @param {Array} tasks - Array of tasks to be displayed in the column.
 * @param {HTMLElement} column - The HTML element representing the column to which tasks will be added.
 * @param {string} status - The status of the tasks (e.g., 'todo', 'inProgress').
 */
function addTasksToColumn(tasks, column, status) {
  tasks.forEach((task) => {
    column.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  });
}

/**
 * Checks if there are no tasks in a given column and creates a 'No tasks' message if the column is empty.
 * @param {Array} tasks - Array of tasks in the column.
 * @param {string} status - The status of the tasks (e.g., 'todo', 'inProgress').
 */
function checkAndCreateNoTasksDiv(tasks, status) {
  if (tasks.length === 0) {
    const statusMessages = {
      todo: "NO TASKS TO DO",
      inProgress: "NO TASKS IN PROGRESS",
      feedback: "NO TASKS IN FEEDBACK",
      done: "NO TASKS DONE"
    };
    createNoTasksDiv(status, statusMessages[status]);
  }
}

/**
 * Finds a task in the task array by its ID, using a more descriptive name.
 *
 * @param {string} taskId - The ID of the task to be found.
 * @returns {Object|null} - The found task or null if not found.
 */
function findTaskByIdInArrayForMoveUp(taskId) {
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task with ID ${taskId} not found.`);
    return null;
  }
  return taskArray[taskIndex];
}

/**
 * Moves the task status to the previous stage.
 *
 * @param {Object} task - The task whose status will be updated.
 * @returns {boolean} - True if the task status was updated, false otherwise.
 */
function moveStatusUp(task) {
  if (task.status === "done") {
    task.status = "feedback";
  } else if (task.status === "feedback") {
    task.status = "inProgress";
  } else if (task.status === "inProgress") {
    task.status = "todo";
  } else {
    return false; // Return false if no valid status change can be made
  }
  return true;
}

/**
 * Updates the task's status in Firebase and refreshes the HTML.
 *
 * @param {Object} task - The task to be updated.
 * @returns {Promise<void>}
 */
async function updateTaskInFirebaseAndRefreshHTMLForMoveUp(task) {
  try {
    await updateTaskInFirebase(task);
    updateTaskHTML();
  } catch (error) {
    console.error("Error moving task up:", error);
  }
}

/**
 * Main function that moves a task one category up.
 *
 * @async
 * @function moveTaskUp
 * @param {string} taskId - The ID of the task to be moved.
 * @param {Event} event - The triggering event.
 * @returns {Promise<void>}
 */
async function moveTaskUp(taskId, event) {
  event.stopPropagation();
  const task = findTaskByIdInArrayForMoveUp(taskId);
  if (!task) {
    return; // Task was not found
  }
  if (moveStatusUp(task)) {
    await updateTaskInFirebaseAndRefreshHTMLForMoveUp(task);
  }
}


/**
 * Finds a task in the task array by its ID, using a more descriptive name.
 *
 * @param {string} taskId - The ID of the task to be found.
 * @returns {Object|null} - The found task or null if not found.
 */
function findTaskByIdInArray(taskId) {
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task with ID ${taskId} not found.`);
    return null;
  }
  return taskArray[taskIndex];
}

/**
 * Moves the task status to the next stage.
 *
 * @param {Object} task - The task whose status will be updated.
 * @returns {boolean} - True if the task status was updated, false otherwise.
 */
function moveStatusDown(task) {
  if (task.status === "todo") {
    task.status = "inProgress";
  } else if (task.status === "inProgress") {
    task.status = "feedback";
  } else if (task.status === "feedback") {
    task.status = "done";
  } else {
    return false; // Return false if no valid status change can be made
  }
  return true;
}

/**
 * Updates the task's status in Firebase and refreshes the HTML.
 *
 * @param {Object} task - The task to be updated.
 * @returns {Promise<void>}
 */
async function updateTaskInFirebaseAndRefreshHTML(task) {
  try {
    await updateTaskInFirebase(task);
    updateTaskHTML();
  } catch (error) {
    console.error("Error moving task down:", error);
  }
}

/**
 * Main function that moves a task one category down.
 *
 * @async
 * @function moveTaskDown
 * @param {string} taskId - The ID of the task to be moved.
 * @param {Event} event - The triggering event.
 * @returns {Promise<void>}
 */
async function moveTaskDown(taskId, event) {
  event.stopPropagation();
  const task = findTaskByIdInArray(taskId);
  if (!task) {
    return;
  }
  if (moveStatusDown(task)) {
    await updateTaskInFirebaseAndRefreshHTML(task);
  }
}

