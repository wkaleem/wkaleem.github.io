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

/* Tabs remain usable when rotation is paused; without JavaScript all figures show. */
(function () {
    var carousel = document.querySelector(".thrust-carousel");
    if (!carousel) return;
    var tablist = carousel.querySelector(".thrust-tabs");
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll("button"));
    var panels = Array.prototype.slice.call(carousel.querySelectorAll(".thrust-slide"));
    var panelBox = carousel.querySelector(".thrust-panels");
    var playback = document.getElementById("thrust-playback");
    if (!tabs.length || tabs.length !== panels.length || !playback) return;
    var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var active = 0;
    var rotating = !motion.matches;
    var hovered = false;
    var focused = false;
    var visible = false;
    var timer = null;

    function schedule() {
        window.clearTimeout(timer);
        if (!rotating || hovered || focused || !visible || document.hidden) return;
        timer = window.setTimeout(function () {
            select(active + 1, false);
            schedule();
        }, 5000);
    }

    function rotation(enabled) {
        rotating = enabled;
        playback.textContent = enabled ? "Pause" : "Play";
        playback.setAttribute("aria-label", enabled ? "Pause automatic research slides" : "Play automatic research slides");
        schedule();
    }

    function select(index, focus) {
        active = (index + tabs.length) % tabs.length;
        for (var i = 0; i < tabs.length; i++) {
            var selected = i === active;
            tabs[i].setAttribute("aria-selected", String(selected));
            tabs[i].tabIndex = selected ? 0 : -1;
            panels[i].classList.toggle("is-active", selected);
            panels[i].hidden = !selected;
            panels[i].inert = !selected;
        }
        if (focus) tabs[active].focus();
    }

    /* Reserve the tallest panel so switching tabs never moves the content below. */
    function measure() {
        panelBox.style.minHeight = "0";
        panels.forEach(function (panel) { panel.hidden = false; });
        var height = Math.max.apply(null, panels.map(function (panel) {
            return panel.getBoundingClientRect().height;
        }));
        panelBox.style.minHeight = Math.ceil(height) + "px";
        panels.forEach(function (panel, i) { panel.hidden = i !== active; });
    }

    tablist.setAttribute("role", "tablist");
    tabs.forEach(function (tab, index) {
        tab.setAttribute("role", "tab");
        panels[index].setAttribute("role", "tabpanel");
        panels[index].setAttribute("aria-labelledby", tab.id);
        tab.addEventListener("click", function () {
            rotation(false);
            select(index, false);
        });
        tab.addEventListener("keydown", function (event) {
            var next;
            if (event.key === "ArrowRight") next = index + 1;
            else if (event.key === "ArrowLeft") next = index - 1;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            rotation(false);
            select(next, true);
        });
    });
    playback.addEventListener("click", function () { rotation(!rotating); });
    carousel.addEventListener("pointerenter", function (event) {
        if (event.pointerType === "touch") return;
        hovered = true;
        schedule();
    });
    carousel.addEventListener("pointerleave", function () { hovered = false; schedule(); });
    carousel.addEventListener("focusin", function () { focused = true; schedule(); });
    carousel.addEventListener("focusout", function (event) {
        focused = carousel.contains(event.relatedTarget);
        schedule();
    });
    document.addEventListener("visibilitychange", schedule);
    if (motion.addEventListener) motion.addEventListener("change", function (event) {
        if (event.matches) rotation(false);
    });
    window.addEventListener("resize", measure);
    panels.forEach(function (panel) { panel.querySelector("img").addEventListener("load", measure); });
    if (document.fonts) document.fonts.ready.then(measure);

    select(0, false);
    carousel.classList.add("is-ready");
    tablist.hidden = false;
    playback.hidden = false;
    measure();
    rotation(rotating);
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].intersectionRatio >= 0.35;
            schedule();
        }, { threshold: 0.35 }).observe(panelBox);
    } else { visible = true; schedule(); }
})();
