let currentUser = null;

function init() {
  includeHTML();
  loadCurrentUser();
  fetchTasks("/tasks");
  loadBoardNavigator();
}

let currentDraggedElement;
let currentTaskBeingEdited = null;

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
  console.log(responseToJson);
  if (responseToJson) {
    taskArray = Object.values(responseToJson);
  }
  console.log(taskArray);
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
      console.log("Gastbenutzer verschiebt Aufgabe lokal.");
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

function getBoardNavigatorHTML() {
  return /*html*/ `
<section class="boardNavigator">
    <div class="searchAndAddTasks">
        <p class="boardFont">BOARD</p>
        <div class="inputAndButtonBoard">
            <div class="searchAreaBoard">
            <input id="filterTask" onkeyup="filterTaskFunction()" class="inputBoard" type="text" placeholder="Find Task">
            <p id="noResults" style="display: none; color: red; font-size: 14px; margin-top: 5px;">Kein Task gefunden</p>
            <span class="verticalLine">|</span>
            <img src="./img/search.png" alt="">
            </div>
            <div class="addTaskButtonBoard" onclick="showAddTask('todo')">
                <p class="buttonBoardFont">Add Task +</p>
            </div>
        </div>
    </div>
</section>
    `;
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

  // Leere die Spalten vor der Aktualisierung
  todoColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  feedbackColumn.innerHTML = "";
  doneColumn.innerHTML = "";

  // Tasks nach Status filtern
  let todos = taskArray.filter((task) => task.status === "todo");
  let inProgress = taskArray.filter((task) => task.status === "inProgress");
  let feedback = taskArray.filter((task) => task.status === "feedback");
  let done = taskArray.filter((task) => task.status === "done");

  // Tasks in die entsprechenden Spalten rendern
  for (const task of todos) {
    todoColumn.innerHTML += createTaskHTML(task);
    createOwnerCircles(task); // Erstelle Benutzerkreise
    findClassOfTaskCat(task); // Setze die Kategorie-Klasse
    findPrioIcon(task); // Aktualisiere das Prio-Icon
    findAmountOfSubtasks(task); // Zeige die Anzahl der Subtasks
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

  // Wenn keine Tasks in der "todo"-Spalte sind, zeige eine Nachricht
  if (todoColumn.children.length === 0) {
    createNoToDosdiv();
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
      userNameCircles.innerHTML = `
          <svg width="34" height="34">
              <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="gray" />
              <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">N/A</text>
          </svg>
      `;
      return;
  }

  for (const owner of task.owner) {
      userNameCircles.innerHTML += `
          <svg width="34" height="34">
              <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${getRandomColor()}" />
              <text class="fontInNameCircle" x="50%" y="50%" text-anchor="middle" alignment-baseline="central">
                  ${owner.initials || "N/A"}
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
  let subtTasksHTML = "";
  for (let i = 0; i < task.subtasks.length; i++) {
    let subtask = task.subtasks[i];
    subtTasksHTML += /*html*/ `
            <div class="eachSubtaskBox">
                <input type="checkbox" id="subtask-${task.id}-${i}" onchange="updateCompletedSubtasks(${task.id})">
                <label for="subtask-${task.id}-${i}">${subtask}</label>
            </div>
        `;
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
  const owners = getOwners(task);
  const subtasks = getSubTasks(task);
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks
    ? task.subtasks.filter((subtask) => subtask.checkbox).length
    : 0;

  return /*html*/ `
        <div onclick=showTaskCard(${task.id}) id="boardTask${
    task.id
  }" class="todo" draggable ="true" ondragstart="startDragging(${task.id})">
        <div id="taskButton-${task.id}">
        <p class="open-sans">${task.taskCategory}</p>
        </div>
        <p id="title${task.id}" class= "open-sans-bold">${task.title}</p>
        <p id="description${task.id}" class="inter-font">${task.description}</p>
        <div class="progressBarDiv">
        <progress id="progress-${task.id}" class="progressBarBoard" value="${
    (completedSubtasks / totalSubtasks) * 100
  }" max="100"></progress>
        <p id="amountOfSubtasks-${
          task.id
        }" class="inter-font">${completedSubtasks} / ${totalSubtasks} Subtasks</p>
        </div>

        <section class="namesAndPrio">
        <div class="userNameCircles" id="userNameCircles-${task.id}">
        </div>
        <div >
        <img id="priority-${task.id}"  src="./img/prio-mid.png" alt="">
        </div>
        </section>
        
  <div class="mobile-arrows">
      <button class="arrow-btn arrow-up" 
              onclick="moveTaskUp(${task.id}, event)">
        <img src="./img/arrow-up.png" alt="Up">
      </button>
      <button class="arrow-btn arrow-down" 
              onclick="moveTaskDown(${task.id}, event)">
        <img src="./img/arrow-down.png" alt="Down">
      </button>
    </div>
  </div>
  `;
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
}

function closeQuestionDelete() {
  let deleteQuestDiv = document.getElementById("deleteConfirmation");
  deleteQuestDiv.classList.add("d-none");
}

function getSubtasksHTML(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
  }
  let subtasksHTML = "";
  task.subtasks.forEach((subtask, index) => {
    subtasksHTML += /*html*/ `
            <div class="subtaskItem">
                <input 
                    type="checkbox" 
                    id="subtask-${task.id}-${index}" 
                    class="styledCheckbox"
                    ${subtask.checkbox ? "checked" : ""} 
                    onchange="toggleSubtaskCheckbox(${
                      task.id
                    }, ${index}); updateCompletedSubtasks(${task.id})"
                >
                <label for="subtask-${
                  task.id
                }-${index}" class="styledCheckboxLabel">
                    <span class="checkboxSquare"></span>
                    <p class="subtaskText">${
                      subtask.subtask || "Unnamed Subtask"
                    }</p>
                </label>
            </div>
            `;
  });
  return subtasksHTML;
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
    const circleColor = getRandomColor();
    ownerHTML += `
            <div class="ownerItem">
                <svg width="34" height="34">
                    <circle cx="50%" cy="50%" r="16" stroke="white" stroke-width="1" fill="${circleColor}" />
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

function getRandomColor() {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FFC300",
    "#8E44AD",
    "#16A085",
    "#E74C3C",
    "#2ECC71",
    "#3498DB",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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

// edit task

function showEditTaskTempl(taskId) {
  currentTaskBeingEdited = taskId; // Speichert die aktuelle Task-ID
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) {
    console.error("Task nicht gefunden!");
    return;
  }

  let detailView = document.getElementById("taskDetailView");
  let editView = document.getElementById("editTaskTempl");
  detailView.classList.add("d-none");
  editView.classList.remove("d-none");
  editView.innerHTML = getEditTemplate(task);

  setupEditTaskEventListeners(taskId);
  getUsersForEditDropDown();
  updateAssignedUsersDisplay();
  setPriority(task.prio);
  renderEditSubtasks(task);
}

function renderEditSubtasks(task) {
  const subtaskContainer = document.getElementById("rendered-subtasks-edit");
  subtaskContainer.innerHTML = ""; // Container leeren

  if (!task.subtasks || task.subtasks.length === 0) {
    subtaskContainer.innerHTML = `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
    return;
  }

  task.subtasks.forEach((subtask, index) => {
    const subtaskId = `edit-subtask-${task.id}-${index + 1}`; // Dynamische ID erstellen
    const subtaskTextId = `subtask-text-${task.id}-${index}`; // Eindeutige ID für das p-Tag

    subtaskContainer.innerHTML += /*html*/ `
      <div class="edit-subtask-item" id="${subtaskId}">
        <p id="${subtaskTextId}" class="subtaskFontInEdit">• ${subtask.subtask || `Subtask ${index + 1}`}</p>
        <div class="edit-existingtask">
          <img src="./img/edit.svg" alt="Edit" class="edit-icon" onclick="editExistingSubtaskEditView(${task.id}, ${index})">
          <span>|</span>
          <img src="./img/delete.png" alt="Delete" class="delete-icon" onclick="deleteSubtaskEditview(${task.id}, ${index})">
        </div>
      </div>`;
  });
}

function editExistingSubtaskEditView(taskId, subtaskIndex) {
  // Identifiziere das `<p>`-Tag basierend auf der ID
  const subtaskTextId = `subtask-text-${taskId}-${subtaskIndex}`;
  const subtaskTextElement = document.getElementById(subtaskTextId);

  if (!subtaskTextElement) {
    console.error(`Subtask-Text-Element mit ID ${subtaskTextId} nicht gefunden.`);
    return;
  }

  // Erstelle ein neues `<input>`-Element
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.value = subtaskTextElement.textContent.replace("• ", "").trim();
  inputElement.className = "subtaskInputInEdit"; // Optionale Klasse für Styling

  // Ersetze das `<p>`-Tag durch das `<input>`-Element
  subtaskTextElement.replaceWith(inputElement);

  // Tausche das Edit-Icon gegen ein Check-Icon
  const editIcon = document.querySelector(
    `#edit-subtask-${taskId}-${subtaskIndex + 1} .edit-icon`
  );
  if (editIcon) {
    editIcon.src = "./img/check.svg";
    editIcon.classList.add("check-icon");
    editIcon.onclick = null; // Entferne die `onclick`-Funktion
  }

  // Füge ein Event hinzu, um die Eingabe bei Enter zu speichern
  inputElement.addEventListener("blur", () => saveEditedSubtask(taskId, subtaskIndex, inputElement.value));
  inputElement.focus();
}


function saveEditedSubtask(taskId, subtaskIndex, newValue) {
  const task = taskArray.find((t) => t.id === taskId);
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
    console.error("Task oder Subtask nicht gefunden.");
    return;
  }

  // Aktualisiere den Subtask-Wert
  task.subtasks[subtaskIndex].subtask = newValue;

  // Aktualisiere Firebase (optional)
  fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then(() => console.log(`Subtask ${subtaskIndex} von Task ${taskId} gespeichert.`))
    .catch((error) => console.error("Fehler beim Speichern des Subtasks:", error));


  const subtaskContainer = document.getElementById(`edit-subtask-${taskId}-${subtaskIndex + 1}`);
  subtaskContainer.innerHTML = `
    <p id="subtask-text-${taskId}-${subtaskIndex}" class="subtaskFontInEdit">• ${newValue}</p>
    <div class="edit-existingtask">
      <img src="./img/edit.svg" alt="Edit" class="edit-icon" onclick="editExistingSubtaskEditView(${taskId}, ${subtaskIndex})">
      <span>|</span>
      <img src="./img/delete.png" alt="Delete" class="delete-icon" onclick="deleteSubtaskEditview(${taskId}, ${subtaskIndex})">
    </div>`;

  // Restore the original icon and behavior
  const editIcon = document.querySelector(
    `#edit-subtask-${taskId}-${subtaskIndex + 1} .edit-icon`
  );
  if (editIcon) {
    editIcon.src = "./img/edit.svg";
    editIcon.onclick = () => editExistingSubtaskEditView(taskId, subtaskIndex);
  }
}


async function getUsersForEditDropDown() {
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
    finalContactsForEdit = responseToJson || {};
    console.log(finalContactsForEdit);
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  returnArrayContactsEdit();
  setupEditDropdownInteraction(); // Dropdown-Interaktion nach Rendern initialisieren
}

function setupEditDropdownInteraction() {
  const editDropdown = document.getElementById("custom-dropdown-edit");
  const editOptionsContainer = editDropdown.querySelector(
    ".dropdown-options-edit"
  );
  // Toggle-Logik für Dropdown
  editDropdown.addEventListener("click", (event) => {
    // Verhindere, dass das Event andere Klick-Listener beeinflusst
    event.stopPropagation();
    // Toggle-Anzeige: Flex (offen) / None (geschlossen)
    if (editOptionsContainer.style.display === "block") {
      editOptionsContainer.style.display = "none";
    } else {
      editOptionsContainer.style.display = "block";
    }
  });

  // Optional: Dropdown schließen, wenn außerhalb geklickt wird
  document.addEventListener("click", () => {
    editOptionsContainer.style.display = "none";
  });
}

function returnArrayContactsEdit() {
  if (!finalContactsForEdit || Object.keys(finalContactsForEdit).length === 0) {
      console.error("No contacts found.");
      return;
  }

  const editDropdown = document.getElementById("custom-dropdown-edit");
  const editOptionsContainer = editDropdown.querySelector(".dropdown-options-edit");
  editOptionsContainer.innerHTML = ""; // Dropdown leeren

  // Iteriere durch alle Kontakte und setze die Checkbox-Zustände
  Object.keys(finalContactsForEdit).forEach((key) => {
      const contact = finalContactsForEdit[key];
      if (!contact || !contact.firstName || !contact.lastName) return;

      // Prüfen, ob der Benutzer im aktuellen Task als Owner zugewiesen ist
      const isChecked = assignedUserArr.some(
          (user) =>
              user.firstName === contact.firstName &&
              user.lastName === contact.lastName
      );

      // Erstelle ein Container-DIV
      const optionElement = document.createElement("div");
      optionElement.classList.add("dropdown-contact-edit");

      // Erstelle die Initialen-Kreise
      const circleDiv = document.createElement("div");
      circleDiv.classList.add("contact-circle-edit");
      circleDiv.style.backgroundColor = getRandomColor();
      circleDiv.textContent = `${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}`;

      // Erstelle den Namen
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;

      // Erstelle das Label für die Checkbox
      const checkboxLabel = document.createElement("label");
      checkboxLabel.classList.add("contact-checkbox-edit-label");

      // Erstelle das Quadrat für die Checkbox
      const checkboxSquare = document.createElement("span");
      checkboxSquare.classList.add("checkboxSquare");

      // Erstelle die eigentliche Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("contact-checkbox-edit");
      checkbox.checked = isChecked; // Zustand setzen
      checkbox.addEventListener("change", () => {
          handleEditContactSelection(
              contact.firstName,
              contact.lastName,
              checkbox.checked
          );
      });

      // Füge die Checkbox und das Quadrat in das Label ein
      checkboxLabel.appendChild(checkbox);
      checkboxLabel.appendChild(checkboxSquare);

      // Füge alle Elemente in das `optionElement` ein
      optionElement.appendChild(circleDiv);
      optionElement.appendChild(nameSpan);
      optionElement.appendChild(checkboxLabel);

      // Füge das fertige `optionElement` in den `editOptionsContainer` ein
      editOptionsContainer.appendChild(optionElement);
  });
}




function assignUserEditHTML(contact) {
  const initials = `${getFirstLetter(contact.firstName)}${getFirstLetter(
    contact.lastName
  )}`;
  return `
        <div class="contact-circle-edit" style="background-color: ${getRandomColor()}">${initials}</div>
        <span>${contact.firstName} ${contact.lastName}</span>
        <input type="checkbox" class="contact-checkbox-edit" onchange="handleEditContactSelection('${
          contact.firstName
        }', '${contact.lastName}')">
    `;
}

function handleEditContactSelection(firstName, lastName, isChecked) {
  if (isChecked) {
    // Benutzer hinzufügen
    if (
      !assignedUserArr.some(
        (user) => user.firstName === firstName && user.lastName === lastName
      )
    ) {
      assignedUserArr.push({ firstName, lastName });
    }
  } else {
    // Benutzer entfernen
    assignedUserArr = assignedUserArr.filter(
      (user) => user.firstName !== firstName || user.lastName !== lastName
    );
  }

  console.log("Assigned users:", assignedUserArr);
  updateAssignedUsersDisplay();
}

function updateAssignedUsersDisplay() {
  const assignedUsersContainer = document.getElementById(
    "assigned-users-short-edit"
  );
  assignedUsersContainer.innerHTML = "";

  assignedUserArr.forEach((user) => {
    const initials = `${getFirstLetter(user.firstName)}${getFirstLetter(
      user.lastName
    )}`;
    assignedUsersContainer.innerHTML += `
            <div class="assigned-user-circle" style="background-color: ${getRandomColor()}">
                <p>${initials}</p>
            </div>
        `;
  });
}

function getFirstLetter(name) {
  return name.trim().charAt(0).toUpperCase();
}

function getRandomColor() {
  const colors = ["orange", "purple", "blue", "red", "green", "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getEditTemplate(task) {
  return /*html*/ `
        <div id="editTaskCard" class="editTaskCard">
            <div class="closeEditLine">
            <div class="closeEditView">
                <img class="closeCard" onclick="closeEditTask()" src="./img/close.svg" alt="">
            </div>
            </div>
            <p class="firstTableColumnFont">Title:</p>

            <div class="add-subtask-in-edit">
                <input class="input-title-in-edit" type="text" value="${
                  task.title
                }">
            </div>


            <p class="firstTableColumnFont">Description:</p>
            <textarea id="editDescription" class="editTaskTextarea">${
              task.description
            }</textarea>
            
            <p class="firstTableColumnFont">Due Date:</p>
            <div class="edit-due-date">
            <input type="date" id="edit-due-date" class="edit-input" value="${
              task.date || ""
            }">
            </div>
            
            <p class="firstTableColumnFont">Priorität:</p>
            <div class="prio-btn-content">
                <button id="prio-urgent" class="prio-button ${
                  task.prio === "urgent" ? "red" : ""
                }" onclick="setPriority('urgent')" type="button">
                    Urgent
                    <img id="prio-image-urgent" class="${
                      task.prio === "urgent" ? "sat-0" : ""
                    }" src="./img/Prio_urgent_color.png" alt=""/>
                </button>
                <button id="prio-medium" class="prio-button ${
                  task.prio === "medium" ? "yellow" : ""
                }" onclick="setPriority('medium')" type="button">
                    Medium
                    <img id="prio-image-medium" class="${
                      task.prio === "medium" ? "sat-0" : ""
                    }" src="./img/Prio_medium_color.png" alt=""/>
                </button>
                <button id="prio-low" class="prio-button ${
                  task.prio === "low" ? "green" : ""
                }" onclick="setPriority('low')" type="button">
                    Low
                    <img id="prio-image-low" class="${
                      task.prio === "low" ? "sat-0" : ""
                    }" src="./img/Prio_low_color.png" alt=""/>
                </button>
            </div>

            <div class="field-text-flex-edit" id="addTaskAssignedTo-edit">
                <div class="form-group-edit">
                    <label for="assigned-to-edit">Assigned to</label>
                    <div id="custom-dropdown-edit" class="custom-dropdown-edit input-addtask-edit">
                    <div class="dropdown-placeholder-edit">Select contacts to assign</div>
                    <div class="dropdown-options-edit"></div>
                    </div>
                    <div class="assigned-users-short-edit" id="assigned-users-short-edit"></div>
                </div>
            </div>

            <section id="edit-subtasks-section">

            <div class="add-subtask-in-edit">
                <input class="input-subtask-in-edit" type="text" placeholder="Write a new subtask...">
                <div class="img-in-edit-input">
                    <div class="close-and-check-imgs">
                        <img src="./img/close.svg" alt="close">
                    </div>
                    <div class="close-and-check-imgs">
                        <img onclick="addSubTaskInEditTempl()" src="./img/check.svg" alt="check">
                    </div>
                </div>
            </div>

            
            <div id="rendered-subtasks-edit">
            </div>
            </section>
            
            <section class="editButtons">
            <button class="btn-skip-and-confirm-edit" onclick="saveEditedTask()">Save changes</button>
            <button onclick="skipEdit(${
              task.id
            })" class="btn-skip-and-confirm-edit">close edit</button>
            </section>
        </div>
    `;
}

function addSubTaskInEditTempl() {
  const inputField = document.querySelector(".input-subtask-in-edit");
  const inputValue = inputField.value.trim();
  if (inputValue === "") {
    return;
  }

  const subtaskContainer = document.getElementById("rendered-subtasks-edit");
  const taskId = currentTaskBeingEdited; // Verwende die aktuelle Task-ID
  const subtaskIndex = subtaskContainer.childElementCount; // Index des neuen Subtasks
  const subtaskId = `edit-subtask-${taskId}-${subtaskIndex + 1}`; // Eindeutige ID erstellen


  subtaskContainer.innerHTML += /*html*/ `
        <div class="edit-subtask-item" id="${subtaskId}">
            <p class="subtaskFontInEdit">• ${inputValue}</p>
            <div class="edit-existingtask">
                <img src="./img/edit.svg" alt="Edit" class="edit-icon" onclick="editExistingSubtaskEditView(${taskId}, ${subtaskIndex})">
                <span>|</span>
                <img src="./img/delete.png" alt="Delete" class="delete-icon" onclick="deleteSubtaskEditview(${taskId}, ${subtaskIndex})">
            </div>
        </div>`;

  inputField.value = "";
}



function setupEditTaskEventListeners(taskId) {
  const dueDateInput = document.getElementById("edit-due-date");
  if (dueDateInput) {
    dueDateInput.addEventListener("change", () => {
      const task = taskArray.find((t) => t.id === taskId);
      if (task) {
        task.date = dueDateInput.value;
        console.log("Updated date:", task.date);
      }
    });
  }
}

function deleteSubtaskEditview(taskId, subtaskIndex) {
  const task = taskArray.find((t) => t.id === taskId);
  if (!task || !task.subtasks) {
    console.error("Task oder Subtasks nicht gefunden!");
    return;
  }

  task.subtasks.splice(subtaskIndex, 1);

  fetch(`${BASE_URL}/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Fehler beim Aktualisieren in Firebase: ${response.statusText}`
        );
      }
      console.log(
        `Subtask ${subtaskIndex} von Task ${taskId} erfolgreich gelöscht.`
      );
    })
    .catch((error) => {
      console.error("Fehler beim Löschen des Subtasks in Firebase:", error);
    });
  const subtaskElement = document.getElementById(
    `edit-subtask-${taskId}-${subtaskIndex + 1}`
  );
  if (subtaskElement) {
    subtaskElement.remove();
  }
}

function skipEdit(taskId) {
  const editView = document.getElementById("editTaskTempl");
  if (editView) {
    editView.classList.add("d-none");
  }
  const task = taskArray.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task mit ID ${taskId} nicht gefunden.`);
    return;
  }
  let detailView = document.getElementById("taskDetailView");
  if (detailView) {
    detailView.innerHTML = "";
    detailView.classList.remove("d-none");
    detailView.innerHTML += showTaskCardHTML(task);
  }
}

function closeEditTask(taskId) {
  let overlayEdit = document.getElementById("editTaskTempl");
  overlayEdit.classList.add("d-none");
}

async function saveEditedTask() {
  const taskId = currentTaskBeingEdited; // Die ID des aktuell bearbeiteten Tasks
  const newTitle = document.querySelector("#editTaskCard input").value; // Aktualisierter Titel
  const newDescription = document.getElementById("editDescription").value; // Aktualisierte Beschreibung
  const newDate = document.getElementById("edit-due-date").value; // Aktualisiertes Datum

  // Finde den aktuellen Task im taskArray
  const taskIndex = taskArray.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
      console.error(`Task mit ID ${taskId} nicht im taskArray gefunden.`);
      return;
  }

  // Kopiere den Task und aktualisiere die Werte
  const updatedTask = { ...taskArray[taskIndex] };
  updatedTask.title = newTitle;
  updatedTask.description = newDescription;
  updatedTask.date = newDate;

  // Owner-Daten übernehmen
  updatedTask.owner = assignedUserArr.map((user) => ({
      ...user,
      initials: `${getFirstLetter(user.firstName)}${getFirstLetter(user.lastName)}`
  }));

  // Aktualisierte Subtasks übernehmen
  const subtaskElements = document.querySelectorAll(
      "#rendered-subtasks-edit .subtaskFontInEdit"
  );
  updatedTask.subtasks = Array.from(subtaskElements).map((subtaskElement) => ({
      subtask: subtaskElement.textContent.replace("• ", "").trim(), // Entferne das "• " und trimme Leerzeichen
      checkbox: false, // Standardmäßig nicht erledigt
  }));

  // Task im taskArray aktualisieren
  taskArray[taskIndex] = updatedTask;

  // Daten in Firebase speichern
  try {
      await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
      });

      console.log(`Task ${taskId} erfolgreich aktualisiert.`);
      console.log("Aktualisiertes Task-Array:", taskArray);

      // Aktualisiere das Board
      updateTaskHTML();

      // Schließe den Edit-Dialog
      closeEditTask();
  } catch (error) {
      console.error(`Fehler beim Aktualisieren der Task ${taskId}:`, error);
  }
}


