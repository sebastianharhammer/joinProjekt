/**
 * Includes HTML content into all elements that have the `w3-include-html` attribute.
 *
 * This function searches the DOM for all elements with the `w3-include-html` attribute,
 * fetches the specified HTML file via a Fetch request, and inserts the content into the respective
 * element. If the file is not found, an error message is displayed.
 * After including the HTML contents, the function waits for the `#header-user-name` element
 * to become available to load user data and set the active navigation link.
 *
 * @async
 * @function includeHTML
 * @returns {Promise<void>} - A Promise that resolves once all HTML contents are included.
 *
 * @example
 * // Calls the function to include HTML contents
 * includeHTML();
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    const file = element.getAttribute("w3-include-html");
    try {
      let resp = await fetch(file);
      if (resp.ok) {
        element.innerHTML = await resp.text();
      } else {
        element.innerHTML = "Page not found";
      }
    } catch (error) {
      console.error(`Error loading file ${file}:`, error);
      element.innerHTML = "Error loading content";
    }
  }
  waitForElement("#header-user-name", () => {
    headerGetUser();
  });
  setLinkActive();
}
