// ==========================================================
// Admin Logout
// Handles both button id conventions used across the admin pages
// ("logout" and "logoutBtn").
// ==========================================================

function handleAdminLogout(e) {

    e.preventDefault();

    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    localStorage.removeItem("adminLoggedIn");

    window.location.href = "login.html";

}

const logoutEl = document.getElementById("logout");
const logoutBtnEl = document.getElementById("logoutBtn");

if (logoutEl) {
    logoutEl.addEventListener("click", handleAdminLogout);
}

if (logoutBtnEl) {
    logoutBtnEl.addEventListener("click", handleAdminLogout);
}
