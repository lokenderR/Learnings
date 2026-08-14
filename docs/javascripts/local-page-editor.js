(function () {
  var endpoint = "http://127.0.0.1:8765/editable";

  function request(url, options) {
    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        throw new Error("Local editor server returned " + response.status);
      }
      return response.json();
    });
  }

  function installEditor(container) {
    if (container.dataset.ready === "true") {
      return;
    }
    container.dataset.ready = "true";

    var file = container.dataset.file;
    var section = container.dataset.section;
    var labelText = container.dataset.label || "Editable notes";

    var label = document.createElement("label");
    label.textContent = labelText;

    var textarea = document.createElement("textarea");
    textarea.placeholder = "Start the local editor server, type notes here, then Save.";

    var actions = document.createElement("div");
    actions.className = "local-page-editor__actions";

    var save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save";

    var status = document.createElement("span");
    status.className = "local-page-editor__status";
    status.textContent = "Loading local content...";

    actions.appendChild(save);
    actions.appendChild(status);
    container.appendChild(label);
    container.appendChild(textarea);
    container.appendChild(actions);

    function load() {
      var url = endpoint + "?file=" + encodeURIComponent(file) + "&section=" + encodeURIComponent(section);
      request(url)
        .then(function (data) {
          textarea.value = data.content || "";
          status.textContent = "Loaded from Markdown.";
        })
        .catch(function () {
          status.textContent = "Start local editor: python3 tools/handbook_editor.py";
        });
    }

    save.addEventListener("click", function () {
      status.textContent = "Saving...";
      request(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: file, section: section, content: textarea.value })
      })
        .then(function () {
          status.textContent = "Saved to Markdown. MkDocs will reload.";
        })
        .catch(function (error) {
          status.textContent = error.message;
        });
    });

    load();
  }

  function installAll() {
    document.querySelectorAll(".local-page-editor").forEach(installEditor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAll);
  } else {
    installAll();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(installAll);
  }
})();
