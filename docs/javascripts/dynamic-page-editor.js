(function () {
  var base = "http://127.0.0.1:8765";
  var blockTypes = [
    ["markdown", "Raw Markdown"],
    ["text", "Text"],
    ["question", "Question"],
    ["logic", "Logic"],
    ["callout", "Callout"],
    ["checklist", "Checklist"],
    ["diagram", "Mermaid diagram"],
    ["code", "Code snippet"],
    ["image", "Image"]
  ];
  var languages = ["java", "python", "javascript", "sql", "text", "bash", "yaml", "json"];
  var widths = [["default", "Default"], ["narrow", "Narrow"], ["wide", "Wide"], ["full", "Full"]];
  var imageSizes = [["small", "Small"], ["medium", "Medium"], ["large", "Large"], ["full", "Full"], ["custom", "Custom"]];
  var imageAlignments = [["left", "Left"], ["center", "Center"], ["right", "Right"]];
  var imageLayouts = [["single", "Single"], ["rows", "Rows"], ["sideBySide", "Side by side"], ["grid", "Grid"]];
  var textColors = [["#1d4ed8", "Blue"], ["#047857", "Green"], ["#b45309", "Amber"], ["#be123c", "Rose"], ["#6d28d9", "Violet"], ["#111827", "Black"]];
  var backgroundColors = [["#fef3c7", "Yellow"], ["#dcfce7", "Green"], ["#dbeafe", "Blue"], ["#ffe4e6", "Rose"], ["#ede9fe", "Violet"]];
  var boxBackgrounds = [["plain", "Plain"], ["gray", "Gray"], ["blue", "Blue"], ["green", "Green"], ["yellow", "Yellow"], ["rose", "Rose"], ["violet", "Violet"]];
  var boxBorders = [["none", "No border"], ["left", "Left bar"], ["full", "Full border"]];
  var boxPadding = [["normal", "Normal"], ["compact", "Compact"], ["spacious", "Spacious"]];
  var boxWidths = [["normal", "Normal"], ["wide", "Wide"], ["full", "Full"]];

  function request(path, options) {
    return fetch(base + path, options).then(function (response) {
      if (!response.ok) {
        return response.json().then(function (data) {
          throw new Error(data.error || "Local editor server returned " + response.status);
        });
      }
      return response.json();
    });
  }

  function optionList(items, value) {
    return items.map(function (item) {
      var val = Array.isArray(item) ? item[0] : item;
      var label = Array.isArray(item) ? item[1] : item;
      return '<option value="' + escapeHtml(val) + '"' + (val === value ? " selected" : "") + ">" + escapeHtml(label) + "</option>";
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function defaultBlock(type) {
    var id = "block-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    if (type === "code") {
      return { id: id, type: type, title: "Java solution", language: "java", width: "narrow", body: "class Solution {\n    // paste code here\n}" };
    }
    if (type === "diagram") {
      return { id: id, type: type, title: "Flow", body: "flowchart TD\n  A[Start] --> B[Process]\n  B --> C[Answer]" };
    }
    if (type === "image") {
      return { id: id, type: type, title: "Diagram", images: [], src: "", previewUrl: "", caption: "", imageSize: "medium", align: "left", layout: "single", customWidth: "560px", body: "" };
    }
    if (type === "checklist") {
      return { id: id, type: type, title: "Checklist", body: "Recognize the pattern\nWrite the state\nCheck edge cases" };
    }
    if (type === "markdown") {
      return { id: id, type: type, title: "Markdown", body: "" };
    }
    return { id: id, type: type, title: type.charAt(0).toUpperCase() + type.slice(1), body: "" };
  }

  function installEditor(container) {
    if (container.dataset.ready === "true") {
      return;
    }
    container.dataset.ready = "true";

    var file = container.dataset.file;
    var section = container.dataset.section;
    var blocks = [];

    container.classList.add("dynamic-page-editor--view");
	    container.innerHTML = [
	      '<div class="dynamic-page-editor__top">',
	      '<div><strong>Local page builder</strong><span> Add sections, save, then commit the Markdown changes.</span></div>',
	      '<div class="dynamic-page-editor__page-actions">',
	      '<button type="button" data-action="edit">Edit page</button>',
	      '<button type="button" data-action="save">Save page</button>',
	      '<button type="button" data-action="cancel">Cancel</button>',
	      '<button type="button" data-action="rename-page">Rename</button>',
	      '<button type="button" data-action="move-page">Move</button>',
	      '<button type="button" class="dynamic-page-editor__danger" data-action="delete-page">Delete</button>',
	      '</div>',
	      '</div>',
      '<div class="dynamic-page-editor__toolbar">',
      '<select data-action="type">' + optionList(blockTypes, "text") + '</select>',
      '<button type="button" data-action="add">Add section</button>',
      '<span class="dynamic-page-editor__status" data-role="status">Loading...</span>',
      '</div>',
      '<div class="dynamic-page-editor__drop" data-role="drop">Drop a screenshot here to add it as an image section.</div>',
      '<div class="dynamic-page-editor__blocks" data-role="blocks"></div>'
    ].join("");

	    var status = container.querySelector('[data-role="status"]');
    var list = container.querySelector('[data-role="blocks"]');
    var typeSelect = container.querySelector('[data-action="type"]');
    var dropZone = container.querySelector('[data-role="drop"]');

	    function setStatus(message) {
	      status.textContent = message;
	    }

	    function setEditing(isEditing) {
      container.classList.toggle("dynamic-page-editor--editing", isEditing);
      container.classList.toggle("dynamic-page-editor--view", !isEditing);
    }

    function load() {
      request("/page-blocks?file=" + encodeURIComponent(file) + "&section=" + encodeURIComponent(section))
        .then(function (data) {
          blocks = data.blocks || [];
          render();
          setStatus("Loaded from Markdown.");
        })
        .catch(function () {
          setStatus("Start local editor: python3 tools/handbook_editor.py");
        });
    }

    function save() {
      collect();
      setStatus("Saving...");
      request("/page-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: file, section: section, blocks: blocks })
      })
        .then(function () {
          setStatus("Saved. Reloading the clean page...");
          setEditing(false);
          window.setTimeout(function () {
            window.location.reload();
          }, 700);
        })
        .catch(function (error) {
          setStatus(error.message);
        });
    }

    function collect() {
      blocks = Array.prototype.map.call(list.querySelectorAll("[data-block-id]"), function (node) {
        var block = blocks.find(function (item) { return item.id === node.dataset.blockId; }) || {};
        block.type = node.querySelector('[data-field="type"]').value;
        block.title = node.querySelector('[data-field="title"]').value;
        block.body = node.querySelector('[data-field="body"]').value;
        var language = node.querySelector('[data-field="language"]');
        var boxBackground = node.querySelector('[data-field="boxBackground"]');
        var boxBorder = node.querySelector('[data-field="boxBorder"]');
        var boxPaddingValue = node.querySelector('[data-field="boxPadding"]');
        var boxWidth = node.querySelector('[data-field="boxWidth"]');
        var width = node.querySelector('[data-field="width"]');
        var kind = node.querySelector('[data-field="kind"]');
        var src = node.querySelector('[data-field="src"]');
        var previewUrl = node.querySelector('[data-field="previewUrl"]');
        var caption = node.querySelector('[data-field="caption"]');
        var imageSize = node.querySelector('[data-field="imageSize"]');
        var align = node.querySelector('[data-field="align"]');
        var layout = node.querySelector('[data-field="layout"]');
        var customWidth = node.querySelector('[data-field="customWidth"]');
        if (language) block.language = language.value;
        if (boxBackground) block.boxBackground = boxBackground.value;
        if (boxBorder) block.boxBorder = boxBorder.value;
        if (boxPaddingValue) block.boxPadding = boxPaddingValue.value;
        if (boxWidth) block.boxWidth = boxWidth.value;
        if (width) block.width = width.value;
        if (kind) block.kind = kind.value;
        if (src) block.src = src.value;
        if (previewUrl) block.previewUrl = previewUrl.value;
        if (caption) block.caption = caption.value;
        if (imageSize) block.imageSize = imageSize.value;
        if (align) block.align = align.value;
        if (layout) block.layout = layout.value;
        if (customWidth) block.customWidth = customWidth.value;
        if (block.type === "image") {
          block.images = Array.prototype.map.call(node.querySelectorAll("[data-image-index]"), function (imageNode) {
            return {
              src: imageNode.querySelector('[data-image-field="src"]').value,
              previewUrl: imageNode.querySelector('[data-image-field="previewUrl"]').value,
              caption: imageNode.querySelector('[data-image-field="caption"]').value
            };
          }).filter(function (image) { return image.src; });
          if (!block.images.length && block.src) {
            block.images = [{ src: block.src, previewUrl: block.previewUrl || "", caption: block.caption || "" }];
          }
          if (block.images[0]) {
            block.src = block.images[0].src;
            block.previewUrl = block.images[0].previewUrl || "";
          } else {
            block.src = "";
            block.previewUrl = "";
          }
        }
        return block;
      });
    }

    function render() {
      list.innerHTML = blocks.map(renderBlock).join("");
    }

    function renderBlock(block, index) {
      var extra = "";
      if (block.type === "code") {
        extra = '<label>Language<select data-field="language">' + optionList(languages, block.language || "java") + '</select></label>' +
          '<label>Code width<select data-field="width">' + optionList(widths, block.width || "narrow") + '</select></label>';
      } else if (block.type === "callout") {
        extra = '<label>Callout type<select data-field="kind">' + optionList(["note", "tip", "warning", "question", "success"], block.kind || "note") + '</select></label>';
      } else if (block.type === "image") {
        extra = '<label>Image path<input data-field="src" value="' + escapeHtml(block.src) + '" placeholder="docs/assets/uploads/image.png"></label>' +
          '<input type="hidden" data-field="previewUrl" value="' + escapeHtml(block.previewUrl) + '">' +
          '<label>Caption<input data-field="caption" value="' + escapeHtml(block.caption) + '" placeholder="Short caption"></label>' +
          '<label>Image size<select data-field="imageSize">' + optionList(imageSizes, block.imageSize || "medium") + '</select></label>' +
          '<label>Custom width<input data-field="customWidth" value="' + escapeHtml(block.customWidth || "560px") + '" placeholder="420px or 60%"></label>' +
          '<label>Align<select data-field="align">' + optionList(imageAlignments, block.align || "left") + '</select></label>' +
          '<label>Layout<select data-field="layout">' + optionList(imageLayouts, block.layout || "single") + '</select></label>' +
          '<div class="dynamic-page-editor__image-drop" data-action="image-drop">Drop or click to attach more images<input type="file" accept="image/*" multiple hidden></div>' +
          renderImageList(block);
      }

      return [
        '<section class="dynamic-page-editor__block" data-block-id="' + escapeHtml(block.id) + '">',
        '<div class="dynamic-page-editor__block-head">',
        '<strong>' + (index + 1) + '. ' + escapeHtml(labelFor(block.type)) + '</strong>',
        '<div>',
        '<button type="button" data-action="up">Up</button>',
        '<button type="button" data-action="down">Down</button>',
        '<button type="button" data-action="duplicate">Duplicate</button>',
        '<button type="button" data-action="remove">Remove</button>',
        '</div>',
        '</div>',
        '<div class="dynamic-page-editor__grid">',
        '<label>Section type<select data-field="type">' + optionList(blockTypes, block.type) + '</select></label>',
        '<label>Title<input data-field="title" value="' + escapeHtml(block.title) + '" placeholder="Section title"></label>',
        '<label>Box background<select data-field="boxBackground">' + optionList(boxBackgrounds, block.boxBackground || "plain") + '</select></label>',
        '<label>Box border<select data-field="boxBorder">' + optionList(boxBorders, block.boxBorder || "none") + '</select></label>',
        '<label>Box padding<select data-field="boxPadding">' + optionList(boxPadding, block.boxPadding || "normal") + '</select></label>',
        '<label>Box width<select data-field="boxWidth">' + optionList(boxWidths, block.boxWidth || "normal") + '</select></label>',
        extra,
        '</div>',
        renderFormattingToolbar(block),
        '<div class="dynamic-page-editor__content-grid">',
        '<label>Content<textarea data-field="body" placeholder="Write Markdown, code, notes, or Mermaid here...">' + escapeHtml(block.body) + '</textarea></label>',
        renderLivePreview(block),
        '</div>',
        '</section>'
      ].join("");
    }

    function renderFormattingToolbar(block) {
      if (["markdown", "code", "diagram", "image"].indexOf(block.type) !== -1) {
        return "";
      }
      return [
        '<div class="dynamic-page-editor__format-toolbar">',
        '<span class="dynamic-page-editor__format-help">Select text, then apply:</span>',
        '<button type="button" data-action="format" data-format="bold">Bold</button>',
        '<button type="button" data-action="format" data-format="italic">Italic</button>',
        '<button type="button" data-action="format" data-format="highlight" style="background-color: #fef3c7;">Highlight</button>',
        '<span class="dynamic-page-editor__format-group">Text ' + renderSwatches("textColor", textColors) + '</span>',
        '<span class="dynamic-page-editor__format-group">Background ' + renderSwatches("backgroundColor", backgroundColors) + '</span>',
        '<span class="dynamic-page-editor__format-group">Insert list ',
        '<button type="button" data-action="format" data-format="bulletList">Bullets</button>',
        '<button type="button" data-action="format" data-format="numberList">1. 2. 3.</button>',
        '<button type="button" data-action="format" data-format="alphaList">1.a 1.b</button>',
        '</span>',
        '</div>'
      ].join("");
    }

    function renderSwatches(format, colors) {
      return colors.map(function (item) {
        return '<button type="button" class="dynamic-page-editor__swatch" data-action="format" data-format="' + format + '" data-color="' + item[0] + '" title="' + escapeHtml(item[1]) + '" style="--swatch-color: ' + item[0] + ';"></button>';
      }).join("");
    }

    function renderLivePreview(block) {
      if (["markdown", "code", "diagram", "image"].indexOf(block.type) !== -1) {
        return "";
      }
      return '<div class="dynamic-page-editor__preview"><strong>Preview</strong><div data-role="body-preview">' + previewHtml(block.body) + '</div></div>';
    }

    function labelFor(type) {
      var found = blockTypes.find(function (item) { return item[0] === type; });
      return found ? found[1] : type;
    }

    function addBlock(type, afterId) {
      collect();
      var next = defaultBlock(type || typeSelect.value);
      if (!afterId) {
        blocks.push(next);
      } else {
        var index = blocks.findIndex(function (item) { return item.id === afterId; });
        blocks.splice(index + 1, 0, next);
      }
      render();
      setStatus("Unsaved changes.");
    }

    function normalizedImages(block) {
      if (block.images && block.images.length) {
        return block.images;
      }
      if (block.src) {
        return [{ src: block.src, previewUrl: block.previewUrl || "", caption: block.caption || "" }];
      }
      return [];
    }

    function renderImageList(block) {
      var images = normalizedImages(block);
      if (!images.length) {
        return '<div class="dynamic-page-editor__image-empty">No images attached yet.</div>';
      }
      return '<div class="dynamic-page-editor__image-list">' + images.map(function (image, index) {
        var preview = imagePreviewSrc(image);
        return [
          '<div class="dynamic-page-editor__image-item" data-image-index="' + index + '">',
          '<input type="hidden" data-image-field="src" value="' + escapeHtml(image.src) + '">',
          '<input type="hidden" data-image-field="previewUrl" value="' + escapeHtml(image.previewUrl || "") + '">',
          preview ? '<img class="dynamic-page-editor__image-preview" src="' + escapeHtml(preview) + '" alt="' + escapeHtml(image.caption || "Image preview") + '">' : '',
          '<label>Image caption<input data-image-field="caption" value="' + escapeHtml(image.caption || "") + '" placeholder="Image caption"></label>',
          '<button type="button" data-action="remove-image" data-image-index="' + index + '">Remove image</button>',
          '</div>'
        ].join("");
      }).join("") + '</div>';
    }

    function uploadFile(fileToUpload, targetId) {
      collect();
      if (!targetId) {
        var newImageBlock = defaultBlock("image");
        newImageBlock.title = "Uploaded image";
        newImageBlock.caption = fileToUpload.name;
        blocks.push(newImageBlock);
        targetId = newImageBlock.id;
        render();
      }
      var reader = new FileReader();
      reader.onload = function () {
        setStatus("Uploading image as pending change...");
        request("/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: fileToUpload.name,
            data: reader.result,
            staged: true
          })
        }).then(function (data) {
          var target = blocks.find(function (item) { return item.id === targetId; });
          if (target) {
            target.images = normalizedImages(target);
            target.images.push({ src: data.path, previewUrl: data.previewUrl, caption: fileToUpload.name });
            target.src = target.images[0].src;
            target.previewUrl = target.images[0].previewUrl || "";
            target.caption = target.caption || fileToUpload.name;
          }
          render();
          setStatus("Image attached. Click Save page to write everything.");
        }).catch(function (error) {
          setStatus(error.message);
        });
      };
      reader.readAsDataURL(fileToUpload);
    }

    function selectedText(textarea, fallback) {
      return textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || fallback;
    }

    function hasSelection(textarea) {
      return textarea.selectionStart !== textarea.selectionEnd;
    }

    function replaceSelection(textarea, replacement) {
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      textarea.focus();
      textarea.setSelectionRange(start, end);
      if (!document.execCommand || !document.execCommand("insertText", false, replacement)) {
        textarea.setRangeText(replacement, start, end, "select");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    function wrapSelection(textarea, before, after, fallback) {
      replaceSelection(textarea, before + selectedText(textarea, fallback) + after);
    }

    function listSelection(textarea, mode) {
      var selected = selectedText(textarea, "");
      var lines = (selected || "First item\nSecond item\nThird item").split(/\n/).filter(function (line) {
        return line.trim();
      });
      var replacement = "";
      if (mode === "bulletList") {
        replacement = lines.map(function (line) { return "- " + line.replace(/^[-*\d.a-zA-Z\s.]+/, "").trim(); }).join("\n");
      }
      if (mode === "numberList") {
        replacement = lines.map(function (line, index) { return (index + 1) + ". " + line.replace(/^[-*\d.a-zA-Z\s.]+/, "").trim(); }).join("\n");
      }
      if (mode === "alphaList") {
        replacement = "1. Main step\n    a. Detail A\n    b. Detail B\n2. Next main step";
      }
      replaceSelection(textarea, replacement);
    }

    function stripSpanStyles(fragment, property) {
      var template = document.createElement("template");
      template.innerHTML = fragment;
      var spans = Array.prototype.slice.call(template.content.querySelectorAll("span[style]")).reverse();
      spans.forEach(function (span) {
        span.style.removeProperty(property);
        if (span.getAttribute("style")) {
          return;
        }
        var parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
      });
      return template.innerHTML || fragment;
    }

    function expandStyledSelection(textarea, property) {
      var value = textarea.value;
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var selected = value.slice(start, end);
      var spanStart = value.lastIndexOf("<span", start);
      var closeBefore = value.lastIndexOf("</span>", start);
      if (spanStart === -1 || spanStart < closeBefore) {
        return selected;
      }
      var openEnd = value.indexOf(">", spanStart);
      var closeAfter = value.indexOf("</span>", end);
      if (openEnd === -1 || closeAfter === -1 || openEnd > start) {
        return selected;
      }
      var opening = value.slice(spanStart, openEnd + 1);
      if (opening.indexOf(property + ":") === -1) {
        return selected;
      }
      var inner = value.slice(openEnd + 1, closeAfter);
      if (inner.indexOf(selected) === -1) {
        return selected;
      }
      textarea.setSelectionRange(spanStart, closeAfter + "</span>".length);
      return value.slice(spanStart, closeAfter + "</span>".length);
    }

    function applyInlineStyle(textarea, property, value) {
      if (!hasSelection(textarea)) {
        setStatus("Select text first, then choose a color.");
        return false;
      }
      var selection = expandStyledSelection(textarea, property);
      var cleaned = stripSpanStyles(selection, property);
      replaceSelection(textarea, '<span style="' + property + ': ' + value + ';">' + cleaned + "</span>");
      return true;
    }

    function applyFormat(button) {
      var blockNode = button.closest("[data-block-id]");
      var textarea = blockNode.querySelector('[data-field="body"]');
      var format = button.dataset.format;
      if (format === "bold") wrapSelection(textarea, "**", "**", "important text");
      if (format === "italic") wrapSelection(textarea, "*", "*", "emphasis");
      if (format === "highlight") {
        if (!hasSelection(textarea)) {
          setStatus("Select text first, then highlight it.");
          return;
        }
        wrapSelection(textarea, "<mark>", "</mark>", "");
      }
      if (format === "textColor" && !applyInlineStyle(textarea, "color", button.dataset.color)) return;
      if (format === "backgroundColor" && !applyInlineStyle(textarea, "background-color", button.dataset.color)) return;
      if (["bulletList", "numberList", "alphaList"].indexOf(format) !== -1) listSelection(textarea, format);
      if (button.classList.contains("dynamic-page-editor__swatch")) {
        Array.prototype.forEach.call(button.parentNode.querySelectorAll(".dynamic-page-editor__swatch"), function (swatch) {
          swatch.classList.toggle("dynamic-page-editor__swatch--active", swatch === button);
        });
      }
      updatePreview(blockNode);
      collect();
      setStatus("Formatting added. Click Save page to render it.");
    }

    function updatePreview(blockNode) {
      var preview = blockNode.querySelector('[data-role="body-preview"]');
      var textarea = blockNode.querySelector('[data-field="body"]');
      if (preview && textarea) {
        preview.innerHTML = previewHtml(textarea.value);
      }
    }

    function previewHtml(markdown) {
      var lines = String(markdown || "").split(/\n/);
      var html = [];
      lines.forEach(function (line) {
        var indent = (line.match(/^\s*/) || [""])[0].replace(/\t/g, "    ").length;
        var trimmed = line.trim();
        if (!trimmed) {
          return;
        }
        var listMatch = trimmed.match(/^([-*]|\d+\.|[a-z]\.)\s+(.+)$/i);
        if (listMatch) {
          html.push(
            '<div class="dynamic-page-editor__preview-list-line" style="--preview-indent: ' + indent + ';">' +
            '<span class="dynamic-page-editor__preview-marker">' + escapeHtml(listMatch[1]) + '</span>' +
            '<span>' + inlinePreview(listMatch[2]) + '</span>' +
            '</div>'
          );
          return;
        }
        html.push("<p>" + inlinePreview(trimmed) + "</p>");
      });
      return html.join("");
    }

    function inlinePreview(text) {
      return sanitizeInlineHtml(text)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
    }

    function sanitizeInlineHtml(text) {
      var template = document.createElement("template");
      template.innerHTML = String(text || "");
      sanitizeNode(template.content);
      return template.innerHTML || escapeHtml(text);
    }

    function sanitizeNode(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) {
          child.remove();
          return;
        }
        var tag = child.tagName.toLowerCase();
        if (["span", "mark", "strong", "em"].indexOf(tag) === -1) {
          child.replaceWith(document.createTextNode(child.textContent));
          return;
        }
        Array.prototype.slice.call(child.attributes).forEach(function (attr) {
          if (tag === "span" && attr.name === "style") {
            child.setAttribute("style", allowedInlineStyle(child.getAttribute("style")));
          } else {
            child.removeAttribute(attr.name);
          }
        });
        sanitizeNode(child);
      });
    }

    function allowedInlineStyle(styleText) {
      var probe = document.createElement("span");
      probe.setAttribute("style", styleText || "");
      var styles = [];
      if (probe.style.color) {
        styles.push("color: " + probe.style.color);
      }
      if (probe.style.backgroundColor) {
        styles.push("background-color: " + probe.style.backgroundColor);
      }
      return styles.join("; ");
    }

	    container.addEventListener("click", function (event) {
	      var action = event.target.dataset.action;
	      if (!action) return;
	      if (action === "rename-page") {
	        renamePageFromUi(container);
	        return;
	      }
	      if (action === "move-page") {
	        movePageFromUi(container);
	        return;
	      }
	      if (action === "delete-page") {
	        deletePageFromUi(container);
	        return;
	      }
	      var section = event.target.closest("[data-block-id]");
      var id = section ? section.dataset.blockId : null;
      collect();
      if (action === "edit") {
        setEditing(true);
        setStatus("Editing local Markdown.");
      }
      if (action === "cancel") {
        load();
        setEditing(false);
      }
      if (action === "save") save();
      if (action === "add") addBlock(typeSelect.value);
      if (action === "format") applyFormat(event.target);
      if (action === "remove") blocks = blocks.filter(function (item) { return item.id !== id; });
      if (action === "duplicate") {
        var original = blocks.find(function (item) { return item.id === id; });
        var copy = JSON.parse(JSON.stringify(original));
        copy.id = "block-" + Date.now();
        blocks.splice(blocks.findIndex(function (item) { return item.id === id; }) + 1, 0, copy);
      }
      if (action === "up" || action === "down") {
        var from = blocks.findIndex(function (item) { return item.id === id; });
        var to = action === "up" ? from - 1 : from + 1;
        if (to >= 0 && to < blocks.length) {
          blocks.splice(to, 0, blocks.splice(from, 1)[0]);
        }
      }
      if (action === "image-drop") {
        event.target.querySelector("input").click();
      }
      if (action === "remove-image") {
        var targetBlock = blocks.find(function (item) { return item.id === id; });
        if (targetBlock) {
          var imageIndex = Number(event.target.dataset.imageIndex);
          targetBlock.images = normalizedImages(targetBlock).filter(function (_, index) { return index !== imageIndex; });
          targetBlock.src = targetBlock.images[0] ? targetBlock.images[0].src : "";
          targetBlock.previewUrl = targetBlock.images[0] ? targetBlock.images[0].previewUrl || "" : "";
          render();
          setStatus("Image removed. Click Save page to write everything.");
        }
      }
      if (["remove", "duplicate", "up", "down"].indexOf(action) !== -1) {
        render();
        setStatus("Unsaved changes.");
      }
    });

    container.addEventListener("mousedown", function (event) {
      if (event.target.dataset.action === "format") {
        event.preventDefault();
      }
    });

    container.addEventListener("change", function (event) {
      if (event.target.matches('[data-field="type"]')) {
        collect();
        render();
      }
      if (event.target.type === "file" && event.target.files[0]) {
        var section = event.target.closest("[data-block-id]");
        Array.prototype.forEach.call(event.target.files, function (fileItem) {
          uploadFile(fileItem, section.dataset.blockId);
        });
        event.target.value = "";
      }
    });

    container.addEventListener("input", function (event) {
      if (event.target.matches('[data-field="body"]')) {
        updatePreview(event.target.closest("[data-block-id]"));
      }
    });

    container.addEventListener("keydown", function (event) {
      if (!event.target.matches('[data-field="body"]') || event.key !== "Tab") {
        return;
      }
      event.preventDefault();
      indentTextareaSelection(event.target, event.shiftKey ? -4 : 4);
      updatePreview(event.target.closest("[data-block-id]"));
      collect();
    });

    function indentTextareaSelection(textarea, delta) {
      var value = textarea.value;
      var selectionStart = textarea.selectionStart;
      var selectionEnd = textarea.selectionEnd;
      var lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      var selectedEnd = selectionEnd;
      if (selectedEnd > selectionStart && value[selectedEnd - 1] === "\n") {
        selectedEnd -= 1;
      }
      var lineEnd = value.indexOf("\n", selectedEnd);
      if (lineEnd === -1) {
        lineEnd = value.length;
      }
      var before = value.slice(0, lineStart);
      var block = value.slice(lineStart, lineEnd);
      var after = value.slice(lineEnd);
      var changed = block.split("\n").map(function (line) {
        if (delta > 0) {
          return "    " + line;
        }
        return line.replace(/^( {1,4}|\t)/, "");
      }).join("\n");
      textarea.value = before + changed + after;
      var lengthDelta = changed.length - block.length;
      textarea.selectionStart = selectionStart + (delta > 0 ? 4 : Math.max(lengthDelta, -4));
      textarea.selectionEnd = selectionEnd + lengthDelta;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function handleDrop(event, targetId) {
      event.preventDefault();
      var filesToUpload = Array.prototype.filter.call(event.dataTransfer.files, function (fileItem) {
        return fileItem.type.indexOf("image/") === 0;
      });
      filesToUpload.forEach(function (fileItem) { uploadFile(fileItem, targetId); });
    }

    function imagePreviewSrc(block) {
      if (block.previewUrl) {
        return base + block.previewUrl;
      }
      if (block.src && block.src.indexOf("docs/") === 0) {
        return "http://127.0.0.1:8000/Learnings/" + block.src.replace(/^docs\//, "");
      }
      return block.src || "";
    }

    dropZone.addEventListener("dragover", function (event) { event.preventDefault(); });
    dropZone.addEventListener("drop", function (event) { handleDrop(event); });
    list.addEventListener("dragover", function (event) { event.preventDefault(); });
    list.addEventListener("drop", function (event) {
      var imageDrop = event.target.closest('[data-action="image-drop"]');
      var block = event.target.closest("[data-block-id]");
      if (imageDrop && block) handleDrop(event, block.dataset.blockId);
    });

    load();
  }

  function installAll() {
    installGlobalEditor();
    installPageActions();
    document.querySelectorAll(".dynamic-page-editor").forEach(installEditor);
  }

  function currentSection() {
    return "page";
  }

  function installGlobalEditor() {
    if (document.querySelector(".dynamic-page-editor") || window.__dynamicPageEditorInstalling) {
      return;
    }
    var article = document.querySelector(".md-content__inner");
    if (!article) {
      return;
    }
    window.__dynamicPageEditorInstalling = true;
    request("/resolve-page?path=" + encodeURIComponent(window.location.pathname))
      .then(function (data) {
        if (document.querySelector(".dynamic-page-editor")) {
          return;
        }
        var editor = document.createElement("div");
        editor.className = "dynamic-page-editor";
        editor.dataset.file = data.file;
        editor.dataset.section = currentSection();
        article.insertBefore(editor, article.firstChild);
        installEditor(editor);
      })
      .catch(function () {
        if (document.querySelector(".dynamic-page-editor")) {
          return;
        }
        var editor = document.createElement("div");
        editor.className = "dynamic-page-editor dynamic-page-editor--view";
        editor.innerHTML = '<div class="dynamic-page-editor__top"><div><strong>Local page builder</strong></div><button type="button" disabled>Start local editor</button></div>';
        article.insertBefore(editor, article.firstChild);
      })
      .finally(function () {
        window.__dynamicPageEditorInstalling = false;
      });
  }

  function installPageActions() {
    if (document.querySelector(".local-page-actions")) {
      return;
    }
    var sidebar = document.querySelector(".md-sidebar--primary .md-sidebar__scrollwrap");
    if (!sidebar) {
      return;
    }
    var panel = document.createElement("div");
    panel.className = "local-page-actions";
	    panel.innerHTML = [
	      '<strong>Local pages</strong>',
	      '<button type="button" data-page-action="add-page">Add page here</button>',
	      '<button type="button" data-page-action="add-subsection">Add subsection</button>',
	      '<span data-role="page-action-status"></span>'
	    ].join("");
    sidebar.insertBefore(panel, sidebar.firstChild);
    panel.addEventListener("click", function (event) {
	      var action = event.target.dataset.pageAction;
	      if (!action) return;
	      createPageFromUi(panel, action === "add-subsection" ? "subsection" : "same-folder");
	    });
	  }

  function createPageFromUi(panel, mode) {
    var status = panel.querySelector('[data-role="page-action-status"]');
    var title = window.prompt(mode === "subsection" ? "Subsection name" : "Page title");
    if (!title) return;
    status.textContent = "Creating...";
    request("/resolve-page?path=" + encodeURIComponent(window.location.pathname))
      .then(function (current) {
        return request("/create-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentFile: current.file, title: title, mode: mode })
        });
      })
      .then(function () {
        status.textContent = "Created. Reloading...";
        window.setTimeout(function () { window.location.reload(); }, 700);
      })
      .catch(function (error) {
        status.textContent = error.message;
      });
  }

  function actionStatus(container) {
    return container.querySelector('[data-role="page-action-status"]') ||
      container.querySelector('[data-role="status"]') ||
      { textContent: "" };
  }

  function deletePageFromUi(panel) {
    var status = actionStatus(panel);
    request("/resolve-page?path=" + encodeURIComponent(window.location.pathname))
      .then(function (current) {
        var message = [
          "Delete this page?",
          "",
          current.file,
          "",
          "This will remove the Markdown file and its sidebar entry.",
          "This only changes your local git working tree."
        ].join("\n");
        if (!window.confirm(message)) {
          status.textContent = "Delete cancelled.";
          return null;
        }
        status.textContent = "Deleting...";
        return request("/delete-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: current.file })
        });
      })
      .then(function (result) {
        if (!result) return;
        status.textContent = "Deleted. Opening parent...";
        window.setTimeout(function () {
          window.location.href = result.redirect || "/Learnings/";
        }, 700);
      })
      .catch(function (error) {
        status.textContent = error.message;
      });
  }

  function renamePageFromUi(panel) {
    var status = actionStatus(panel);
    var currentTitle = (document.querySelector("h1") && document.querySelector("h1").textContent.trim()) || "";
    var title = window.prompt("New page name", currentTitle);
    if (!title || title.trim() === currentTitle) {
      status.textContent = "Rename cancelled.";
      return;
    }
    status.textContent = "Renaming...";
    request("/resolve-page?path=" + encodeURIComponent(window.location.pathname))
      .then(function (current) {
        return request("/rename-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: current.file, title: title.trim() })
        });
      })
      .then(function () {
        status.textContent = "Renamed. Reloading...";
        window.setTimeout(function () { window.location.reload(); }, 700);
      })
      .catch(function (error) {
        status.textContent = error.message;
      });
  }

  function movePageFromUi(panel) {
    var status = actionStatus(panel);
    var currentPage;
    status.textContent = "Loading destinations...";
    request("/resolve-page?path=" + encodeURIComponent(window.location.pathname))
      .then(function (current) {
        currentPage = current;
        return request("/pattern-sections");
      })
      .then(function (data) {
        var sections = (data.sections || []).filter(function (section) {
          return section.file !== currentPage.file;
        });
        if (!sections.length) {
          throw new Error("No destination sections found.");
        }
        status.textContent = "Choose a destination.";
        return chooseMoveDestination(sections, currentPage).then(function (destination) {
          if (!destination) {
            status.textContent = "Move cancelled.";
            return null;
          }
          return request("/move-preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: currentPage.file, destinationFile: destination.file })
          }).then(function (preview) {
            var confirmMessage = [
              "Move this " + preview.kind + "?",
              "",
              "From:",
              preview.from,
              "",
              "To:",
              preview.to,
              "",
              "This will update the file location and mkdocs.yml sidebar entry.",
              "This only changes your local git working tree."
            ].join("\n");
            if (!window.confirm(confirmMessage)) {
              status.textContent = "Move cancelled.";
              return null;
            }
            status.textContent = "Moving...";
            return request("/move-page", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file: currentPage.file, destinationFile: destination.file })
            });
          });
        });
      })
      .then(function (result) {
        if (!result) return;
        status.textContent = "Moved. Opening new location...";
        window.setTimeout(function () {
          window.location.href = result.redirect || "/Learnings/";
        }, 700);
      })
      .catch(function (error) {
        status.textContent = error.message;
      });
  }

  function chooseMoveDestination(sections, currentPage) {
    return new Promise(function (resolve) {
      var overlay = document.createElement("div");
      overlay.className = "page-move-modal";
      overlay.innerHTML = [
        '<div class="page-move-modal__panel" role="dialog" aria-modal="true" aria-label="Move current page">',
        '<div class="page-move-modal__head">',
        '<strong>Move current page</strong>',
        '<button type="button" data-move-action="close">Cancel</button>',
        '</div>',
        '<div class="page-move-modal__from"><span>From</span><code>' + escapeHtml(currentPage.path) + '</code></div>',
        '<label>Move under<select data-role="move-destination"></select></label>',
        '<div class="page-move-modal__path">',
        '<span>Selected destination path</span>',
        '<code data-role="move-path"></code>',
        '<button type="button" data-move-action="copy">Copy path</button>',
        '</div>',
        '<div class="page-move-modal__actions">',
        '<button type="button" data-move-action="close">Cancel</button>',
        '<button type="button" data-move-action="move">Move here</button>',
        '</div>',
        '</div>'
      ].join("");
      document.body.appendChild(overlay);

      var select = overlay.querySelector('[data-role="move-destination"]');
      var pathDisplay = overlay.querySelector('[data-role="move-path"]');
      select.innerHTML = sections.map(function (section, index) {
        var prefix = section.number ? section.number + " " : (index + 1) + ". ";
        var indent = Array((section.level || 0) + 1).join("  ");
        var label = indent + prefix + section.title;
        return '<option value="' + index + '">' + escapeHtml(label) + '</option>';
      }).join("");

      function selectedSection() {
        return sections[Number(select.value) || 0];
      }

      function syncPath() {
        pathDisplay.textContent = selectedSection().path;
      }

      function close(result) {
        overlay.remove();
        resolve(result);
      }

      select.addEventListener("change", syncPath);
      overlay.addEventListener("click", function (event) {
        var action = event.target.dataset.moveAction;
        if (action === "close") {
          close(null);
        }
        if (action === "move") {
          close(selectedSection());
        }
        if (action === "copy") {
          var path = selectedSection().path;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(path);
          }
          event.target.textContent = "Copied";
          window.setTimeout(function () { event.target.textContent = "Copy path"; }, 1200);
        }
      });
      syncPath();
      select.focus();
    });
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
