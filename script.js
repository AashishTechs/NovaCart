// =========================
// Mobile Menu Toggle
// =========================

const menuToggle = document.querySelector(".menu-toggle");
const navLinksEl = document.querySelector(".nav-links");

if (menuToggle && navLinksEl) {
    menuToggle.addEventListener("click", () => {
        navLinksEl.classList.toggle("active");
        const icon = menuToggle.querySelector("i");
        if (icon) {
            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");
        }
    });

    // Close mobile menu when a link is clicked
    navLinksEl.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => navLinksEl.classList.remove("active"));
    });
}

// =========================
// Sticky Header Shadow on Scroll
// =========================

const siteHeader = document.querySelector("header");

if (siteHeader) {
    window.addEventListener("scroll", () => {
        siteHeader.classList.toggle("scrolled", window.scrollY > 10);
    });
}

// =========================
// Scroll Reveal Animations
// =========================

document.addEventListener("DOMContentLoaded", () => {
    const revealTargets = document.querySelectorAll(
        ".category-card, .product-card, .feature-card, .about-content, .contact, .order-card"
    );

    revealTargets.forEach(el => el.classList.add("reveal"));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealTargets.forEach(el => observer.observe(el));
});

// =========================
// Global Nav Cart Badge
// =========================

function updateNavCartCount() {
    const badge = document.getElementById("navCartCount");
    if (!badge) return;
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 1), 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
    } catch (e) {
        badge.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", updateNavCartCount);
window.addEventListener("storage", updateNavCartCount);

// =========================
// Product Card Click
// =========================

document.addEventListener("click", function (e) {

    // Wishlist button par click hua to card click nahi chalega
    if (e.target.closest(".wishlist-btn")) {
        return;
    }

    // Add to Cart button
    if (e.target.closest(".add-cart")) {
        return;
    }

    // View Details button
    if (e.target.tagName === "BUTTON" &&
        e.target.textContent.trim() === "View Details") {
        return;
    }

    const card = e.target.closest(".product-card");

    if (!card) return;

    const id = card.dataset.id;

    if (id) {
        window.location.href = `product-details.html?id=${id}`;
    }

});

// =========================
// Wishlist
// =========================

document.addEventListener("click", function (e) {

    const btn = e.target.closest(".wishlist-btn");

    if (!btn) return;

    e.stopPropagation();

    const icon = btn.querySelector("i");

    if (!icon) return;

    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");

    icon.style.color = icon.classList.contains("fa-solid") ? "red" : "";

    btn.classList.remove("pulsing");
    // force reflow so the animation can retrigger on repeated clicks
    void btn.offsetWidth;
    btn.classList.add("pulsing");
    setTimeout(() => btn.classList.remove("pulsing"), 500);

});

// =========================
// Quick View: close on Escape / outside click already handled in products.js
// =========================

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && typeof closeQuickView === "function") {
        closeQuickView();
    }
});

// =========================
// Back to Top Button
// =========================

(function setupBackToTop() {
    let btn = document.getElementById("backToTop");
    if (!btn) {
        btn = document.createElement("button");
        btn.id = "backToTop";
        btn.setAttribute("aria-label", "Back to top");
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        document.body.appendChild(btn);
    }
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
        btn.classList.toggle("show", window.scrollY > 400);
    });
})();

// =========================
// Flash Sale Countdown
// =========================

(function setupFlashCountdown() {
    const wrap = document.getElementById("flashCountdown");
    if (!wrap) return;

    // Ends 24h from first page load today (stored so it doesn't reset every refresh)
    let endTime = localStorage.getItem("flashSaleEnd");
    if (!endTime || Number(endTime) < Date.now()) {
        endTime = Date.now() + 1000 * 60 * 60 * 24; // 24 hours from now
        localStorage.setItem("flashSaleEnd", String(endTime));
    }
    endTime = Number(endTime);

    const hEl = wrap.querySelector(".c-hours");
    const mEl = wrap.querySelector(".c-mins");
    const sEl = wrap.querySelector(".c-secs");

    function tick() {
        const diff = Math.max(0, endTime - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (hEl) hEl.textContent = String(h).padStart(2, "0");
        if (mEl) mEl.textContent = String(m).padStart(2, "0");
        if (sEl) sEl.textContent = String(s).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);
})();
// =========================
// Password Show/Hide Toggle
// =========================

document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".pass-toggle");
    if (!toggle) return;
    const input = toggle.parentElement.querySelector("input");
    if (!input) return;
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    const icon = toggle.querySelector("i");
    if (icon) {
        icon.classList.toggle("fa-eye", !isPass);
        icon.classList.toggle("fa-eye-slash", isPass);
    }
});

// =========================
// Password Strength Meter (register page)
// =========================

(function setupPasswordStrength() {
    const pwd = document.getElementById("regPassword");
    const meter = document.getElementById("passStrength");
    if (!pwd || !meter) return;

    const bar = meter.querySelector(".ps-bar span");
    const label = meter.querySelector("small");

    pwd.addEventListener("input", () => {
        const val = pwd.value;
        let score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { pct: 0, text: "Password strength", cls: "" },
            { pct: 20, text: "Very weak", cls: "weak" },
            { pct: 40, text: "Weak", cls: "weak" },
            { pct: 60, text: "Fair", cls: "fair" },
            { pct: 80, text: "Good", cls: "good" },
            { pct: 100, text: "Strong", cls: "strong" },
        ];
        const lvl = levels[Math.min(score, 5)];
        bar.style.width = lvl.pct + "%";
        bar.className = "";
        if (lvl.cls) bar.classList.add(lvl.cls);
        label.textContent = val ? lvl.text : "Password strength";
    });
})();

// =========================
// Submit-button loading state (login / register)
// Purely visual — does not touch existing submit handlers or API calls.
// =========================

document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!(form.matches("#register-form") || form.matches(".login-box form"))) return;
    const btn = form.querySelector("button[type='submit']");
    if (!btn || btn.disabled) return;
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.disabled = true;
    btn.classList.add("btn-loading");
    btn.innerHTML = `<span class="spinner"></span> Please wait...`;
    // Safety net: re-enable after 8s in case of network hang
    setTimeout(() => {
        if (btn.disabled) {
            btn.disabled = false;
            btn.classList.remove("btn-loading");
            btn.textContent = btn.dataset.label;
        }
    }, 8000);
});
