function showEditTaskTempl(taskId) {
    currentTaskBeingEdited = taskId;
    const task = taskArray.find((t) => t.id === taskId);
    if (!task) {
        console.error("Task nicht gefunden!");
        return;
    }

    assignedUserArr = task.owner ? [...task.owner] : [];
    toggleEditAndDetailView();

    const editView = document.getElementById("editTaskTempl");
    editView.innerHTML = getEditTemplate(task);

    initializeEditTask(taskId, task);
}


function toggleEditAndDetailView() {
    const detailView = document.getElementById("taskDetailView");
    const editView = document.getElementById("editTaskTempl");

    detailView.classList.add("d-none");
    editView.classList.remove("d-none");
}


function initializeEditTask(taskId, task) {
    setupEditTaskEventListeners(taskId);
    getUsersForEditDropDown();
    updateAssignedUsersDisplay();
    setPriority(task.prio);
    renderEditSubtasks(task);
}

function renderEditSubtasks(task) {
    const subtaskContainer = document.getElementById("rendered-subtasks-edit");
    clearSubtaskContainer(subtaskContainer);

    if (!task.subtasks || task.subtasks.length === 0) {
        renderNoSubtasksMessage(subtaskContainer);
        return;
    }

    task.subtasks.forEach((subtask, index) => {
        const subtaskId = `edit-subtask-${task.id}-${index + 1}`;
        const subtaskTextId = `subtask-text-${task.id}-${index}`;
        const subtaskHTML = createSubtaskHTML(task, subtask, subtaskId, subtaskTextId, index);
        subtaskContainer.innerHTML += subtaskHTML;
    });
}


function clearSubtaskContainer(container) {
    container.innerHTML = "";
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
        const isChecked = checkIfContactAssigned(contact);
        const optionElement = createDropdownOption(contact, isChecked);
        editOptionsContainer.appendChild(optionElement);
    });
}

function createDropdownOption(contact, isChecked) {
    const optionElement = document.createElement("div");
    optionElement.classList.add("dropdown-contact-edit");
    const circleDiv = createContactCircle(contact);
    const nameSpan = createContactNameSpan(contact);
    const checkboxLabel = createCheckboxLabel(contact, isChecked);
    optionElement.appendChild(circleDiv);
    optionElement.appendChild(nameSpan);
    optionElement.appendChild(checkboxLabel);
    return optionElement;
}

function createContactNameSpan(contact) {
    const nameSpan = document.createElement("span");
    nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;
    return nameSpan;
}


function createCheckboxLabel(contact, isChecked) {
    const checkboxLabel = createEditLabel();
    const checkbox = createEditCheckbox(isChecked, contact);
    const checkboxSquare = createEditCheckboxSquare();
    assembleEditLabel(checkboxLabel, checkbox, checkboxSquare);
    return checkboxLabel;
}


function createEditLabel() {
    const label = document.createElement("label");
    label.classList.add("contact-checkbox-edit-label");
    return label;
}


function createEditCheckbox(isChecked, contact) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("contact-checkbox-edit");
    checkbox.checked = isChecked;
    addEditCheckboxEventListener(checkbox, contact);
    return checkbox;
}


function addEditCheckboxEventListener(checkbox, contact) {
    checkbox.addEventListener("change", () => {
        handleEditContactSelection(
            contact.firstName,
            contact.lastName,
            checkbox.checked
        );
    });
}


function createEditCheckboxSquare() {
    const span = document.createElement("span");
    span.classList.add("checkboxSquare");
    return span;
}


function assembleEditLabel(label, checkbox, checkboxSquare) {
    label.appendChild(checkbox);
    label.appendChild(checkboxSquare);
}


function createContactCircle(contact) {
    const circleDiv = document.createElement("div");
    circleDiv.classList.add("contact-circle-edit");
    circleDiv.style.backgroundColor = getRandomColor(contact.firstName, contact.lastName);
    circleDiv.textContent = `${getFirstLetter(contact.firstName)}${getFirstLetter(contact.lastName)}`;
    return circleDiv;
}

function assignUserEditHTML(contact) {
    const initials = `${getFirstLetter(contact.firstName)}${getFirstLetter(
        contact.lastName
    )}`;
    return createContactEditHTML(initials, contact);
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
        assignedUsersContainer.innerHTML += createAssignedUserHTML(color, initials);
    });
}


function getRandomColor(firstName, lastName) {

    const contact = finalContacts.find(
        (c) => c.firstName === firstName && c.lastName === lastName
    );
    return contact?.color || "gray";
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
    subtaskContainer.innerHTML += createSubtaskEditHTML(subtaskId, inputValue, taskId, subtaskIndex);
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
    const task = findTaskById(taskId);
    if (!isValidTask(task)) return;

    deleteSubtaskFromTask(task, subtaskIndex);
    updateTaskInFirebase(taskId, task);
    removeSubtaskElement(taskId, subtaskIndex);
    updateSubtaskContainer();
}


function findTaskById(taskId) {
    return taskArray.find((t) => t.id === taskId);
}


function isValidTask(task) {
    if (!task || !task.subtasks) {
        console.error("Task oder Subtasks nicht gefunden!");
        return false;
    }
    return true;
}


function deleteSubtaskFromTask(task, subtaskIndex) {
    task.subtasks.splice(subtaskIndex, 1);
}


function updateTaskInFirebase(taskId, task) {
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
}


function removeSubtaskElement(taskId, subtaskIndex) {
    const subtaskElement = document.getElementById(
        `edit-subtask-${taskId}-${subtaskIndex + 1}`
    );
    if (subtaskElement) {
        subtaskElement.remove();
    }
}


function updateSubtaskContainer() {
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
    const updatedTask = prepareUpdatedTask(taskId);
    if (!updatedTask) return;

    try {
        await updateTaskOnServer(taskId, updatedTask);
        updateTaskHTML();
        closeEditTask();
    } catch (error) {
        console.error(`Fehler beim Aktualisieren der Task ${taskId}:`, error);
    }
}

function prepareUpdatedTask(taskId) {
    const newTitle = document.querySelector("#editTaskCard input").value;
    const newDescription = document.getElementById("editDescription").value;
    const newDate = document.getElementById("edit-due-date").value;
    const taskIndex = taskArray.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
        console.error(`Task mit ID ${taskId} nicht im taskArray gefunden.`);
        return null;
    }
    const updatedTask = { ...taskArray[taskIndex] };
    updatedTask.title = newTitle;
    updatedTask.description = newDescription;
    updatedTask.date = newDate;
    updatedTask.owner = prepareAssignedUsers();
    updatedTask.subtasks = extractSubtasksFromDOM();
    taskArray[taskIndex] = updatedTask;
    return updatedTask;
}

function prepareAssignedUsers() {
    return assignedUserArr.map((user) => ({
        ...user,
        initials: `${getFirstLetter(user.firstName)}${getFirstLetter(user.lastName)}`
    }));
}

function extractSubtasksFromDOM() {
    const subtaskElements = document.querySelectorAll(
        "#rendered-subtasks-edit .subtaskFontInEdit"
    );
    return Array.from(subtaskElements).map((subtaskElement) => ({
        subtask: subtaskElement.textContent.replace("• ", "").trim(),
        checkbox: false,
    }));
}

async function updateTaskOnServer(taskId, updatedTask) {
    await fetch(`${BASE_URL}/tasks/${taskId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
    });
}