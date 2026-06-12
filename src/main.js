import { initCurrentYear } from "./current-year.js";
import { initCopyToClipboard } from "./copy-to-clipboard.js";

document.addEventListener("DOMContentLoaded", () => {
  initCurrentYear();
  initCopyToClipboard();
});
