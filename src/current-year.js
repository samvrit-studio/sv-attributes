export function initCurrentYear() {
  // Select all elements with the sv-current-year attribute
  const elements = document.querySelectorAll("[sv-current-year]");
  // Replace the element's text with the current year
  elements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}
