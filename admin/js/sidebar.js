console.log("sidebar.js loaded");
const menuToggle = document.getElementById("menuToggle");

const sidebar = document.querySelector(".sidebar");

const mainContent =
    document.querySelector(".main-content") ||
    document.querySelector(".main");


// =========================
// Menu Toggle
// =========================

if (menuToggle && sidebar) {

    menuToggle.addEventListener("click", () => {

        sidebar.classList.toggle("active");

        if (mainContent) {
            mainContent.classList.toggle("active");
        }

    });

}



// =========================
// Logout
// =========================

const logoutBtn = document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener("click", function(e){

        e.preventDefault();


        localStorage.removeItem("token");

        localStorage.removeItem("user");


        alert("Logout Successfully!");


        window.location.href = "login.html";

    });

}