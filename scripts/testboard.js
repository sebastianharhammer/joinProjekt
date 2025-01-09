let currentUser = null;

async function init() {
  includeHTML();
  loadCurrentUser();
  await fetchContacts();
  fetchTasks("/tasks");
  loadBoardNavigator();
}


let currentDraggedElement;
let currentTaskBeingEdited = null;

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
  let response = await fetch(BASE_URL + path + ".json");
  let responseToJson = await response.json();
  if (responseToJson) {
    taskArray = Object.values(responseToJson).map((task) => {
      if (task.owner) {
        task.owner = task.owner.map((owner) => {
          const contact = finalContacts.find(
            (c) => c.firstName === owner.firstName && c.lastName === owner.lastName
          );
          return { ...owner, color: contact?.color || "gray" };
        });
      }
      return task;
    });
  }
  updateTaskHTML();
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
      console.log("Registrierter Benutzer aktualisiert Firebase.");
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
    console.log(`Task ${taskId} erfolgreich aktualisiert.`);
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Tasks ${taskId}:`, error);
  }
}

function loadBoardNavigator() {
  let content = document.getElementById("wholeBoard");
  content.innerHTML = "";
  content.innerHTML += getBoardNavigatorHTML();
  loadTitleOfBoardColumns(content);
}


function filterTaskFunction() {
  let myFilter = document.getElementById("filterTask").value.toLowerCase();
  let tasksFound = false;

  for (let i = 0; i < taskArray.length; i++) {
    let paramToFind = document.getElementById(`title${taskArray[i].id}`);
    let param2ToFind = document.getElementById(`description${taskArray[i].id}`);
    let wholeTask = document.getElementById(`boardTask${taskArray[i].id}`);

    if (paramToFind || (param2ToFind && wholeTask)) {
      if (
        paramToFind.innerText.toLowerCase().includes(myFilter) ||
        param2ToFind.innerText.toLowerCase().includes(myFilter)
      ) {
        wholeTask.style.display = "";
        tasksFound = true;
      } else {
        wholeTask.style.display = "none";
      }
    }
  }

  const noResultsMessage = document.getElementById("noResults");
  if (!tasksFound && myFilter.length > 0) {
    noResultsMessage.style.display = "block";
  } else {
    noResultsMessage.style.display = "none";
  }
}

function loadTitleOfBoardColumns(content) {
  content.innerHTML += showTitleOfBoardColumns();
  getColumns(content);
}

function showTitleOfBoardColumns() {
  return /*html*/ `
        <section id="titleOfBoardColumns" class="titleOfBoardColumns">
<div class="columntitleToDo">
    <p class="columnTitleFont">To do</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('todo')">
</div>
<div class="columntitleInProgress">
    <p class="columnTitleFont">In Progress</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('inProgress')">
</div>
<div class="columntitleAwaitFeedback">
    <p class="columnTitleFont">Await Feedback</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('feedback')">
</div>
<div class="columntitleDone">
    <p class="columnTitleFont">Done</p>
    <img src="./img/plus button.png" alt="" onclick="showAddTask('done')">
</div>
</section>
    `;
}

function getColumns(content) {
  content.innerHTML += getColumnsHTML();
}

function getColumnsHTML() {
  return /*html*/ `
        <section class="tasksContent">
            <div class="column-header">
                <span class="headline-to-do-responsive">TO DO</span>
                <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('todo')">
            </div>
            <div class="dragarea-todo" id="todo"
                ondrop="moveTo('todo')" 
                ondragleave="removeHighlight('todo')" 
                ondragover="allowDrop(event); highlight('todo')"></div>

            <div class="column-header">
                <span class="headline-in-progress-responsive">IN PROGRESS</span>
                <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('inProgress')">
            </div>
            <div class="dragarea-inProgress" id="inProgress"
                ondrop="moveTo('inProgress')" 
                ondragleave="removeHighlight('inProgress')" 
                ondragover="allowDrop(event); highlight('inProgress')"></div>

            <div class="column-header">
                <span class="headline-feedback-responsive">AWAIT FEEDBACK</span>
                <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('feedback')">
            </div>
            <div class="dragarea-feedback" id="feedback"
                ondrop="moveTo('feedback')" 
                ondragleave="removeHighlight('feedback')" 
                ondragover="allowDrop(event); highlight('feedback')"></div>

            <div class="column-header">
                <span class="headline-done-responsive">DONE</span>
                <img class="plus-button" src="./img/plus button.png" alt="Add" onclick="showAddTask('done')">
            </div>
            <div class="dragarea-done" id="done"
                ondrop="moveTo('done')" 
                ondragleave="removeHighlight('done')" 
                ondragover="allowDrop(event); highlight('done')"></div>
        </section>`;
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
  for (const owner of task.owner) {
    userNameCircles.innerHTML += generateOwnerCircle(owner);
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

function moveTaskUp(taskId, event) {
  event.stopPropagation();

  const statusOrder = ["todo", "inProgress", "feedback", "done"];
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) return;

  const currentStatus = taskArray[taskIndex].status;
  const currentPos = statusOrder.indexOf(currentStatus);

  if (currentPos <= 0) {
    console.log("Task ist bereits in der obersten Kategorie.");
    return;
  }

  const newStatus = statusOrder[currentPos - 1];
  taskArray[taskIndex].status = newStatus;

  if (currentUser && currentUser.firstName !== "Guest") {
    updateTaskInFirebase(taskArray[taskIndex])
      .then(() => updateTaskHTML())
      .catch((err) => console.error("Fehler beim Update:", err));
  } else {
    updateTaskHTML();
  }
}

function moveTaskDown(taskId, event) {
  event.stopPropagation();

  const statusOrder = ["todo", "inProgress", "feedback", "done"];
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) return;

  const currentStatus = taskArray[taskIndex].status;
  const currentPos = statusOrder.indexOf(currentStatus);

  if (currentPos >= statusOrder.length - 1) {
    console.log("Task ist bereits in der untersten Kategorie.");
    return;
  }

  const newStatus = statusOrder[currentPos + 1];
  taskArray[taskIndex].status = newStatus;

  if (currentUser && currentUser.firstName !== "Guest") {
    updateTaskInFirebase(taskArray[taskIndex])
      .then(() => updateTaskHTML())
      .catch((err) => console.error("Fehler beim Update:", err));
  } else {
    updateTaskHTML();
  }
}

function showTaskCard(id) {
  const task = taskArray.find((task) => task.id === id);
  if (!task) {
      console.error(`Task mit ID ${id} nicht gefunden.`);
      return;
  }
  let taskCardOverlay = document.getElementById("taskDetailView");
  taskCardOverlay.innerHTML = "";
  taskCardOverlay.classList.remove("d-none");
  taskCardOverlay.innerHTML += showTaskCardHTML(task);

  document.body.classList.add("no-scroll"); // Scrollen deaktivieren
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

function getTaskDetailsHTML(task) {
  return /*html*/ `
        <p class="boardFontDetail">${task.title}</p>
        <p class="description-taskCard">${task.description}</p>
        <table class="dueDateAndPrio">
            <tbody>
                <tr>
                    <td class="firstTableColumnFont">Due date:</td>
                    <td>${task.date}</td>
                </tr>
                <tr>
                    <td class="firstTableColumnFont">Priority:</td>
                    <td>${
                      task.prio
                    } <img class="prioIconCard" src="${getPrioIcon(
    task.prio
  )}" alt=""></td>                   
                </tr>
            </tbody>
        </table>
        <div class="cardSubtasks">
            <p class="firstTableColumnFont">Subtasks</p>
            ${getSubtasksHTML(task)}
        </div>
        <div class="editAndDelete">
            <div class="deleteCard" onclick="askFordeleteTask()">
                <img class="deleteIcon" src="./img/delete.svg" alt="">
                <p class="editDeleteFont">Delete</p>
            </div>
            <div onclick="showEditTaskTempl(${task.id})" class="deleteCard">
            <img class="editIcon" src="./img/edit.svg" alt="">
            <p class="editDeleteFont">Edit</p>
            </div>
        </div>
            <div class="deleteConfirmation d-none" id="deleteConfirmation">
            <p class="deleteHeaderFont">Bist du dir sicher?</p>
            <div class="confirmation-delete-buttons">
                <button class="deleteTaskButtons" onclick="deleteTask(${
                  task.id
                })">Ja, löschen</button>
                <button class="deleteTaskButtons" onclick="closeQuestionDelete()">Nein, zurück</button>
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
    console.log(`Task ${taskId} erfolgreich gelöscht.`);

    taskArray.splice(taskIndex, 1);
    closeDetailView();
    updateTaskHTML();
  } catch (error) {
    console.error(`Fehler beim Löschen des Tasks ${taskId}:`, error);
  }
}

function closeDetailView() {
  let overlay = document.getElementById("taskDetailView");
  overlay.classList.add("d-none");
  document.body.classList.remove("no-scroll"); // Scrollen wieder aktivieren
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
    console.log(
      `Subtask ${subtaskIndex} von Task ${taskId} erfolgreich aktualisiert.`
    );
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Subtasks: ${error}`);
  }
  updateTaskHTML();
}

function getAssignedOwnersHTML(task) {
  if (!task.owner || task.owner.length === 0) {
    return `<p class="noOwners">Keine Owner zugewiesen</p>`;
  }
  let ownerHTML = "";
  task.owner.forEach((owner) => {
    const color = getRandomColor(owner.firstName, owner.lastName); // Nutzt getRandomColor
    ownerHTML += `
      <div class="ownerItem">
        <svg width="34" height="34">
          <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${color}" />
          <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
            ${owner.initials || "N/A"}
          </text>
        </svg>
        <p>${owner.firstName} ${owner.lastName}</p>
      </div>
    `;
  });
  return ownerHTML;
}



function getPrioIcon(prio) {
  if (prio === "medium") {
    return "./img/prio-mid.png";
  } else if (prio === "urgent") {
    return "./img/prio-high.png";
  } else {
    return "./img/prio-low.png";
  }
}

function getTaskCategoryClass(taskCategory) {
  if (taskCategory === "Technical Task")
    return "task-category-technicalTask-taskCard";
  if (taskCategory === "User Story")
    return "task-category-userExperience-taskCard";
  return "task-category-undefined";
}

function closeDetailView() {
  let taskCardOverlay = document.getElementById("taskDetailView");
  taskCardOverlay.classList.add("d-none");
}

function highlight(id) {
  document.getElementById(id).classList.add("dragAreaHighlight");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("dragAreaHighlight");
}
