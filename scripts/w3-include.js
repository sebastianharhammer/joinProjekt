/**
 * Inkludiert HTML-Inhalte in alle Elemente, die das Attribut `w3-include-html` besitzen.
 *
 * Diese Funktion durchsucht das DOM nach allen Elementen mit dem Attribut `w3-include-html`,
 * lädt die angegebene HTML-Datei über eine Fetch-Anfrage und fügt den Inhalt in das jeweilige
 * Element ein. Falls die Datei nicht gefunden wird, wird eine Fehlermeldung angezeigt.
 * Nach dem Inkludieren der HTML-Inhalte wartet die Funktion darauf, dass das Element
 * `#header-user-name` verfügbar ist, um Benutzerdaten zu laden und den aktiven Navigationslink zu setzen.
 *
 * @async
 * @function includeHTML
 * @returns {Promise<void>} - Ein Promise, das aufgelöst wird, sobald alle HTML-Inhalte inkludiert sind.
 *
 * @example
 * // Ruft die Funktion auf, um HTML-Inhalte zu inkludieren
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
      console.error(`Fehler beim Laden der Datei ${file}:`, error);
      element.innerHTML = "Error loading content";
    }
  }
  waitForElement("#header-user-name", () => {
    headerGetUser();
  });
  setLinkActive();
}
