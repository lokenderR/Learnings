(function () {
  var storageKey = "learnings.sidebarWidth";
  var minWidth = 220;
  var maxWidth = 520;

  function clamp(value) {
    return Math.min(maxWidth, Math.max(minWidth, value));
  }

  function applyWidth(value) {
    document.documentElement.style.setProperty(
      "--learning-sidebar-width",
      clamp(value) + "px"
    );
  }

  function installResizer() {
    var sidebar = document.querySelector(".md-sidebar--primary");
    var main = document.querySelector(".md-main__inner");

    if (!sidebar || !main || main.querySelector(".learning-sidebar-resizer")) {
      return;
    }

    var savedWidth = window.localStorage.getItem(storageKey);
    if (savedWidth) {
      applyWidth(Number(savedWidth));
    }

    var handle = document.createElement("button");
    handle.type = "button";
    handle.className = "learning-sidebar-resizer";
    handle.setAttribute("aria-label", "Resize navigation sidebar");
    handle.setAttribute("title", "Drag to resize navigation");
    main.insertBefore(handle, sidebar.nextSibling);

    function startResizing(event) {
      event.preventDefault();
      document.body.classList.add("learning-sidebar-resizing");
    }

    function resizeToEvent(event) {
      if (!document.body.classList.contains("learning-sidebar-resizing")) {
        return;
      }

      var nextWidth = clamp(event.clientX);
      applyWidth(nextWidth);
      window.localStorage.setItem(storageKey, String(nextWidth));
    }

    function stopResizing() {
      document.body.classList.remove("learning-sidebar-resizing");
    }

    handle.addEventListener("pointerdown", function (event) {
      startResizing(event);
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", resizeToEvent);
    handle.addEventListener("pointerup", stopResizing);
    handle.addEventListener("pointercancel", stopResizing);

    handle.addEventListener("mousedown", startResizing);
    window.addEventListener("mousemove", resizeToEvent);
    window.addEventListener("mouseup", stopResizing);

    handle.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      var currentWidth = sidebar.getBoundingClientRect().width;
      var nextWidth = currentWidth + (event.key === "ArrowRight" ? 24 : -24);
      applyWidth(nextWidth);
      window.localStorage.setItem(storageKey, String(clamp(nextWidth)));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installResizer);
  } else {
    installResizer();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(installResizer);
  }
})();
