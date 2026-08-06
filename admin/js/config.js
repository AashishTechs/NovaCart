// ==========================================================
// Centralized API configuration (admin panel)
// Every admin JS file should read API_BASE_URL from here instead
// of hardcoding "http://localhost:5000".
// ==========================================================

const API_BASE_URL = "http://localhost:5000";

// ==========================================================
// Normalize a product image path before saving it.
// Full URLs, data URIs, and already-root-absolute paths are left
// untouched. A bare relative path like "images/laptop.jpg" is
// converted to a root-absolute one ("/images/laptop.jpg") so it
// resolves correctly from ANY page depth (storefront root, /admin/,
// or any future subfolder) with no per-page "../" hacks needed.
// ==========================================================

function normalizeImagePath(path) {

    if (!path) return path;

    if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("/")) {
        return path;
    }

    return "/" + path;

}
