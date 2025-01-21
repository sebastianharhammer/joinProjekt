/**
 * Fetches tasks from Firebase and stores them in the global `localTasks` variable.
 *
 * @async
 * @function getTasks
 * @returns {Promise<void>}
 * @throws {Error} If the HTTP request fails
 */
async function getTasks() {
  try {
    const response = await fetch(`${ADD_TASK_BASE_URL}/testingTasks/.json`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseToJson = await response.json();
    localTasks = responseToJson;
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

/**
 * Fetches data from Firebase.
 * 
 * @async
 * @function fetchFromFirebase
 * @param {string} endpoint - The endpoint to fetch from
 * @returns {Promise<any>} The parsed response data
 * @throws {Error} If the HTTP request fails
 */
async function AddTaskfetchFromFirebase(endpoint) {
  const response = await fetch(`${ADD_TASK_BASE_URL}/${endpoint}/.json`, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches user contacts from Firebase.
 *
 * @async
 * @function getUsers
 * @returns {Promise<void>}
 */
async function AddTaskGetUsers() {
  try {
    finalContacts = await AddTaskfetchFromFirebase('contacts') || {};
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  returnArrayContacts();
}

/**
 * Gets the current category (placeholder function).
 *
 * @function getCategory
 * @returns {string} The current category.
 */
function getCategory() {
  return categoryArr[0];
}

/**
 * Opens the categories dropdown menu for adding a task.
 *
 * @function openAddTaskCategories
 * @returns {void}
 */
function openAddTaskCategories() {
  const categoryList = document.getElementById("dropDownCategoryMenu");
  const icon = document.getElementById("arrowDropMenuCategory");

  if (!categoryList || !icon) {
    console.error("Dropdown-Element oder Icon nicht gefunden.");
    return;
  }

  toggleCategoryDropdown(categoryList, icon);
  toggleCategoryInput();
}

/**
 * Toggles the category dropdown menu display.
 *
 * @function toggleCategoryDropdown
 * @param {HTMLElement} categoryList - The dropdown menu element
 * @param {HTMLElement} icon - The dropdown icon element
 * @returns {void}
 */
function toggleCategoryDropdown(categoryList, icon) {
  icon.style.transform = "rotate(180deg)";
  categoryList.innerHTML = "";

  if (!categoriesContainerClick) {
    openCategoryList(categoryList);
  } else {
    closeCategoryList(categoryList);
  }
}

/**
 * Opens the category list dropdown.
 *
 * @function openCategoryList
 * @param {HTMLElement} categoryList - The dropdown menu element
 * @returns {void}
 */
function openCategoryList(categoryList) {
  categoriesContainerClick = true;
  categoryList.style.border = "1px solid #CDCDCD";
  renderAddTaskCategories();
}

/**
 * Closes the category list dropdown.
 *
 * @function closeCategoryList
 * @param {HTMLElement} categoryList - The dropdown menu element
 * @returns {void}
 */
function closeCategoryList(categoryList) {
  categoriesContainerClick = false;
  categoryList.style.border = "0px";
  AddTaskCategories();
}

/**
 * Toggles the category input field outline.
 *
 * @function toggleCategoryInput
 * @returns {void}
 */
function toggleCategoryInput() {
  const categoryInput = document.getElementById("categoryInput");
  if (categoryInput) {
    categoryInput.classList.toggle("outline");
  }
}

/**
 * Hides the categories dropdown menu.
 *
 * @function hideAddTaskCategories
 * @returns {void}
 */
function hideAddTaskCategories() {
  categoriesContainerClick = false;
  const categoryList = document.getElementById("dropDownCategoryMenu");
  const icon = document.getElementById("arrowDropMenuCategory");
  if (icon && categoryList) {
    icon.style.transform = "rotate(0deg)";
    categoryList.innerHTML = "";
  } else {
    console.error("Dropdown-Element oder Icon nicht gefunden.");
  }
}

/**
 * Renders the available categories in the dropdown menu.
 *
 * @function renderAddTaskCategories
 * @returns {void}
 */
function renderAddTaskCategories() {
  const categoryContainer = document.getElementById("dropDownCategoryMenu");
  if (categoryContainer) {
    for (let i = 0; i < addTaskcategories.length; i++) {
      const category = addTaskcategories[i]["category"];
      categoryContainer.innerHTML += renderAddTaskCategoriesHTML(category);
    }
  } else {
    console.error("Element mit ID 'dropDownCategoryMenu' nicht gefunden.");
  }
}

/**
 * Selects a category and sets it as the current category.
 *
 * @function selectAddTaskCategory
 * @param {string} categoryTask - The selected category.
 * @returns {void}
 */
function selectAddTaskCategory(categoryTask) {
  const categoryInput = document.getElementById("categoryInput");
  const categoryList = document.getElementById("dropDownCategoryMenu");
  if (categoryInput) {
    categoryInput.value = categoryTask;
  }
  hideAddTaskCategories();
  if (categoryList) {
    categoryList.style.border = "0px";
  }
  categoryObject = categoryTask;
}

/**
 * Sets the priority of a task and updates the UI accordingly.
 *
 * @function setPriority
 * @param {string} priority - The selected priority ("urgent", "medium", "low")
 * @returns {void}
 */
function setPriority(priority) {
  resetAllPriorityButtons();
  updateSelectedPriority(priority);
  updateTaskPriority(priority);
}

/**
 * Resets all priority buttons to their initial state.
 *
 * @function resetAllPriorityButtons
 * @returns {void}
 */
function resetAllPriorityButtons() {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    const btn = document.getElementById(`prio-${prio}`);
    const img = document.getElementById(`prio-image-${prio}`);
    if (btn) {
      btn.classList.remove("red", "yellow", "green");
    }
    if (img) {
      img.classList.remove("sat-0");
    }
  });
}

/**
 * Updates the selected priority button with the corresponding color.
 *
 * @function updateSelectedPriority
 * @param {string} priority - The selected priority ("urgent", "medium", "low")
 * @returns {void}
 */
function updateSelectedPriority(priority) {
  const selectedButton = document.getElementById(`prio-${priority}`);
  const selectedImg = document.getElementById(`prio-image-${priority}`);
  if (selectedButton && selectedImg) {
    const colorMap = {
      urgent: "red",
      medium: "yellow",
      low: "green",
    };
    selectedButton.classList.add(colorMap[priority]);
    selectedImg.classList.add("sat-0");
    selectedPriority = priority;
  } else {
    console.error("Prioritäts-Button oder -Bild nicht gefunden.");
  }
}

/**
 * Updates the priority of the currently edited task.
 *
 * @function updateTaskPriority
 * @param {string} priority - The new priority ("urgent", "medium", "low")
 * @returns {void}
 */
function updateTaskPriority(priority) {
  const task = taskArray.find((t) => t.id === currentTaskBeingEdited);
  if (task) {
    task.prio = priority;
  }
}
