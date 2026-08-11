// ==========================================================
// Admin Auth Guard
// Include this on every admin page (except login.html) BEFORE
// any page-specific script. Bounces anyone without a valid
// admin session back to the login page. This is a UX/defense-in-
// depth layer only — the real enforcement happens server-side in
// authMiddleware + requireAdmin, since anything client-side can
// be bypassed by a determined user.
// ==========================================================

(function () {

    const token = localStorage.getItem("token");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");

    if (!token || !admin || admin.role !== "admin") {

        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        window.location.href = "login.html";

    }

})();
