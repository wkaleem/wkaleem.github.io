(function () {
    var root = document.documentElement;
    var button = document.getElementById("theme-toggle");
    var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (!button) return;

    /* The icons live in the markup, so only the hidden name is rewritten. Writing
       textContent here would delete them. */
    function label() {
        var name = button.querySelector(".visually-hidden");
        if (name) {
            name.textContent =
                root.getAttribute("data-theme") === "dark" ? "light mode" : "dark mode";
        }
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

/* Sections rise as they come into view. The staging class is set here rather than in
   the head, so that a page whose script never arrives is never left staged and
   invisible: no script, nothing hidden. Anything already on screen is marked shown in
   the same tick, before the browser paints, so the opening view does not flash. */
(function () {
    if (!("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll("main .reveal");
    if (!items.length) return;

    var fold = window.innerHeight || document.documentElement.clientHeight;
    var waiting = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top < fold) items[i].classList.add("shown");
        else waiting.push(items[i]);
    }
    document.documentElement.className = "js-reveal";
    if (!waiting.length) return;

    var watcher = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
            if (!entries[j].isIntersecting) continue;
            entries[j].target.classList.add("shown");
            watcher.unobserve(entries[j].target);
        }
    }, { rootMargin: "0px 0px -8% 0px" });
    for (var k = 0; k < waiting.length; k++) watcher.observe(waiting[k]);
})();


/* A film is only fetched from YouTube when a reader asks for it. Until the button is
   pressed the page has made no third-party request at all, which is the whole point
   of drawing the panel ourselves. nocookie is used for the same reason. */
(function () {
    var buttons = document.querySelectorAll(".film-play");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            var id = this.getAttribute("data-id");
            if (!id) return;
            var frame = document.createElement("iframe");
            frame.src = "https://www.youtube-nocookie.com/embed/" + id +
                "?autoplay=1&rel=0";
            frame.title = this.getAttribute("aria-label") || "Film";
            frame.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture";
            frame.referrerPolicy = "strict-origin-when-cross-origin";
            frame.allowFullscreen = true;
            this.parentNode.replaceChild(frame, this);
        });
    }
})();
