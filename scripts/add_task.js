
let categoriesContainerClick = false;
let contacts = [];
let selectedPriority = "";
let subtasksArr = [];
let assignedUserArr = [];
let localTasks = [];
let subtaskIdCounter = 0;
let subtasksEdit = [];
let subtasksEdit_done = [];
let subtasksArr_done = [];
let categoryArr = [];
let categories = [
    {
      category: "User Story",
      "bg-color": "#0038FF",
    },
    {
      category: "Technical Task",
      "bg-color": "#1FD7C1",
    },
  ];
  let assignedUser = [];


function init() {
    getTasks();
    getUsers();
    includeHTML(); 
    renderAddTaskHTML();
}

async function createTask(status, event) {
    event.preventDefault();
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let date = document.getElementById('addTaskInputDueDate').value;
    const category = getCategory();
    const priority = selectedPriority;
    const subtasks = [...subtasksArr];
    const assignedUsers = assignedUser;
    if (!title || !description || !date || !priority || assignedUsers.length === 0) {
        console.error("All fields are required!");
        return;
    }
    try {
        const nextId = await getNextTaskId();
        let newTask = {
            id: nextId,
            status: "todo",
            title: title,
            description: description,
            date: date,
            taskCategory: category || "Undefined Category",
            prio: priority,
            subtasks: subtasks,
            owner: assignedUserArr,
        };

        taskArray.push(newTask); // Neuer Task wird in das taskArray gepusht
        await pushTaskToFirebase(newTask); // Warten, bis der Task erfolgreich gepusht wurde
        console.log('Task created:', newTask);
        console.log('Updated Task Array:', taskArray);
        window.location.href = "testboard.html";
    } catch (error) {
        console.error("Failed to create the task:", error);
    }
}



async function getNextTaskId() {
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
        const tasks = await response.json();
        const taskIds = tasks ? Object.values(tasks).map(task => task.id) : [];
        const maxId = taskIds.length > 0 ? Math.max(...taskIds) : 0; // Höchste vorhandene ID ermitteln
        return maxId + 1;
    } catch (error) {
        console.error("Failed to fetch tasks for ID generation:", error);
        return 20;
    }
}







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
        let responseToJson = await response.json();
        console.log("Task added or updated:", responseToJson);
    } catch (error) {
        console.error("Failed to add task:", error);
    }
}




function handleDropdownInteraction() {
    const dropdown = document.getElementById('custom-dropdown');
    const optionsContainer = dropdown.querySelector('.dropdown-options');
    const selectedUsers = [];

    dropdown.addEventListener('click', () => {
        const isOpen = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isOpen ? 'none' : 'block';
    });
    optionsContainer.addEventListener('change', (event) => {
        const checkbox = event.target;
        const userName = checkbox.parentElement.querySelector('span').textContent;

        if (checkbox.checked) {
            selectedUsers.push(userName);
        } else {
            const index = selectedUsers.indexOf(userName);
            if (index > -1) {
                selectedUsers.splice(index, 1);
            }
        }

        console.log('Selected users:', selectedUsers);
    });
}

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
        console.log("Array Tasks: " + localTasks)
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

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
        contacts = responseToJson;
        returnArrayContacts();
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}

function returnArrayContacts() {
    if (!contacts || contacts.length === 0) {
        console.error("No contacts found.");
        return;
    }

    const dropdown = document.getElementById('custom-dropdown');
    if (!dropdown) {
        console.error("Dropdown element not found.");
        return;
    }

    const optionsContainer = dropdown.querySelector('.dropdown-options');
    optionsContainer.innerHTML = ""; 

    contacts.forEach(contact => {

        if (!contact || !contact.firstName || !contact.lastName) {
            console.warn('Skipping invalid contact:', contact);
            return;
        }

        const option = document.createElement('div');
        option.classList.add('assigned-user');
        option.innerHTML = assignUserHTML(contact);
        optionsContainer.appendChild(option);
    });

    dropdown.addEventListener('click', () => {
        const isOpen = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isOpen ? 'none' : 'block';
    });


}
function assignUser(firstName, lastName) {
    assignedUser.push({
        "Firstname":firstName,
        "Lastname":lastName
    });
}

function showAssignedUsers() {
    let assignUsers = document.getElementById('assigned-users-short');
    for (let i=0; i < assignedUser.length; i++) {
        assignUsers.innerHTML += showAssignedUsersHTML(assignUsers[i]);
    }
}


function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
}

function getCategory() {
    return categoryArr[0];
}

function openCategories() {
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(180deg)";
    categoryList.innerHTML = "";
    if (!categoriesContainerClick) {
      categoriesContainerClick = true;
      categoryList.style.border = "1px solid #CDCDCD";
      renderCategories();
    } else {
      categoriesContainerClick = false;
      categoryList.style.border = "0px";
      hideCategories();
    }
    document.getElementById("categoryInput").classList.toggle("outline");
  }

  function hideCategories() {
    categoriesContainerClick = false;
    let categoryList = document.getElementById("dropDownCategoryMenu");
    let icon = document.getElementById("arrowDropMenuCategory");
    icon.style.transform = "rotate(0deg)";
    categoryList.innerHTML = "";
  }

  function renderCategories() {
    let categoryContainer = document.getElementById("dropDownCategoryMenu");
    categoryContainer.innerHTML = "";
  
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]["category"];
      const catColor = categories[i]["bg-color"];
  
      categoryContainer.innerHTML += `
          <div class="addtask-category" onclick="selectCategory('${category}', '${catColor}')">
            ${category}
          </div>
        `;
    }
  }
  function selectCategory(categoryTask, catColor) {
    let categoryInput = document.getElementById("categoryInput");
    let categoryList = document.getElementById("dropDownCategoryMenu");
  
    categoryInput.value = categoryTask;
    hideCategories();
    categoryList.style.border = "0px";
    categoryArr = [];
    categoryArr.push(categoryTask);
    categoryArr.push(catColor);
  }

function setPriority(priority) {
    const priorities = ['urgent', 'medium', 'low'];
    priorities.forEach((prio) => {
        const btn = document.getElementById(`prio-${prio}`);
        btn.classList.remove(prio === 'urgent' ? 'red' : prio === 'medium' ? 'yellow' : 'green');
    });
    const selectedButton = document.getElementById(`prio-${priority}`);
    selectedButton.classList.add(priority === 'urgent' ? 'red' : priority === 'medium' ? 'yellow' : 'green');
    selectedPriority = priority;
}

function addSubtask() {
    
        const subtaskInput = document.getElementById("subtaskInput");
        const subtasksContent = document.getElementById("subtasksContent");
      
        if (subtaskInput.value.trim() !== "") {
          subtaskIdCounter++;
          const liId = "subtask-" + subtaskIdCounter;
          const spanId = "span-" + subtaskIdCounter;
          const inputId = "input-" + subtaskIdCounter;
          const newSubtaskHTML = /*html*/ `
          <li id="${liId}" class="subtask-item">
              <div class="dot"></div>
              <div class="subtask-text">
                  <span id="${spanId}" onclick="editSubtask('${liId}', '${spanId}', '${inputId}')">${subtaskInput.value}</span>
              </div>
              <div class="subtask-icon">
                  <img onclick="editSubtask('${liId}', '${spanId}', '${inputId}')" src="../img/edit.svg" alt="edit">
                  <div class="divider"></div>
                  <img onclick="deleteSubtask('${liId}')" src="../img/delete.svg" alt="delete">
              </div>
          </li>
      `;
          subtasksArr.push({
            checkbox_img: "../assets/img/checkbox-empty.svg",
            subtask: `${subtaskInput.value}`,
          });
          subtasksEdit.push({
            checkbox_img: "../assets/img/checkbox-empty.svg",
            subtask: `${subtaskInput.value}`,
          });
          subtasksContent.innerHTML += newSubtaskHTML;
          subtaskInput.value = "";
        }
        document.getElementById("clear-add-icons").classList.add("d-none");
        document.getElementById("subtasks-plus-icon").classList.remove("d-none");
      
}

function editSubtask(liId, spanId, inputId) {
    const spanElement = document.getElementById(spanId);
    const li = document.getElementById(liId);
    const currentText = spanElement.textContent;
  
    const editSubtaskHTML = /*html*/ `
          <div class="subtask-input-wrapper edit-mode">
              <input id="${inputId}" class="edit-subtask-input" type="text" value="${currentText}">
              <div class="input-icons-edit">
                  <img src ="../assets/img/deletecopy.svg" onclick="deleteSubtask('${liId}')">
                  <div class="divider"></div>
                  <img src="../assets/img/check1.svg" onclick="saveSubtask('${liId}', '${inputId}', '${spanId}')">
              </div>
          </div>
      `;
}

function deleteSubtask(liId) {
    const li = document.getElementById(liId);
    li.remove();
  }


function showClearButton() {
    document.getElementById("clear-add-icons").classList.remove("d-none");
    document.getElementById("subtasks-plus-icon").classList.add("d-none");
  }

function clearSubtaskInput() {
    document.getElementById("subtaskInput").value = "";
}
