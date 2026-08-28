(function () {
    var root = document.documentElement;
    var button = document.getElementById("theme-toggle");
    var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (!button) return;

    function label() {
        button.textContent =
            root.getAttribute("data-theme") === "dark" ? "light mode" : "dark mode";
    }

    button.addEventListener("click", function (event) {
        event.preventDefault();
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
