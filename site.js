(function () {
    var root = document.documentElement;
    var button = document.getElementById("theme-toggle");
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

    label();
})();

(function () {
    if (location.protocol !== "https:" || location.host !== "wkaleem.github.io") return;

    var links = document.querySelectorAll("a[href]:not(.skip)");
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var url;
        try { url = new URL(link.href, location.href); } catch (e) { continue; }

        var label = (link.getAttribute("aria-label") || link.textContent).replace(/\s+/g, " ").trim();
        var category;
        var destination;
        if (url.protocol === "mailto:" || url.protocol === "tel:") {
            category = "Contact";
            destination = url.protocol === "mailto:" ? "email" : "phone";
            label = destination;
        } else if (url.protocol === "https:" || url.protocol === "http:") {
            var internal = url.origin === location.origin;
            destination = (internal ? "" : url.hostname) + url.pathname;
            if (internal && url.pathname === location.pathname && url.hash) {
                category = "Section";
                destination += url.hash;
            } else if (link.classList.contains("paper-link")) {
                category = "Paper";
                destination += ":" + label;
            } else if (/\.pdf$/i.test(url.pathname)) {
                category = "PDF";
            } else if (link.closest(".topnav")) {
                category = "Navigation";
            } else {
                category = internal ? "Page" : "External";
            }
        } else {
            continue;
        }

        link.setAttribute("data-goatcounter-click", "click:" + category + ":" + destination);
        link.setAttribute("data-goatcounter-title", category + ": " + (label || destination));
        link.setAttribute("data-goatcounter-referrer", location.pathname);
        link.setAttribute("data-goatcounter-no-session", "1");
    }

    var tracker = document.createElement("script");
    tracker.async = true;
    tracker.src = "https://gc.zgo.at/count.js";
    tracker.setAttribute("data-goatcounter", "https://waquarkaleem.goatcounter.com/count");
    tracker.setAttribute("data-goatcounter-settings", JSON.stringify({ path: location.pathname }));
    document.body.appendChild(tracker);
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
