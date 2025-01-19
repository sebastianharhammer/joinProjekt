/**
 * Handles the click on the dropdown menu.
 *
 * @function addTaskHandleDropdownClick
 * @param {Event} e - The triggering event.
 * @param {HTMLElement} optionsContainer - The container for dropdown options.
 * @returns {void}
 */
function addTaskHandleDropdownClick(e, optionsContainer) {
    const userContainer = e.target.closest(".assigned-user-container");
    if (userContainer) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    addTaskToggleOptionsDisplay(optionsContainer);
  }
  
  /**
   * Toggles the display of the dropdown menu.
   *
   * @function addTaskToggleOptionsDisplay
   * @param {HTMLElement} optionsContainer - The container for dropdown options.
   * @returns {void}
   */
  function addTaskToggleOptionsDisplay(optionsContainer) {
    const isOpen = optionsContainer.style.display === "block";
    optionsContainer.style.display = isOpen ? "none" : "block";
  }
  
  /**
   * Handles the click on a dropdown option.
   *
   * @function addTaskHandleOptionsClick
   * @param {Event} event - The triggering event.
   * @returns {void}
   */
  function addTaskHandleOptionsClick(event) {
    const userContainer = event.target.closest(".assigned-user-container");
    if (!userContainer) return;
    event.stopPropagation();
    const userData = addTaskGetUserData(userContainer);
    addTaskToggleUserSelection(userContainer, userData);
    showAssignedUsers();
  }
  
  /**
   * Gets the user data from a user container.
   *
   * @function addTaskGetUserData
   * @param {HTMLElement} userContainer - The user's container.
   * @returns {Object} The user data.
   */
  function addTaskGetUserData(userContainer) {
    return {
      firstName: userContainer.dataset.firstname,
      lastName: userContainer.dataset.lastname,
      color: userContainer.dataset.color,
    };
  }
  
  /**
   * Toggles user selection based on user data.
   *
   * @function addTaskToggleUserSelection
   * @param {HTMLElement} userContainer - The user's container.
   * @param {Object} userData - The user's data.
   * @returns {void}
   */
  function addTaskToggleUserSelection(userContainer, userData) {
    const checkbox = userContainer.querySelector('input[type="checkbox"]');
    const userIndex = addTaskFindUserIndex(userData);
    if (userIndex > -1) {
      addTaskRemoveUser(userIndex, userContainer, checkbox);
    } else {
      addTaskAddUser(userData, userContainer, checkbox);
    }
  }
  
  /**
   * Finds the index of a user in the `assignedUserArr` array.
   *
   * @function addTaskFindUserIndex
   * @param {Object} userData - The user's data.
   * @returns {number} The user's index or `-1` if not found.
   */
  function addTaskFindUserIndex(userData) {
    return assignedUserArr.findIndex(
      (user) =>
        user.firstName === userData.firstName &&
        user.lastName === userData.lastName
    );
  }
  
  /**
   * Removes a user from the selection.
   *
   * @function addTaskRemoveUser
   * @param {number} userIndex - The user's index in the array.
   * @param {HTMLElement} userContainer - The user's container.
   * @param {HTMLInputElement} checkbox - The user's checkbox.
   * @returns {void}
   */
  function addTaskRemoveUser(userIndex, userContainer, checkbox) {
    assignedUserArr.splice(userIndex, 1);
    if (checkbox) checkbox.checked = false;
    addTaskResetUserContainerStyle(userContainer);
  }
  
  /**
   * Adds a user to the selection.
   *
   * @function addTaskAddUser
   * @param {Object} userData - The user's data.
   * @param {HTMLElement} userContainer - The user's container.
   * @param {HTMLInputElement} checkbox - The user's checkbox.
   * @returns {void}
   */
  function addTaskAddUser(userData, userContainer, checkbox) {
    assignedUserArr.push({
      firstName: userData.firstName,
      lastName: userData.lastName,
      initials: `${getFirstLetter(userData.firstName)}${getFirstLetter(
        userData.lastName
      )}`,
      color: userData.color,
    });
    if (checkbox) checkbox.checked = true;
    addTaskSetSelectedUserContainerStyle(userContainer);
  }
  
  /**
   * Resets the appearance of the user container.
   *
   * @function addTaskResetUserContainerStyle
   * @param {HTMLElement} container - The user's container.
   * @returns {void}
   */
  function addTaskResetUserContainerStyle(container) {
    container.style.backgroundColor = "";
    container.style.color = "";
    container.style.borderRadius = "";
  }
  
  /**
   * Sets the appearance of the selected user container.
   *
   * @function addTaskSetSelectedUserContainerStyle
   * @param {HTMLElement} container - The user's container.
   * @returns {void}
   */
  function addTaskSetSelectedUserContainerStyle(container) {
    container.style.backgroundColor = "#2b3647";
    container.style.color = "white";
    container.style.borderRadius = "10px";
  }
  

  
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
   * Fetches user contacts from Firebase.
   *
   * @async
   * @function getUsers
   * @returns {Promise<void>}
   */
  async function getUsers() {
    try {
      const response = await fetch(`${ADD_TASK_BASE_URL}/contacts/.json`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseToJson = await response.json();
  
      finalContacts = responseToJson || {};
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
    returnArrayContacts();
  }
  
  /**
   * Converts contact data to an array and renders dropdown options.
   *
   * @function returnArrayContacts
   * @returns {void}
   */
  function returnArrayContacts() {
    if (!finalContacts || Object.keys(finalContacts).length === 0) {
      console.error("No contacts found.");
      return;
    }
    const dropdown = document.getElementById("custom-dropdown");
    const optionsContainer = dropdown.querySelector(".dropdown-options");
    optionsContainer.innerHTML = "";
    renderContactOptions(optionsContainer);
  }
  
  /**
   * Renders contact options in the dropdown menu.
   *
   * @function renderContactOptions
   * @param {HTMLElement} optionsContainer - The container for dropdown options.
   * @returns {void}
   */
  function renderContactOptions(optionsContainer) {
    const contactsArray = Object.values(finalContacts);
    contactsArray.forEach((contactInDrop) => {
      if (!isValidContact(contactInDrop)) return;
      createContactOption(contactInDrop, optionsContainer);
    });
  }
  
  /**
   * Checks if a contact is valid.
   *
   * @function isValidContact
   * @param {Object} contact - The contact to check.
   * @returns {boolean} True if the contact is valid, false otherwise.
   */
  function isValidContact(contact) {
    return contact && contact.firstName && contact.lastName;
  }
  
  /**
   * Creates and adds a single contact option.
   *
   * @function createContactOption
   * @param {Object} contact - The contact data.
   * @param {HTMLElement} container - The container for the option.
   * @returns {void}
   */
  function createContactOption(contact, container) {
    const optionHTML = assignUserHTML(contact);
    const optionElement = document.createElement("div");
    optionElement.classList.add("dropdown-contact");
    optionElement.innerHTML = optionHTML;
    container.appendChild(optionElement);
  }
  
  /**
   * Adds a user to the selection if not already selected.
   *
   * @function assignUser
   * @param {string} firstName - The user's first name.
   * @param {string} lastName - The user's last name.
   * @param {string} color - The user's color.
   * @returns {void}
   */
  function assignUser(firstName, lastName, color) {
    const userExists = assignedUserArr.some(
      (user) => user.firstName === firstName && user.lastName === lastName
    );
    if (!userExists) {
      assignedUserArr.push({
        firstName: firstName,
        lastName: lastName,
        initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
        color: color,
      });
      showAssignedUsers();
    }
  }
  
  /**
   * Displays the assigned users.
   *
   * @function showAssignedUsers
   * @returns {void}
   */
  function showAssignedUsers() {
    const assignUsers = document.getElementById("assigned-users-short");
    if (assignUsers) {
      assignUsers.innerHTML = "";
      for (let i = 0; i < assignedUserArr.length; i++) {
        assignUsers.innerHTML += showAssignedUsersHTML(assignedUserArr[i]);
      }
    } else {
      console.error("Element mit ID 'assigned-users-short' nicht gefunden.");
    }
  }
  
  /**
   * Gets the first letter of a name.
   *
   * @function getFirstLetter
   * @param {string} name - The name to get the first letter from.
   * @returns {string} The first letter of the name in uppercase.
   */
  function getFirstLetter(name) {
    return name.trim().charAt(0).toUpperCase();
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
  
  function toggleCategoryDropdown(categoryList, icon) {
    icon.style.transform = "rotate(180deg)";
    categoryList.innerHTML = "";
    
    if (!categoriesContainerClick) {
      openCategoryList(categoryList);
    } else {
      closeCategoryList(categoryList);
    }
  }
  
  function openCategoryList(categoryList) {
    categoriesContainerClick = true;
    categoryList.style.border = "1px solid #CDCDCD";
    renderAddTaskCategories();
  }
  
  function closeCategoryList(categoryList) {
    categoriesContainerClick = false;
    categoryList.style.border = "0px";
    AddTaskCategories();
  }
  
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
        low: "green"
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