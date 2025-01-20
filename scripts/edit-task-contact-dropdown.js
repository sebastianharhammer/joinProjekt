/**
 * Retrieves users for the edit dropdown from Firebase.
 */
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
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
  editReturnArrayContacts();
  setupEditDropdownInteraction();
}

/**
 * Sets up interactions for the edit dropdown.
 */
function setupEditDropdownInteraction() {
  const dropdown = document.getElementById("custom-dropdown-edit");
  const optionsContainer = dropdown.querySelector(".dropdown-options-edit");
  editSetupDropdownClick(dropdown, optionsContainer);
  editSetupOptionsContainerClick(optionsContainer);
  editSetupDocumentClick(dropdown, optionsContainer);
}

/**
 * Sets up the click listener for the edit dropdown.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editSetupDropdownClick(dropdown, optionsContainer) {
  dropdown.addEventListener("click", (e) => {
    if (e.target.closest(".assigned-user-container-edit")) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    editToggleOptionsDisplay(optionsContainer);
  });
}

/**
 * Toggles the display of the edit options dropdown.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editToggleOptionsDisplay(optionsContainer) {
  const isOpen = optionsContainer.style.display === "block";
  optionsContainer.style.display = isOpen ? "none" : "block";
}

/**
 * Sets up the click listener for the edit options container.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editSetupOptionsContainerClick(optionsContainer) {
  optionsContainer.addEventListener("click", (event) => {
    const userContainer = event.target.closest(".assigned-user-container-edit");
    if (!userContainer) return;
    event.stopPropagation();
    editHandleUserSelection(userContainer);
  });
}

/**
 * Handles user selection in the edit dropdown.
 * @param {HTMLElement} userContainer - The container of the selected user.
 */
function editHandleUserSelection(userContainer) {
  const checkbox = userContainer.querySelector('input[type="checkbox"]');
  const firstName = userContainer.dataset.firstname;
  const lastName = userContainer.dataset.lastname;
  const color = userContainer.dataset.color;
  checkbox.checked = !checkbox.checked;
  editUpdateUserAssignment(userContainer, firstName, lastName, color);
}

/**
 * Updates user assignment based on selection.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
 */
function editUpdateUserAssignment(userContainer, firstName, lastName, color) {
  const userIndex = assignedUserArr.findIndex(
    (user) => user.firstName === firstName && user.lastName === lastName
  );

  if (userIndex > -1) {
    editRemoveUser(userContainer, userIndex);
  } else {
    editAddUser(userContainer, firstName, lastName, color);
  }
  showAssignedUsersEdit();
}

/**
 * Removes a user from the assignment and resets the styling.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {number} userIndex - The index of the user in the array.
 */
function editRemoveUser(userContainer, userIndex) {
  assignedUserArr.splice(userIndex, 1);
  editResetUserContainerStyle(userContainer);
}

/**
 * Resets the styling of the user container.
 * @param {HTMLElement} userContainer - The container of the user.
 */
function editResetUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = "";
  userContainer.style.color = "";
  userContainer.style.borderRadius = "";
}

/**
 * Adds a user to the assignment and sets the styling.
 * @param {HTMLElement} userContainer - The container of the user.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
 */
function editAddUser(userContainer, firstName, lastName, color) {
  assignedUserArr.push({
    firstName,
    lastName,
    initials: `${getFirstLetter(firstName)}${getFirstLetter(lastName)}`,
    color,
  });
  editSetSelectedUserContainerStyle(userContainer);
}

/**
 * Sets the styling of a selected user container.
 * @param {HTMLElement} userContainer - The container of the user.
 */
function editSetSelectedUserContainerStyle(userContainer) {
  userContainer.style.backgroundColor = "#2b3647";
  userContainer.style.color = "white";
  userContainer.style.borderRadius = "10px";
}

/**
 * Sets up the global click listener to close the dropdown when clicking outside.
 * @param {HTMLElement} dropdown - The dropdown element.
 * @param {HTMLElement} optionsContainer - The container for the options.
 */
function editSetupDocumentClick(dropdown, optionsContainer) {
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      optionsContainer.style.display = "none";
    }
  });
}

/**
 * Assigns a user in the edit dropdown.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} color - The user's color.
 */
function assignUserEdit(firstName, lastName, color) {
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
    showAssignedUsersEdit();
  }
}

/**
 * Converts the contact list into an array and renders the dropdown options for editing.
 */
function editReturnArrayContacts() {
  if (!editValidateContacts()) return;
  const dropdownEdit = document.getElementById("custom-dropdown-edit");
  const optionsContainerEdit = dropdownEdit.querySelector(
    ".dropdown-options-edit"
  );
  optionsContainerEdit.innerHTML = "";
  const contactsArray = Object.values(finalContacts);
  contactsArray.forEach((contactInDrop) => {
    if (!editValidateContact(contactInDrop)) return;
    const userContainerEdit = editCreateUserContainer(contactInDrop);
    optionsContainerEdit.appendChild(userContainerEdit);
  });
}

/**
 * Validates whether contacts exist.
 * @returns {boolean} Returns true if contacts exist.
 */
function editValidateContacts() {
  if (!finalContacts || Object.keys(finalContacts).length === 0) {
    console.error("No contacts found.");
    return false;
  }
  return true;
}

/**
 * Validates a single contact.
 * @param {Object} contact - The contact.
 * @returns {boolean} Returns true if the contact is valid.
 */
function editValidateContact(contact) {
  return contact && contact.firstName && contact.lastName;
}

/**
 * Creates a user container for the edit dropdown.
 * @param {Object} contact - The contact.
 * @returns {HTMLElement} The created user container.
 */
function editCreateUserContainer(contact) {
  const userContainerEdit = document.createElement("div");
  userContainerEdit.classList.add("assigned-user-container-edit");
  editSetUserContainerData(userContainerEdit, contact);
  const isAssigned = editCheckIfUserAssigned(contact);
  if (isAssigned) {
    editStyleAssignedUser(userContainerEdit);
  }

  userContainerEdit.innerHTML = assignUserEditHTML(contact, isAssigned);
  return userContainerEdit;
}

/**
 * Sets the data attributes for the user container.
 * @param {HTMLElement} container - The user container.
 * @param {Object} contact - The contact.
 */
function editSetUserContainerData(container, contact) {
  container.dataset.firstname = contact.firstName;
  container.dataset.lastname = contact.lastName;
  container.dataset.color = contact.color;
}

/**
 * Checks if a user is already assigned.
 * @param {Object} contact - The contact.
 * @returns {boolean} Returns true if the user is already assigned.
 */
function editCheckIfUserAssigned(contact) {
  return assignedUserArr.some(
    (user) =>
      user.firstName === contact.firstName && user.lastName === contact.lastName
  );
}

/**
 * Restores the styling of an assigned user.
 * @param {HTMLElement} container - The user container.
 */
function editStyleAssignedUser(container) {
  container.style.backgroundColor = "#2b3647";
  container.style.color = "white";
  container.style.borderRadius = "10px";
}

/**
 * Displays the assigned users in the edit view.
 */
function showAssignedUsersEdit() {
  let assignUsersEdit = document.getElementById("assigned-users-short-edit");
  assignUsersEdit.innerHTML = "";
  for (let i = 0; i < assignedUserArr.length; i++) {
    assignUsersEdit.innerHTML += showAssignedUsersEditHTML(assignedUserArr[i]);
  }
}

/**
 * Closes the edit dropdown.
 */
function closeDropdownEdit() {
  const optionsContainer = document.getElementById("dropdown-options-edit");
  optionsContainer.style.display = "none";
}

/**
 * Toggles the display of an edit dropdown.
 * @param {HTMLElement} editOptionsContainer - The container of the edit options.
 */
function toggleDropdown(editOptionsContainer) {
  const isDropdownOpen = editOptionsContainer.style.display === "block";
  editOptionsContainer.style.display = isDropdownOpen ? "none" : "block";
}

/**
 * Closes the edit dropdown if clicked outside.
 * @param {HTMLElement} editDropdown - The dropdown element.
 * @param {HTMLElement} editOptionsContainer - The container of the edit options.
 * @param {EventTarget} target - The target of the click event.
 */
function closeDropdownIfClickedOutside(
  editDropdown,
  editOptionsContainer,
  target
) {
  if (!editDropdown.contains(target)) {
    editOptionsContainer.style.display = "none";
  }
}

/**
 * Creates a dropdown option for a contact.
 * @param {Object} contact - The contact.
 * @param {boolean} isChecked - Indicates if the option is already selected.
 * @returns {HTMLElement} The created option element.
 */
function createDropdownOption(contact, isChecked) {
  const optionElement = document.createElement("div");
  optionElement.classList.add("dropdown-contact-edit");
  optionElement.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  const circleDiv = createContactCircle(contact);
  const nameSpan = createContactNameSpan(contact);
  const checkboxLabel = createCheckboxLabel(contact, isChecked);
  optionElement.appendChild(circleDiv);
  optionElement.appendChild(nameSpan);
  optionElement.appendChild(checkboxLabel);
  return optionElement;
}

/**
 * Creates a span element with a contact's name.
 * @param {Object} contact - The contact.
 * @returns {HTMLElement} The created span element.
 */
function createContactNameSpan(contact) {
  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${contact.firstName} ${contact.lastName}`;
  return nameSpan;
}

/**
 * Creates a label with a checkbox for a contact.
 * @param {Object} contact - The contact.
 * @param {boolean} isChecked - Indicates if the checkbox is selected.
 * @returns {HTMLElement} The created label element.
 */
function createCheckboxLabel(contact, isChecked) {
  const checkboxLabel = createEditLabel();
  const checkbox = createEditCheckbox(isChecked, contact);
  const checkboxSquare = createEditCheckboxSquare();
  assembleEditLabel(checkboxLabel, checkbox, checkboxSquare);
  return checkboxLabel;
}

/**
 * Creates a label element for a checkbox.
 * @returns {HTMLElement} The created label element.
 */
function createEditLabel() {
  const label = document.createElement("label");
  label.classList.add("contact-checkbox-edit-label");
  return label;
}

/**
 * Creates a checkbox for the edit view.
 * @param {boolean} isChecked - Indicates if the checkbox is selected.
 * @param {Object} contact - The contact.
 * @returns {HTMLInputElement} The created checkbox.
 */
function createEditCheckbox(isChecked, contact) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("contact-checkbox-edit");
  checkbox.checked = isChecked;
  checkbox.addEventListener("change", (event) => {
    event.stopPropagation();
    handleEditContactSelection(
      contact.firstName,
      contact.lastName,
      checkbox.checked
    );
  });
  return checkbox;
}

/**
 * Creates a span element for the checkbox.
 * @returns {HTMLElement} The created span element.
 */
function createEditCheckboxSquare() {
  const span = document.createElement("span");
  span.classList.add("checkboxSquare");
  return span;
}

/**
 * Appends the checkbox and checkbox span element to the label.
 * @param {HTMLElement} label - The label element.
 * @param {HTMLInputElement} checkbox - The checkbox.
 * @param {HTMLElement} checkboxSquare - The span element for the checkbox.
 */
function assembleEditLabel(label, checkbox, checkboxSquare) {
  label.appendChild(checkbox);
  label.appendChild(checkboxSquare);
}

/**
 * Creates a circle with a contact's initials.
 * @param {Object} contact - The contact.
 * @returns {HTMLElement} The created circle div.
 */
function createContactCircle(contact) {
  const circleDiv = document.createElement("div");
  circleDiv.classList.add("contact-circle-edit");
  circleDiv.style.backgroundColor = getRandomColor(
    contact.firstName,
    contact.lastName
  );
  circleDiv.textContent = `${getFirstLetter(contact.firstName)}${getFirstLetter(
    contact.lastName
  )}`;
  return circleDiv;
}

/**
 * Handles the selection of a contact in the edit dropdown.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {boolean} isChecked - Indicates if the contact is selected.
 */
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
  updateAssignedUsersDisplay();
}

/**
 * Updates the display of assigned users.
 */
function updateAssignedUsersDisplay() {
  const assignedUsersContainer = document.getElementById(
    "assigned-users-short-edit"
  );
  assignedUsersContainer.innerHTML = "";
  assignedUserArr.forEach((user) => {
    const color = getRandomColor(user.firstName, user.lastName);
    const initials = `${getFirstLetter(user.firstName)}${getFirstLetter(
      user.lastName
    )}`;
    assignedUsersContainer.innerHTML += createAssignedUserHTML(color, initials);
  });
}

/**
 * Generates a random color based on a user's name.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @returns {string} The generated color.
 */
function getRandomColor(firstName, lastName) {
  const contact = finalContacts.find(
    (c) => c.firstName === firstName && c.lastName === lastName
  );
  return contact?.color || "gray";
}
