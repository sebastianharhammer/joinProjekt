let currentUser = null;
let currentDraggedElement;
let currentTaskBeingEdited = null;

async function init() {
  includeHTML();
  loadCurrentUser();
  await fetchContacts();
  fetchTasks("/tasks");
  loadBoardNavigator();
}

async function fetchContacts() {
  try {
    const response = await fetch(BASE_URL + "/contacts/.json", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const responseToJson = await response.json();
    if (responseToJson) {
      finalContacts = Object.values(responseToJson);
      console.log("Contacts loaded:", finalContacts);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}


function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    console.log(currentUser);
  }
}

async function fetchTasks(path = "") {
  const responseToJson = await fetchTaskData(path);
  if (responseToJson) {
    taskArray = transformTaskArray(responseToJson);
  }
  updateTaskHTML();
}

async function fetchTaskData(path) {
  const response = await fetch(BASE_URL + path + ".json");
  return response.json();
}

function transformTaskArray(responseToJson) {
  return Object.values(responseToJson).map((task) => transformTask(task));
}

function transformTask(task) {
  if (task.owner) {
    task.owner = task.owner.map((owner) => transformOwner(owner));
  }
  return task;
}

function transformOwner(owner) {
  const contact = finalContacts.find(
    (c) => c.firstName === owner.firstName && c.lastName === owner.lastName
  );
  return { ...owner, color: contact?.color || "gray" };
}

function startDragging(id) {
  currentDraggedElement = id;
}

function allowDrop(event) {
  event.preventDefault();
}

async function moveTo(category) {
  const taskIndex = taskArray.findIndex(
    (task) => task.id === currentDraggedElement
  );
  if (taskIndex !== -1) {
    taskArray[taskIndex].status = category;
    if (currentUser.firstName === "Guest" && currentUser.lastName === "User") {
      updateTaskHTML();
    } else {
      await updateTaskInFirebase(taskArray[taskIndex]);
      updateTaskHTML();
    }
  }
}

async function updateTaskInFirebase(task) {
  const taskId = task.id;
  try {
    await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Tasks ${taskId}:`, error);
  }
}

function loadBoardNavigator() {
  let content = document.getElementById("wholeBoard");
  content.innerHTML = "";
  content.innerHTML += getBoardNavigatorHTML();
  content.innerHTML += getColumnsHTML();
}


function filterTaskFunction() {
  const myFilter = getFilterValue();
  const tasksFound = filterTasks(myFilter);
  toggleNoResultsMessage(tasksFound, myFilter);
}

function getFilterValue() {
  return document.getElementById("filterTask").value.toLowerCase();
}

function filterTasks(myFilter) {
  let tasksFound = false;
  taskArray.forEach((task) => {
    const paramToFind = document.getElementById(`title${task.id}`);
    const param2ToFind = document.getElementById(`description${task.id}`);
    const wholeTask = document.getElementById(`boardTask${task.id}`);

    if (paramToFind || (param2ToFind && wholeTask)) {
      tasksFound = applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) || tasksFound;
    }
  });
  return tasksFound;
}

function applyFilterToTask(paramToFind, param2ToFind, wholeTask, myFilter) {
  if (
    paramToFind.innerText.toLowerCase().includes(myFilter) ||
    param2ToFind.innerText.toLowerCase().includes(myFilter)
  ) {
    wholeTask.style.display = "";
    return true;
  } else {
    wholeTask.style.display = "none";
    return false;
  }
}

function toggleNoResultsMessage(tasksFound, myFilter) {
  const noResultsMessage = document.getElementById("noResults");
  if (!tasksFound && myFilter.length > 0) {
    noResultsMessage.style.display = "block";
  } else {
    noResultsMessage.style.display = "none";
  }
}

function getColumns(content) {
  content.innerHTML += getColumnsHTML();
}

function updateTaskHTML() {
  let todoColumn = document.getElementById("todo");
  let inProgressColumn = document.getElementById("inProgress");
  let feedbackColumn = document.getElementById("feedback");
  let doneColumn = document.getElementById("done");

  todoColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  feedbackColumn.innerHTML = "";
  doneColumn.innerHTML = "";


  let todos = taskArray.filter((task) => task.status === "todo");
  let inProgress = taskArray.filter((task) => task.status === "inProgress");
  let feedback = taskArray.filter((task) => task.status === "feedback");
  let done = taskArray.filter((task) => task.status === "done");


  for (const task of todos) {
    todoColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  }

  for (const task of inProgress) {
    inProgressColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  }

  for (const task of feedback) {
    feedbackColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  }

  for (const task of done) {
    doneColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task);
    findClassOfTaskCat(task);
    findPrioIcon(task);
    findAmountOfSubtasks(task);
  }


  if (todoColumn.children.length === 0) {
    createNoTasksDiv("todo", "NO TASKS TO DO");
  }
  if (inProgressColumn.children.length === 0) {
    createNoTasksDiv("inProgress", "NO TASKS IN PROGRESS");
  }
  if (feedbackColumn.children.length === 0) {
    createNoTasksDiv("feedback", "NO TASKS IN FEEDBACK");
  }
  if (doneColumn.children.length === 0) {
    createNoTasksDiv("done", "NO TASKS DONE");
  }
}


function createNoTasksDiv(columnId, message) {
  const column = document.getElementById(columnId);
  if (column) {
    column.innerHTML += /*html*/ `
      <div class="noTasks">
        <p class="font-no-tasks">${message}</p>
      </div>
    `;
  }
}

function createNoToDosdiv() {
  document.getElementById("todo").innerHTML += /*html*/ `
        <div class="noTasks">
            <p class="font-no-tasks">NO TASKS TO DO</p>
        </div>
    `;
}

function createOwnerCircles(task) {
  const userNameCircles = document.getElementById(`userNameCircles-${task.id}`);
  if (!userNameCircles) {
    console.error("Owner-Kreis-Container nicht gefunden!");
    return;
  }
  userNameCircles.innerHTML = "";

  if (!task.owner || task.owner.length === 0) {
    userNameCircles.innerHTML = generateNoOwnerCircle();
    return;
  }
  const ownersToShow = task.owner.slice(0, 2);
  const extraOwnersCount = task.owner.length - 2;
  for (const owner of ownersToShow) {
    userNameCircles.innerHTML += generateOwnerCircle(owner);
  }
  if (extraOwnersCount > 0) {
    userNameCircles.innerHTML += `
      <svg width="34" height="34">
        <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="black" />
        <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central" fill="white">
          +${extraOwnersCount}
        </text>
      </svg>
    `;
  }
}


function findClassOfTaskCat(task) {
  const taskButton = document.getElementById(`taskButton-${task.id}`);
  const category = task.taskCategory || "Undefined Category";

  taskButton.classList.remove(
    "task-category-technicalTask",
    "task-category-userExperience",
    "task-category-undefined"
  );
  if (category === "Technical Task") {
    taskButton.classList.add("task-category-technicalTask");
  } else if (category === "User Story") {
    taskButton.classList.add("task-category-userExperience");
  } else {
    taskButton.classList.add("task-category-undefined");
  }
  taskButton.textContent = category;
}

function findPrioIcon(task) {
  const prioIcon = document.getElementById(`priority-${task.id}`);
  if (!prioIcon) return;
  if (task.prio === "urgent") {
    prioIcon.src = "./img/prio-high.png";
  } else if (task.prio === "medium") {
    prioIcon.src = "./img/prio-mid.png";
  } else if (task.prio === "low") {
    prioIcon.src = "./img/prio-low.png";
  }
}

function getSubTasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "";
  }
  return generateSubTasksHTML(task);
}

function generateSubTasksHTML(task) {
  let subtTasksHTML = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    subtTasksHTML += createSubTaskHTML(task, i);
  }
  return subtTasksHTML;
}

function updateCompletedSubtasks(taskId) {
  const task = taskArray.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return;

  const completedCount = task.subtasks.filter(
    (subtask) => subtask.checkbox
  ).length;
  const totalSubtasks = task.subtasks.length;

  const renderCompleted = document.getElementById(`amountOfSubtasks-${taskId}`);
  if (renderCompleted) {
    renderCompleted.innerHTML = `${completedCount} / ${totalSubtasks} Subtasks`;
  }

  const progressBar = document.getElementById(`progress-${taskId}`);
  if (progressBar) {
    progressBar.value = (completedCount / totalSubtasks) * 100;
  }
}

function findAmountOfSubtasks(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return "0";
  }
  return task.subtasks.length;
}

function createTaskHTML(task) {
  const completedSubtasks = task.subtasks
    ? task.subtasks.filter((subtask) => subtask.checkbox).length
    : 0;
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

  return getTaskHTML(task, completedSubtasks, totalSubtasks);
}


function showTaskCard(id) {
  const task = taskArray.find((task) => task.id === id);
  if (!task) {
    console.error(`Task mit ID ${id} nicht gefunden.`);
    return;
  }
  const taskCardOverlay = document.getElementById("taskDetailView");
  taskCardOverlay.innerHTML = "";
  taskCardOverlay.classList.remove("d-none");
  taskCardOverlay.innerHTML += showTaskCardHTML(task);
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}



function closeDetailView() {
  console.log("closeDetailView aufgerufen");
  const taskCardOverlay = document.getElementById("taskDetailView");
  taskCardOverlay.classList.add("d-none");

  console.log("Setze body.style.overflow zurück");
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  console.log("Aktueller overflow-Wert von body:", document.body.style.overflow);
  console.log("Aktueller overflow-Wert von html:", document.documentElement.style.overflow);
}





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

function getTaskCategoryButtonHTML(task) {
  return /*html*/ `
        <div class="headAreaTaskcard">
            <div id="taskButton-${task.id}" class="${getTaskCategoryClass(
    task.taskCategory
  )}">
                ${task.taskCategory}
            </div>
            <div class="closeCardParent">
                <img class="closeCard" onclick="closeDetailView()" src="./img/close.svg" alt="">
            </div>
        </div>
    `;
}

function askFordeleteTask() {
  let deleteDiv = document.getElementById("deleteConfirmation");
  deleteDiv.classList.remove("d-none");
}

async function deleteTask(taskId) {
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }
  try {
    await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
      method: "DELETE",
    });
    taskArray.splice(taskIndex, 1);
    closeDetailView();
    updateTaskHTML();
  } catch (error) {
    console.error(`Fehler beim Löschen des Tasks ${taskId}:`, error);
  }
}

function closeQuestionDelete() {
  let deleteQuestDiv = document.getElementById("deleteConfirmation");
  deleteQuestDiv.classList.add("d-none");
}

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

function getAssignedOwnersHTML(task) {
  if (!task.owner || task.owner.length === 0) {
    return getNoOwnersHTML();
  }
  return task.owner.map(getOwnerItemHTML).join("\n");
}

function getTaskCategoryClass(taskCategory) {
  if (taskCategory === "Technical Task")
    return "task-category-technicalTask-taskCard";
  if (taskCategory === "User Story")
    return "task-category-userExperience-taskCard";
  return "task-category-undefined";
}


function highlight(id) {
  document.getElementById(id).classList.add("dragAreaHighlight");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("dragAreaHighlight");
}

async function moveTaskUp(taskId, event) {
  event.stopPropagation(); // Verhindert, dass das Klicken auf den Pfeil das Task-Detail-Overlay öffnet
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }

  const task = taskArray[taskIndex];

  // Verschiebe den Task nach oben in die Reihenfolge: Done -> Await Feedback -> In Progress -> To-Do
  if (task.status === "done") {
    task.status = "feedback";
  } else if (task.status === "feedback") {
    task.status = "inProgress";
  } else if (task.status === "inProgress") {
    task.status = "todo";
  } else {
    console.log("Task befindet sich bereits in der obersten Kategorie.");
    return;
  }

  try {
    await updateTaskInFirebase(task); // Speichere die Änderung in Firebase
    updateTaskHTML(); // Aktualisiere die Anzeige
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks nach oben:", error);
  }
}

async function moveTaskDown(taskId, event) {
  event.stopPropagation(); // Verhindert, dass das Klicken auf den Pfeil das Task-Detail-Overlay öffnet
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }

  const task = taskArray[taskIndex];

  // Verschiebe den Task nach unten in die Reihenfolge: To-Do -> In Progress -> Await Feedback -> Done
  if (task.status === "todo") {
    task.status = "inProgress";
  } else if (task.status === "inProgress") {
    task.status = "feedback";
  } else if (task.status === "feedback") {
    task.status = "done";
  } else {
    console.log("Task befindet sich bereits in der untersten Kategorie.");
    return;
  }

  try {
    await updateTaskInFirebase(task); // Speichere die Änderung in Firebase
    updateTaskHTML(); // Aktualisiere die Anzeige
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks nach unten:", error);
  }
}

