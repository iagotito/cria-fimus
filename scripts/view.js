import { print_country, print_state } from "./countries.js";
import { gapiInited, gisInited, handleAuthClick, handleLogoutClick } from "./gapi.js";
import { createSheet, logData } from "./sheets.js";

let main = document.getElementById("main");

async function fetchTemplate(url) {
  const response = await fetch(url);
  const text = await response.text();
  const temp = document.createElement("div");
  temp.innerHTML = text;
  return temp.querySelector("template");
}

export function loadView() {
  if (gapiInited && gisInited) {
    const token = gapi.client.getToken();
    if (token) {
      loadHomeView();
    } else {
      loadNotLoggedView();
    }
  }
}

async function loadHomeView(){
  const template = await fetchTemplate("templates/homeView.html");
  main.innerHTML = template.innerHTML;

  let test = document.getElementById("test");
  test.addEventListener("click", loadAppView);
}

async function loadNotLoggedView() {
  const template = await fetchTemplate("templates/notLoggedView.html");
  main.innerHTML = template.innerHTML;

  let signin = document.getElementById("signin");
  signin.addEventListener("click", handleAuthClick);
}

async function loadAppView() {
  const template = await fetchTemplate("templates/appView.html");
  main.innerHTML = template.innerHTML;

  let logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", handleLogoutClick);

  print_country("country");
  let country = document.getElementById("country");
  country.addEventListener("change", () => {
    print_state('state', country.selectedIndex);
  })

  setupBars();

  await createSheet("Sentimentos", 0);

  let submit = document.getElementById("submit");
  submit.addEventListener("click", sendData);
}

async function sendData() {
  let email = document.getElementById("email").value;
  let country = document.getElementById("country").value;
  let state = document.getElementById("state").value;
  let joy = document.getElementById("joy").value || 0;
  let hope = document.getElementById("hope").value || 0;
  let longing = document.getElementById("longing").value || 0;
  let created_at = Date.now();


  let data = [email, country, state, joy, hope, longing, created_at];

  await logData(data, "Sentimentos");
}


function setupBars() {
  document.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  function updateBar(bar, clientX) {
    const barWrapper = bar.parentElement;
    const barWidth = clientX - barWrapper.getBoundingClientRect().left;
    const containerWidth = barWrapper.clientWidth;
    let newValue = Math.max(0, Math.min(10, Math.round(barWidth / (containerWidth / 10))));

    bar.style.width = `${newValue * 10}%`;
    bar.value = newValue;
    bar.querySelector("span").textContent = newValue;
  }

  document.querySelectorAll(".bar-wrapper").forEach(wrapper => {
    wrapper.addEventListener("dragstart", (e) => {
      const emptyImage = new Image();
      e.dataTransfer.setDragImage(emptyImage, 0, 0);
      e.dataTransfer.setData("text/plain", null);
    });

    wrapper.addEventListener("drag", (e) => {
      let bar = e.target.className === "bar" ? e.target : e.target.querySelector(".bar");
      updateBar(bar, e.clientX);
    });

    wrapper.addEventListener("click", (e) => {
      let bar = e.target.className === "bar" ? e.target : e.target.querySelector(".bar");
      updateBar(bar, e.clientX);
    });
  });
}
