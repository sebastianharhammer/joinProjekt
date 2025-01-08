function showEditTaskTempl(taskId) {
    currentTaskBeingEdited = taskId;
    const task = taskArray.find((t) => t.id === taskId);
    if (!task) {
      console.error("Task nicht gefunden!");
      return;
    }
    assignedUserArr = task.owner ? [...task.owner] : []; // Kopiere die aktuellen Owner in assignedUserArr
  
    let detailView = document.getElementById("taskDetailView");
    let editView = document.getElementById("editTaskTempl");
    detailView.classList.add("d-none");
    editView.classList.remove("d-none");
    editView.innerHTML = getEditTemplate(task);
  
    setupEditTaskEventListeners(taskId);
    getUsersForEditDropDown();
    updateAssignedUsersDisplay(); // Aktualisiere die Anzeige basierend auf den aktuellen Owners
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
    const subtaskTextId = `subtask-text-${taskId}-${subtaskIndex}`;
    const subtaskTextElement = document.getElementById(subtaskTextId);
  
    if (!subtaskTextElement) {
      console.error(`Subtask-Text-Element mit ID ${subtaskTextId} nicht gefunden.`);
      return;
    }
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = subtaskTextElement.textContent.replace("• ", "").trim();
    inputElement.className = "subtaskInputInEdit";
    subtaskTextElement.replaceWith(inputElement);
  
    const editIcon = document.querySelector(
      `#edit-subtask-${taskId}-${subtaskIndex + 1} .edit-icon`
    );
    if (editIcon) {
      editIcon.src = "./img/check.svg";
      editIcon.classList.add("check-icon-edit");
      editIcon.onclick = null; // Entferne die `onclick`-Funktion
    }
    inputElement.addEventListener("blur", () => saveEditedSubtask(taskId, subtaskIndex, inputElement.value));
    inputElement.focus();
  }
  
  
  function saveEditedSubtask(taskId, subtaskIndex, newValue) {
    const task = taskArray.find((t) => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
      console.error("Task oder Subtask nicht gefunden.");
      return;
    }
    task.subtasks[subtaskIndex].subtask = newValue;
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
    setupEditDropdownInteraction();
  }
  
  function setupEditDropdownInteraction() {
    const editDropdown = document.getElementById("custom-dropdown-edit");
    const editOptionsContainer = editDropdown.querySelector(".dropdown-options-edit");
    editDropdown.addEventListener("click", (event) => {
      event.stopPropagation();
      const isDropdownOpen = editOptionsContainer.style.display === "block";
      if (!isDropdownOpen) {
        editOptionsContainer.style.display = "block";
      }
    });
  
    document.addEventListener("click", (event) => {
      if (
        !editDropdown.contains(event.target)
      ) {
        editOptionsContainer.style.display = "none";
      }
    });
  }
  
  
  function returnArrayContactsEdit() {
    if (!finalContactsForEdit || Object.keys(finalContactsForEdit).length === 0) {
      console.error("No contacts found.");
      return;
    }
  
    const editDropdown = document.getElementById("custom-dropdown-edit");
    const editOptionsContainer = editDropdown.querySelector(".dropdown-options-edit");
    editOptionsContainer.innerHTML = "";
    
    Object.keys(finalContactsForEdit).forEach((key) => {
      const contact = finalContactsForEdit[key];
      if (!contact || !contact.firstName || !contact.lastName) return;
  
      // Überprüfe, ob der Kontakt bereits assigned ist
      const isChecked = assignedUserArr.some(
        (user) =>
          user.firstName === contact.firstName &&
          user.lastName === contact.lastName
      );
  
      const optionElement = document.createElement("div");
      optionElement.classList.add("dropdown-contact-edit");
  
      const circleDiv = document.createElement("div");
      circleDiv.classList.add("contact-circle-edit");
      circleDiv.style.backgroundColor = getRandomColor(contact.firstName, contact.lastName); // Nutzt getRandomColor
      circleDiv.textContent = `${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}`;
  
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;
  
      const checkboxLabel = document.createElement("label");
      checkboxLabel.classList.add("contact-checkbox-edit-label");
  
      const checkboxSquare = document.createElement("span");
      checkboxSquare.classList.add("checkboxSquare");
  
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("contact-checkbox-edit");
      checkbox.checked = isChecked;
      checkbox.addEventListener("change", () => {
        handleEditContactSelection(
          contact.firstName,
          contact.lastName,
          checkbox.checked
        );
      });
      checkboxLabel.appendChild(checkbox);
      checkboxLabel.appendChild(checkboxSquare);
  
      optionElement.appendChild(circleDiv);
      optionElement.appendChild(nameSpan);
      optionElement.appendChild(checkboxLabel);
  
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
      if (
        !assignedUserArr.some(
          (user) => user.firstName === firstName && user.lastName === lastName
        )
      ) {
        assignedUserArr.push({ firstName, lastName });
      }
    } else {
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
      const color = getRandomColor(user.firstName, user.lastName); // Nutzt getRandomColor
      const initials = `${getFirstLetter(user.firstName)}${getFirstLetter(user.lastName)}`;
      assignedUsersContainer.innerHTML += `
        <div class="assigned-user-circle" style="background-color: ${color}">
          <p>${initials}</p>
        </div>
      `;
    });
  }
  
  
  function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
  }
  
  function getRandomColor(firstName, lastName) {
  
    const contact = finalContacts.find(
      (c) => c.firstName === firstName && c.lastName === lastName
    );
    return contact?.color || "gray";
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
              <textarea id="editDescription" class="editTaskTextarea textarea-large"></textarea>
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
                  <input id="input-subtask-in-edit" class="input-subtask-in-edit" type="text" placeholder="Write a new subtask...">
                  <div class="img-in-edit-input">
                      <div class="close-and-check-imgs">
                          <img onclick="emptyInput()" src="./img/close.svg" alt="close">
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
              })" class="btn-skip-and-confirm-edit">Skip edit</button>
              </section>
          </div>
      `;
  }
  
  
  function emptyInput() {
    let inputField = document.getElementById('input-subtask-in-edit');
    inputField.value = "";
  }
  
  
  function addSubTaskInEditTempl() {
    const inputField = document.querySelector(".input-subtask-in-edit");
    const inputValue = inputField.value.trim();
    if (inputValue === "") {
      return;
    }
  
    const subtaskContainer = document.getElementById("rendered-subtasks-edit");
    const noSubtasksElement = subtaskContainer.querySelector(".noSubtasks");
    if (noSubtasksElement) {
      noSubtasksElement.remove();
    }
  
    const taskId = currentTaskBeingEdited;
    const subtaskIndex = subtaskContainer.childElementCount;
    const subtaskId = `edit-subtask-${taskId}-${subtaskIndex + 1}`;
  
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
  
  
    const subtaskContainer = document.getElementById("rendered-subtasks-edit");
    if (subtaskContainer.children.length === 0) {
      subtaskContainer.innerHTML = `<p class="noSubtasks">Keine Subtasks vorhanden</p>`;
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
    const taskId = currentTaskBeingEdited; 
    const newTitle = document.querySelector("#editTaskCard input").value;
    const newDescription = document.getElementById("editDescription").value;
    const newDate = document.getElementById("edit-due-date").value;
  
    const taskIndex = taskArray.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
        console.error(`Task mit ID ${taskId} nicht im taskArray gefunden.`);
        return;
    }
    const updatedTask = { ...taskArray[taskIndex] };
    updatedTask.title = newTitle;
    updatedTask.description = newDescription;
    updatedTask.date = newDate;
    updatedTask.owner = assignedUserArr.map((user) => ({
        ...user,
        initials: `${getFirstLetter(user.firstName)}${getFirstLetter(user.lastName)}`
    }));
    const subtaskElements = document.querySelectorAll(
        "#rendered-subtasks-edit .subtaskFontInEdit"
    );
    updatedTask.subtasks = Array.from(subtaskElements).map((subtaskElement) => ({
        subtask: subtaskElement.textContent.replace("• ", "").trim(),
        checkbox: false,
    }));
    taskArray[taskIndex] = updatedTask;
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask),
        });
  
        console.log(`Task ${taskId} erfolgreich aktualisiert.`);
        console.log("Aktualisiertes Task-Array:", taskArray);
  
        updateTaskHTML();
        closeEditTask();
    } catch (error) {
        console.error(`Fehler beim Aktualisieren der Task ${taskId}:`, error);
    }
  }