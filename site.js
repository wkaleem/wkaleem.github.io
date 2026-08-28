(function () {
    var root = document.documentElement;
    var button = document.getElementById("theme-toggle");
    var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (!button) return;

    function label() {
        button.textContent =
            root.getAttribute("data-theme") === "dark" ? "light mode" : "dark mode";
    }

    button.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
        label();
    });

    /* We follow the system only until the visitor has made a choice of their own. */
    if (query && query.addEventListener) {
        query.addEventListener("change", function (event) {
            var stored = null;
            try { stored = localStorage.getItem("theme"); } catch (e) {}
            if (stored === "dark" || stored === "light") return;
            root.setAttribute("data-theme", event.matches ? "dark" : "light");
            label();
        });
    }

    label();
})();

/* The page's own last-modified date, taken from the response header GitHub Pages
   sends, so it cannot go stale the way a hand-written date does. Prints nothing if
   the header is missing or scripting is off, which is better than a wrong claim. */
(function () {
    var el = document.getElementById("updated");
    if (!el) return;
    var d = new Date(document.lastModified);
    if (isNaN(d.getTime())) return;
    el.textContent = " Page updated " +
        d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) + ".";
})();
