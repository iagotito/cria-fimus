import { initGoogleAPIs } from "./gapi.js";
import { loadView } from "./view.js";

document.addEventListener("DOMContentLoaded", init);

function init() {
  initGoogleAPIs();
  loadView();
}
