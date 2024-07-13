/* Code from https://developers.google.com/sheets/api/quickstart/js */

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

import { loadView } from "./view.js";
import { API_KEY, CLIENT_ID, SPREADSHEET_ID } from "./config.js";
// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

export let tokenClient;
export let gapiInited = false;
export let gisInited = false;

function loadScript(src, onload) {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = onload;
  document.head.appendChild(script);
}

export function initGoogleAPIs() {
  loadScript("https://apis.google.com/js/api.js", gapiLoaded);
  loadScript("https://accounts.google.com/gsi/client", gisLoaded);
}

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
    scope: SCOPES,
  });

  // Check if there is a stored token in localStorage
  const storedToken = localStorage.getItem("oauth_token");
  if (storedToken) {
    gapi.client.setToken({ access_token: storedToken });
  }
  gapiInited = true;
  loadView();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    localStorage.setItem("oauth_token", resp.access_token);

    loadView();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 *  Sign out the user upon button click.
 */
export function handleLogoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");

    // Remove the token from localStorage
    localStorage.removeItem("oauth_token");
    loadView();
  }
}
