const UNIVERSAL_PASSWORD = "2004";
const form = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#password");
const error = document.querySelector("#loginError");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value === UNIVERSAL_PASSWORD) {
    sessionStorage.setItem("familyArchiveAccess", "granted");
    window.location.replace("index.html");
    return;
  }
  error.hidden = false;
  passwordInput.select();
});