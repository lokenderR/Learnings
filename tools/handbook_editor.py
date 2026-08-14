#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import base64
import mimetypes
import shutil
import json
import posixpath
from pathlib import Path
import re
import time
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
START_TEMPLATE = "<!-- editable:{section}:start -->"
END_TEMPLATE = "<!-- editable:{section}:end -->"
BLOCKS_START_TEMPLATE = '<script type="application/json" id="editable-blocks-{section}">'
BLOCKS_END_TEMPLATE = "</script>"
RENDER_START_TEMPLATE = "<!-- rendered-blocks:{section}:start -->"
RENDER_END_TEMPLATE = "<!-- rendered-blocks:{section}:end -->"
UPLOAD_DIR = ROOT / "docs" / "assets" / "uploads"
STAGING_UPLOAD_DIR = ROOT / ".handbook-editor" / "uploads"


def safe_path(relative_path):
    path = (ROOT / relative_path).resolve()
    if ROOT not in path.parents and path != ROOT:
        raise ValueError("Path is outside repository")
    if path.suffix != ".md":
        raise ValueError("Only Markdown files can be edited")
    return path


def slugify_title(title):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title.strip().lower()).strip("-")
    return slug or "new-page"


def docs_relative(path):
    return str(path.resolve().relative_to(ROOT / "docs"))


def page_path_from_url(url_path):
    cleaned = url_path.split("?", 1)[0].strip("/")
    if cleaned.startswith("Learnings/"):
        cleaned = cleaned[len("Learnings/"):]
    candidates = []
    if not cleaned:
        candidates.append(ROOT / "docs" / "index.md")
    else:
        candidates.append(ROOT / "docs" / cleaned / "index.md")
        candidates.append(ROOT / "docs" / f"{cleaned}.md")
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    fallback_dir = ROOT / "docs" / cleaned
    if fallback_dir.suffix:
        fallback_dir = fallback_dir.parent
    while fallback_dir != ROOT and ROOT / "docs" in fallback_dir.parents:
        fallback = fallback_dir / "index.md"
        if fallback.exists():
            return fallback.resolve()
        fallback_dir = fallback_dir.parent
    return candidates[0].resolve()


def create_child_page(payload):
    parent = safe_path(payload["parentFile"])
    title = payload.get("title", "").strip() or "New Page"
    slug = slugify_title(payload.get("slug") or title)
    mode = payload.get("mode") or "same-folder"
    parent_dir = parent.parent
    if mode == "subsection":
        target_dir = parent_dir / slug
        target = target_dir / "index.md"
    else:
        target = parent_dir / f"{slug}.md"
    target = target.resolve()
    if ROOT / "docs" not in target.parents:
        raise ValueError("New page must be under docs")
    if target.exists():
        raise ValueError("Page already exists")
    target.parent.mkdir(parents=True, exist_ok=True)
    blocks = default_blocks_for_new_page(title, target)
    section = "page"
    target.write_text(managed_page_text(target, section, blocks))
    add_nav_entry(title, docs_relative(target), docs_relative(parent))
    return {"file": str(target.relative_to(ROOT)), "path": docs_relative(target)}


def base_block(block_id, block_type, title, body="", background="plain", border="full", padding="normal", box_width="normal", **extra):
    block = {
        "id": block_id,
        "type": block_type,
        "title": title,
        "body": body,
        "boxBackground": background,
        "boxBorder": border,
        "boxPadding": padding,
        "boxWidth": box_width,
    }
    block.update(extra)
    return block


def default_blocks_for_new_page(title, target):
    if not is_patterns_path(target):
        return [base_block("intro", "text", title, "", background="plain", border="none")]
    if target.name == "index.md":
        return strategy_template_blocks(title)
    return problem_template_blocks(title)


def is_patterns_path(path):
    try:
        docs_path = docs_relative(path)
    except ValueError:
        return False
    return docs_path == "problem-solving/patterns/index.md" or docs_path.startswith("problem-solving/patterns/")


def strategy_template_blocks(title):
    return [
        base_block(
            "strategy-overview",
            "question",
            "Strategy Overview",
            f"Use this page to capture the core idea behind **{title}** and when this pattern should be considered.",
            background="blue",
            border="full",
            pageTitle=title,
        ),
        base_block(
            "strategy-logic",
            "logic",
            "How This Strategy Works",
            "- Recognition signal: describe what the problem usually asks for.\n- Core invariant: describe what must stay true while solving.\n- Main move: describe how the state/window/pointer/queue/stack changes.\n- Stop condition: describe when the answer is known.",
            background="green",
            border="left",
        ),
        base_block(
            "strategy-diagram",
            "image",
            "Visual Diagram",
            "",
            background="yellow",
            border="full",
            images=[],
            src="",
            previewUrl="",
            caption="Attach a diagram or screenshot that explains the strategy.",
            imageSize="medium",
            align="center",
            layout="single",
            customWidth="640px",
        ),
        base_block(
            "strategy-pseudocode",
            "code",
            "Java Pseudocode",
            "class PatternTemplate {\n    void solve() {\n        // 1. Identify the state or invariant.\n        // 2. Initialize the data structures.\n        // 3. Iterate through the input.\n        // 4. Update state and answer.\n        // 5. Return the final answer.\n    }\n}",
            background="gray",
            border="full",
            language="java",
            width="narrow",
        ),
        base_block(
            "strategy-standard-problems",
            "checklist",
            "Standard Problems",
            "- [ ] Add first canonical problem\n- [ ] Add second canonical problem\n- [ ] Add edge-case heavy problem\n- [ ] Add revision problem",
            background="violet",
            border="left",
        ),
    ]


def problem_template_blocks(title):
    return [
        base_block(
            "problem-statement",
            "question",
            "Problem Statement",
            "Paste the full problem statement here. If it comes from LeetCode, GeeksforGeeks, or another source, keep the examples and constraints together.",
            background="blue",
            border="full",
            pageTitle=title,
        ),
        base_block(
            "problem-images",
            "image",
            "Problem Images / Examples",
            "",
            background="yellow",
            border="full",
            images=[],
            src="",
            previewUrl="",
            caption="Attach any statement image, example diagram, or screenshot here.",
            imageSize="medium",
            align="center",
            layout="grid",
            customWidth="720px",
        ),
        base_block(
            "problem-logic",
            "logic",
            "Logic",
            "- Pattern: name the pattern this problem belongs to.\n- State: describe what information must be tracked.\n- Transition: describe how each step changes the state.\n- Answer: describe where the final answer comes from.\n- Edge cases: list null, empty, boundary, duplicate, or unreachable cases.",
            background="green",
            border="left",
        ),
        base_block(
            "problem-diagram",
            "image",
            "Solution Diagram",
            "",
            background="rose",
            border="full",
            images=[],
            src="",
            previewUrl="",
            caption="Attach your dry-run, flow, or state diagram here.",
            imageSize="medium",
            align="center",
            layout="single",
            customWidth="720px",
        ),
        base_block(
            "problem-java-code",
            "code",
            "Java Code",
            "class Solution {\n    public int solve() {\n        // paste final Java solution here\n        return 0;\n    }\n}",
            background="gray",
            border="full",
            language="java",
            width="narrow",
        ),
        base_block(
            "problem-complexity",
            "callout",
            "Time And Space Complexity",
            "- Time: O(?)\n- Space: O(?)\n- Why: explain the dominant loop/data structure.",
            background="violet",
            border="left",
        ),
    ]


def delete_page(payload):
    target = safe_path(payload["file"])
    if target == ROOT / "docs" / "index.md":
        raise ValueError("Home page cannot be deleted")
    if not target.exists():
        raise ValueError("Page does not exist")
    doc_path = docs_relative(target)
    if target.name == "index.md":
        markdown_files = list(target.parent.rglob("*.md"))
        if len(markdown_files) > 1:
            raise ValueError("Subsection still has child pages. Delete those first.")
    remove_nav_entry(doc_path)
    if target.name == "index.md":
        shutil.rmtree(target.parent)
    else:
        target.unlink()
    return {
        "ok": True,
        "redirect": redirect_after_delete(target),
        "deleted": str(target.relative_to(ROOT)),
    }


def rename_page(payload):
    target = safe_path(payload["file"])
    title = payload.get("title", "").strip()
    if not title:
        raise ValueError("New title is required")
    if not target.exists():
        raise ValueError("Page does not exist")
    doc_path = docs_relative(target)
    text = target.read_text()
    if BLOCKS_START_TEMPLATE.format(section="page") in text:
        blocks = read_blocks(target, "page")
        if blocks:
            page_title_block = next((block for block in blocks if block.get("pageTitle")), blocks[0])
            page_title_block["pageTitle"] = title
        write_blocks(target, "page", blocks)
        update_markdown_h1(target, title)
    else:
        update_markdown_h1(target, title)
    rename_nav_entry(doc_path, title)
    return {"ok": True, "file": str(target.relative_to(ROOT)), "path": doc_path, "title": title}


def list_pattern_sections():
    sections = []
    seen = set()
    counters = []
    for doc_path in nav_ordered_pattern_section_paths():
        if doc_path in seen or doc_path == "problem-solving/patterns/index.md":
            continue
        seen.add(doc_path)
        path = ROOT / "docs" / doc_path
        if not path.exists():
            continue
        level = pattern_section_level(doc_path)
        while len(counters) > level + 1:
            counters.pop()
        while len(counters) <= level:
            counters.append(0)
        counters[level] += 1
        sections.append({
            "file": str(path.relative_to(ROOT)),
            "path": doc_path,
            "title": read_page_title(path),
            "level": level,
            "number": ".".join(str(value) for value in counters[:level + 1]),
        })
    return {"sections": sections}


def nav_ordered_pattern_section_paths():
    mkdocs_path = ROOT / "mkdocs.yml"
    if not mkdocs_path.exists():
        return []
    paths = []
    pattern = re.compile(r"problem-solving/patterns/[^\s]+/index\.md")
    for line in mkdocs_path.read_text().splitlines():
        match = pattern.search(line)
        if match:
            paths.append(match.group(0))
    return paths


def pattern_section_level(doc_path):
    relative = doc_path.removeprefix("problem-solving/patterns/")
    parts = Path(relative).parts
    return max(0, len(parts) - 2)


def move_page(payload, dry_run=False):
    source = safe_path(payload["file"])
    destination = safe_path(payload["destinationFile"])
    if not source.exists():
        raise ValueError("Source page does not exist")
    if not destination.exists() or destination.name != "index.md":
        raise ValueError("Destination must be an existing section page")
    if not is_patterns_path(source) or not is_patterns_path(destination):
        raise ValueError("Move is currently limited to the Patterns section")
    if source == destination:
        raise ValueError("Source and destination are the same page")

    if source.name == "index.md":
        source_entity = source.parent
        target_entity = destination.parent / source_entity.name
        target_page = target_entity / "index.md"
        if destination.parent == source_entity or source_entity in destination.parent.parents:
            raise ValueError("A section cannot be moved into itself or one of its children")
        if target_entity.exists():
            raise ValueError("Destination already has a section with this folder name")
        nav_source = docs_relative(source)
        old_prefix = docs_relative(source_entity)
        new_prefix = docs_relative(target_entity)
        moved_kind = "section"
    else:
        source_entity = source
        target_entity = destination.parent / source.name
        target_page = target_entity
        if target_entity.exists():
            raise ValueError("Destination already has a page with this file name")
        nav_source = docs_relative(source)
        old_prefix = docs_relative(source)
        new_prefix = docs_relative(target_entity)
        moved_kind = "page"

    destination_doc = docs_relative(destination)
    preview = {
        "kind": moved_kind,
        "from": str(source_entity.relative_to(ROOT)),
        "to": str(target_entity.relative_to(ROOT)),
        "newFile": str(target_page.relative_to(ROOT)),
        "redirect": "/Learnings/" + docs_relative(target_page).removesuffix("index.md").removesuffix(".md") + "/",
    }
    if dry_run:
        return preview

    update_nav_for_move(nav_source, destination_doc, old_prefix, new_prefix)
    target_entity.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(source_entity), str(target_entity))
    regenerate_managed_pages(target_entity)
    return {"ok": True, **preview}


def read_page_title(path):
    match = re.search(r"^#\s+(.+)$", path.read_text(), re.MULTILINE)
    if match:
        return match.group(1).strip()
    return path.parent.name.replace("-", " ").title() if path.name == "index.md" else path.stem.replace("-", " ").title()


def update_markdown_h1(path, title):
    text = path.read_text()
    if re.search(r"^#\s+.+$", text, re.MULTILINE):
        text = re.sub(r"^#\s+.+$", f"# {title}", text, count=1, flags=re.MULTILINE)
    else:
        text = f"# {title}\n\n{text.lstrip()}"
    path.write_text(text)


def redirect_after_delete(target):
    parent = target.parent
    if target.name == "index.md":
        parent = parent.parent
    while parent != ROOT and ROOT / "docs" in parent.parents:
        candidate = parent / "index.md"
        if candidate.exists() and candidate != target:
            return "/Learnings/" + docs_relative(candidate).removesuffix("index.md")
        parent = parent.parent
    return "/Learnings/"


def add_nav_entry(title, new_doc_path, parent_doc_path):
    mkdocs_path = ROOT / "mkdocs.yml"
    text = mkdocs_path.read_text()
    if new_doc_path in text:
        return
    escaped_parent = re.escape(parent_doc_path)
    parent_line = re.compile(rf"^(?P<indent>\s*)-\s+(?:(?P<title>\"[^\"]+\"|[^:\n]+):\s+)?{escaped_parent}\s*$", re.MULTILINE)
    match = parent_line.search(text)
    nav_title = title.replace('"', '\\"')
    if match:
        indent = match.group("indent")
        parent_title = match.group("title")
        if parent_title:
            child_indent = indent + "    "
            replacement = (
                f"{indent}- {parent_title.strip()}:\n"
                f"{child_indent}- {parent_doc_path}\n"
                f'{child_indent}- "{nav_title}": {new_doc_path}'
            )
            mkdocs_path.write_text(text[:match.start()] + replacement + text[match.end():])
            return
        insert_at = match.end()
        entry = f'\n{indent}- "{nav_title}": {new_doc_path}'
        mkdocs_path.write_text(text[:insert_at] + entry + text[insert_at:])
        return

    nav_match = re.search(r"^nav:\s*$", text, re.MULTILINE)
    entry = f'\n  - "{nav_title}": {new_doc_path}'
    if nav_match:
        mkdocs_path.write_text(text[:nav_match.end()] + entry + text[nav_match.end():])
    else:
        mkdocs_path.write_text(text.rstrip() + "\nnav:" + entry + "\n")


def remove_nav_entry(doc_path):
    mkdocs_path = ROOT / "mkdocs.yml"
    lines = mkdocs_path.read_text().splitlines()
    escaped_doc = re.escape(doc_path)
    pattern = re.compile(rf"^(?P<indent>\s*)-\s+(?:(?P<title>\"[^\"]+\"|[^:\n]+):\s+)?{escaped_doc}\s*$")
    for index, line in enumerate(lines):
        match = pattern.match(line)
        if not match:
            continue
        indent_len = len(match.group("indent"))
        del lines[index]
        parent_index = index - 1
        if parent_index >= 0:
            parent_line = lines[parent_index]
            parent_match = re.match(r"^(?P<indent>\s*)-\s+.+:\s*$", parent_line)
            if parent_match and len(parent_match.group("indent")) < indent_len:
                has_child = False
                for following in lines[parent_index + 1:]:
                    stripped = following.strip()
                    if not stripped:
                        continue
                    following_indent = len(following) - len(following.lstrip(" "))
                    if following_indent <= len(parent_match.group("indent")):
                        break
                    if following_indent > len(parent_match.group("indent")) and stripped.startswith("- "):
                        has_child = True
                        break
                if not has_child:
                    del lines[parent_index]
        mkdocs_path.write_text("\n".join(lines) + "\n")
        return
    raise ValueError("Page was not found in mkdocs.yml nav")


def rename_nav_entry(doc_path, title):
    mkdocs_path = ROOT / "mkdocs.yml"
    lines = mkdocs_path.read_text().splitlines()
    escaped_doc = re.escape(doc_path)
    pattern = re.compile(rf"^(?P<indent>\s*)-\s+(?:(?P<title>\"[^\"]+\"|[^:\n]+):\s+)?{escaped_doc}\s*$")
    quoted_title = title.replace('"', '\\"')
    for index, line in enumerate(lines):
        match = pattern.match(line)
        if not match:
            continue
        indent = match.group("indent")
        if match.group("title"):
            lines[index] = f'{indent}- "{quoted_title}": {doc_path}'
            mkdocs_path.write_text("\n".join(lines) + "\n")
            return
        parent_index = index - 1
        if parent_index >= 0:
            parent_match = re.match(r"^(?P<indent>\s*)-\s+.+:\s*$", lines[parent_index])
            if parent_match and len(parent_match.group("indent")) < len(indent):
                lines[parent_index] = f'{parent_match.group("indent")}- "{quoted_title}":'
                mkdocs_path.write_text("\n".join(lines) + "\n")
                return
        lines[index] = f'{indent}- "{quoted_title}": {doc_path}'
        mkdocs_path.write_text("\n".join(lines) + "\n")
        return
    raise ValueError("Page was not found in mkdocs.yml nav")


def update_nav_for_move(source_doc, destination_doc, old_prefix, new_prefix):
    mkdocs_path = ROOT / "mkdocs.yml"
    lines = mkdocs_path.read_text().splitlines()
    start, end, root_indent = nav_entry_bounds(lines, source_doc)
    entry = lines[start:end]
    del lines[start:end]
    entry = [line.replace(old_prefix, new_prefix) for line in entry]
    destination_index = nav_doc_line_index(lines, destination_doc)
    insert_index, child_indent = nav_child_insert_location(lines, destination_index)
    entry = reindent_nav_entry(entry, root_indent, child_indent)
    lines[insert_index:insert_index] = entry
    mkdocs_path.write_text("\n".join(lines) + "\n")


def nav_doc_line_index(lines, doc_path):
    escaped_doc = re.escape(doc_path)
    pattern = re.compile(rf"^\s*-\s+(?:(?:\"[^\"]+\"|[^:\n]+):\s+)?{escaped_doc}\s*$")
    for index, line in enumerate(lines):
        if pattern.match(line):
            return index
    raise ValueError(f"{doc_path} was not found in mkdocs.yml nav")


def nav_entry_bounds(lines, doc_path):
    index = nav_doc_line_index(lines, doc_path)
    line = lines[index]
    line_indent = leading_spaces(line)
    parent_index = index - 1
    if re.match(r"^\s*-\s+[^:\n]+:\s*$", line) is None and parent_index >= 0:
        parent_line = lines[parent_index]
        parent_indent = leading_spaces(parent_line)
        if parent_indent < line_indent and re.match(r"^\s*-\s+.+:\s*$", parent_line):
            end = nav_subtree_end(lines, parent_index, parent_indent)
            return parent_index, end, parent_indent
    end = nav_subtree_end(lines, index, line_indent)
    return index, end, line_indent


def nav_child_insert_location(lines, destination_index):
    destination_line = lines[destination_index]
    destination_indent = leading_spaces(destination_line)
    title_match = re.match(r"^(?P<indent>\s*)-\s+(?P<title>\"[^\"]+\"|[^:\n]+):\s+(?P<doc>.+?)\s*$", destination_line)
    if title_match:
        child_indent = destination_indent + 4
        lines[destination_index] = f'{title_match.group("indent")}- {title_match.group("title")}:'
        lines.insert(destination_index + 1, " " * child_indent + f"- {title_match.group('doc')}")
        destination_index += 1
    else:
        parent_index = destination_index - 1
        if parent_index >= 0 and leading_spaces(lines[parent_index]) < destination_indent and re.match(r"^\s*-\s+.+:\s*$", lines[parent_index]):
            destination_indent = leading_spaces(lines[parent_index])
        child_indent = destination_indent + 4
    end = nav_subtree_end(lines, destination_index, destination_indent)
    return end, child_indent


def nav_subtree_end(lines, start, indent):
    end = start + 1
    while end < len(lines):
        stripped = lines[end].strip()
        if stripped:
            current_indent = leading_spaces(lines[end])
            if current_indent <= indent:
                break
        end += 1
    return end


def reindent_nav_entry(entry, old_indent, new_indent):
    delta = new_indent - old_indent
    updated = []
    for line in entry:
        indent = leading_spaces(line)
        body = line[indent:]
        updated.append(" " * max(0, indent + delta) + body)
    return updated


def leading_spaces(line):
    return len(line) - len(line.lstrip(" "))


def regenerate_managed_pages(path):
    pages = [path] if path.suffix == ".md" else list(path.rglob("*.md"))
    for page in pages:
        text = page.read_text()
        if BLOCKS_START_TEMPLATE.format(section="page") not in text:
            continue
        blocks = read_blocks(page, "page")
        write_blocks(page, "page", blocks)


def read_section(path, section):
    text = path.read_text()
    start_marker = START_TEMPLATE.format(section=section)
    end_marker = END_TEMPLATE.format(section=section)
    start = text.index(start_marker) + len(start_marker)
    end = text.index(end_marker)
    return text[start:end].strip("\n")


def write_section(path, section, content):
    text = path.read_text()
    start_marker = START_TEMPLATE.format(section=section)
    end_marker = END_TEMPLATE.format(section=section)
    start = text.index(start_marker) + len(start_marker)
    end = text.index(end_marker)
    replacement = "\n" + content.rstrip() + "\n"
    path.write_text(text[:start] + replacement + text[end:])


def marker_bounds(text, start_marker, end_marker):
    start = text.index(start_marker) + len(start_marker)
    end = text.index(end_marker)
    return start, end


def fenced(language, content, title=""):
    language = re.sub(r"[^a-zA-Z0-9_+-]", "", language or "text") or "text"
    title_part = ""
    if title:
        safe_title = str(title).replace('"', "'")
        title_part = f' title="{safe_title}"'
    return f"```{language}{title_part}\n{content.rstrip()}\n```"


def markdown_image_path(path, page_path=None, browser_relative=False):
    docs_root = ROOT / "docs"
    resolved = (ROOT / path).resolve()
    if docs_root in resolved.parents or resolved == docs_root:
        asset_path = resolved.relative_to(docs_root)
        if page_path:
            page_relative = page_path.resolve().relative_to(docs_root)
            if browser_relative and page_relative.name != "index.md":
                page_dir = page_relative.with_suffix("")
            else:
                page_dir = page_relative.parent
            return posixpath.relpath(str(asset_path), str(page_dir))
        return str(asset_path)
    return path


def render_blocks(blocks, page_path=None):
    rendered = []
    for block in blocks:
        block_type = block.get("type", "text")
        title = (block.get("title") or "").strip()
        body = (block.get("body") or "").rstrip()

        if block_type == "text":
            if title:
                rendered.append(wrap_content_box(block, f"## {title}\n\n{render_rich_text(body)}"))
            elif body:
                rendered.append(wrap_content_box(block, render_rich_text(body)))
        elif block_type == "markdown":
            rendered.append(wrap_content_box(block, body))
        elif block_type == "question":
            rendered.append(wrap_content_box(block, f'<div class="admonition question" markdown="1">\n<p class="admonition-title">{escape_html(title or "Question")}</p>\n\n{render_rich_text(body)}\n\n</div>'))
        elif block_type == "logic":
            rendered.append(wrap_content_box(block, f"## {title or 'Logic'}\n\n{render_rich_text(body)}"))
        elif block_type == "callout":
            kind = re.sub(r"[^a-z]", "", (block.get("kind") or "note").lower()) or "note"
            rendered.append(wrap_content_box(block, f'<div class="admonition {kind}" markdown="1">\n<p class="admonition-title">{escape_html(title or kind.title())}</p>\n\n{render_rich_text(body)}\n\n</div>'))
        elif block_type == "checklist":
            lines = [line for line in body.splitlines() if line.strip()]
            has_task_list = any(
                re.match(r"^\s*[-*]\s+\[[ xX]\]\s+", line)
                for line in lines
            )
            has_explicit_list = any(
                re.match(r"^\s*([-*]|\d+\.|[a-zA-Z]\.)\s+", line)
                for line in lines
            )
            if has_task_list:
                rendered.append(wrap_content_box(block, f"## {title or 'Checklist'}\n\n" + "\n".join(lines)))
            elif has_explicit_list:
                rendered.append(wrap_content_box(block, f"## {title or 'Checklist'}\n\n{render_rich_text(body)}"))
            else:
                rendered.append(wrap_content_box(block, f"## {title or 'Checklist'}\n\n" + "\n".join(f"- [ ] {line.strip()}" for line in lines)))
        elif block_type == "code":
            width = block.get("width") or "default"
            width_class = {
                "narrow": " code-window--narrow",
                "wide": " code-window--wide",
                "full": " code-window--full",
            }.get(width, "")
            code = fenced(block.get("language"), body, title)
            rendered.append(wrap_content_box(block, f'<div class="code-window{width_class}" markdown="1">\n\n{code}\n\n</div>'))
        elif block_type == "diagram":
            diagram_title = f"## {title}\n\n" if title else ""
            rendered.append(wrap_content_box(block, diagram_title + fenced("mermaid", body or "flowchart TD\n  A[Start] --> B[End]")))
        elif block_type == "image":
            caption = block.get("caption") or title or "Image"
            images = normalized_images(block)
            if images:
                rendered.append(wrap_content_box(block, render_image_block(images, caption, block, page_path)))
            elif body:
                rendered.append(wrap_content_box(block, body))
            else:
                rendered.append(wrap_content_box(block, render_empty_image_block(caption, block)))
        else:
            if title:
                rendered.append(wrap_content_box(block, f"## {title}\n\n{render_rich_text(body)}"))
            elif body:
                rendered.append(wrap_content_box(block, render_rich_text(body)))
    return "\n\n".join(part for part in rendered if part.strip()).rstrip() + "\n"


def wrap_content_box(block, content):
    background = safe_choice(block.get("boxBackground"), {"plain", "gray", "blue", "green", "yellow", "rose", "violet"}, "plain")
    border = safe_choice(block.get("boxBorder"), {"none", "left", "full"}, "none")
    padding = safe_choice(block.get("boxPadding"), {"compact", "normal", "spacious"}, "normal")
    width = safe_choice(block.get("boxWidth"), {"normal", "wide", "full"}, "normal")
    if background == "plain" and border == "none" and padding == "normal" and width == "normal":
        return content
    classes = [
        "content-box",
        f"content-box--bg-{background}",
        f"content-box--border-{border}",
        f"content-box--padding-{padding}",
        f"content-box--width-{width}",
    ]
    return '<section class="' + " ".join(classes) + '" markdown="1">\n\n' + content + "\n\n</section>"


def safe_choice(value, allowed, fallback):
    return value if value in allowed else fallback


def normalized_images(block):
    images = block.get("images") or []
    if not images and block.get("src"):
        images = [{
            "src": block.get("src"),
            "previewUrl": block.get("previewUrl", ""),
            "caption": block.get("caption", ""),
        }]
    return [image for image in images if image.get("src")]


def render_image_block(images, caption, block, page_path):
    size = re.sub(r"[^a-z]", "", (block.get("imageSize") or "medium").lower()) or "medium"
    width_map = {
        "small": "320px",
        "medium": "560px",
        "large": "760px",
        "full": "100%",
        "custom": block.get("customWidth") or "560px",
    }
    width = width_map.get(size, "560px")
    align = re.sub(r"[^a-z]", "", (block.get("align") or "left").lower()) or "left"
    align_class = {
        "left": "image-window--left",
        "center": "image-window--center",
        "right": "image-window--right",
    }.get(align, "image-window--left")
    layout = re.sub(r"[^a-z]", "", (block.get("layout") or "single").lower()) or "single"
    layout_class = {
        "single": "image-window--single",
        "rows": "image-window--rows",
        "sidebyside": "image-window--side-by-side",
        "grid": "image-window--grid",
    }.get(layout, "image-window--single")
    safe_caption = escape_html(caption)
    image_items = []
    for image in images:
        image_src = markdown_image_path(image.get("src", ""), page_path, browser_relative=True)
        item_caption = escape_html(image.get("caption") or caption)
        safe_src = image_src.replace('"', "%22")
        image_items.append(
            f'  <div class="image-window__item">\n'
            f'    <img src="{safe_src}" alt="{item_caption}">\n'
            f'    <figcaption>{item_caption}</figcaption>\n'
            f'  </div>'
        )
    return (
        f'<figure class="image-window {align_class} {layout_class}" style="--image-window-width: {width};">\n'
        f'  <figcaption class="image-window__title">{safe_caption}</figcaption>\n'
        + "\n".join(image_items) + "\n"
        f'</figure>'
    )


def render_empty_image_block(caption, block):
    width = {
        "small": "320px",
        "medium": "560px",
        "large": "760px",
        "full": "100%",
        "custom": block.get("customWidth") or "560px",
    }.get(block.get("imageSize") or "medium", "560px")
    safe_caption = escape_html(caption)
    return (
        f'<figure class="image-window image-window--placeholder" style="--image-window-width: {width};">\n'
        f'  <figcaption class="image-window__title">{safe_caption}</figcaption>\n'
        f'  <div class="image-window__empty">No image added yet.</div>\n'
        f'</figure>'
    )


def escape_html(value):
    return str(value or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def render_rich_text(body):
    chunks = []
    list_lines = []
    paragraph_lines = []

    def flush_paragraph():
        if paragraph_lines:
            chunks.append(render_indented_paragraphs(paragraph_lines))
            paragraph_lines.clear()

    def flush_list():
        if list_lines:
            chunks.append(render_explicit_list("\n".join(list_lines)))
            list_lines.clear()

    for line in body.splitlines():
        if not line.strip():
            flush_paragraph()
            flush_list()
            continue
        if re.match(r"^\s*([-*]|\d+\.|[a-zA-Z]\.)\s+", line):
            flush_paragraph()
            list_lines.append(line)
        else:
            flush_list()
            paragraph_lines.append(line)
    flush_paragraph()
    flush_list()
    return "\n\n".join(chunks)


def render_indented_paragraphs(lines):
    rows = []
    pending = []

    def flush_pending():
        if pending:
            text = " ".join(line.strip() for line in pending)
            rows.append(f'<p class="learning-paragraph">{sanitize_inline(text)}</p>')
            pending.clear()

    for line in lines:
        indent = len(line) - len(line.lstrip(" "))
        if indent:
            flush_pending()
            rows.append(
                f'<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: {indent};">'
                f'{sanitize_inline(line.strip())}</p>'
            )
        else:
            pending.append(line)
    flush_pending()
    return "\n".join(rows)


def sanitize_inline(text):
    escaped = escape_html(text)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)
    escaped = escaped.replace("&lt;mark&gt;", "<mark>").replace("&lt;/mark&gt;", "</mark>")
    escaped = re.sub(
        r'&lt;span style="((?:color|background-color):\s*#[0-9a-fA-F]{3,6};?)"&gt;(.*?)&lt;/span&gt;',
        r'<span style="\1">\2</span>',
        escaped,
    )
    escaped = re.sub(
        r'&lt;span style=&quot;((?:color|background-color):\s*#[0-9a-fA-F]{3,6};?)&quot;&gt;(.*?)&lt;/span&gt;',
        r'<span style="\1">\2</span>',
        escaped,
    )
    return escaped


def render_explicit_list(body):
    rows = ['<div class="learning-list">']
    for line in body.splitlines():
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip(" "))
        text = line.strip()
        match = re.match(r"^([-*]|\d+\.|[a-zA-Z]\.)\s+(.+)$", text)
        if match:
            marker = escape_html(match.group(1))
            content = sanitize_inline(match.group(2))
            rows.append(
                f'  <div class="learning-list__line" style="--list-indent: {indent};">'
                f'<span class="learning-list__marker">{marker}</span>'
                f'<span>{content}</span></div>'
            )
        else:
            rows.append(
                f'  <p class="learning-list__paragraph">{escape_html(text)}</p>'
            )
    rows.append("</div>")
    return "\n".join(rows)


def indent_markdown(content):
    if not content.strip():
        return "    "
    return "\n".join("    " + line if line else "" for line in content.splitlines())


def read_blocks(path, section):
    text = path.read_text()
    start_marker = BLOCKS_START_TEMPLATE.format(section=section)
    end_marker = BLOCKS_END_TEMPLATE.format(section=section)
    if start_marker not in text or end_marker not in text:
        return unmanaged_markdown_blocks(text, path)
    start, end = marker_bounds(text, start_marker, end_marker)
    raw = text[start:end].strip()
    return json.loads(raw) if raw else []


def write_blocks(path, section, blocks):
    blocks = finalize_staged_images(blocks)
    text = path.read_text()
    blocks_start_marker = BLOCKS_START_TEMPLATE.format(section=section)
    blocks_end_marker = BLOCKS_END_TEMPLATE.format(section=section)
    render_start_marker = RENDER_START_TEMPLATE.format(section=section)
    render_end_marker = RENDER_END_TEMPLATE.format(section=section)
    if blocks_start_marker not in text or blocks_end_marker not in text or render_start_marker not in text or render_end_marker not in text:
        path.write_text(managed_page_text(path, section, blocks))
        return
    blocks_start, blocks_end = marker_bounds(text, blocks_start_marker, blocks_end_marker)
    rendered_start, rendered_end = marker_bounds(text, render_start_marker, render_end_marker)
    block_json = "\n" + json.dumps(blocks, indent=2) + "\n"
    rendered_markdown = "\n" + render_blocks(blocks, path)
    updated = text[:blocks_start] + block_json + text[blocks_end:]
    rendered_start, rendered_end = marker_bounds(updated, render_start_marker, render_end_marker)
    updated = updated[:rendered_start] + rendered_markdown + updated[rendered_end:]
    path.write_text(updated)


def unmanaged_markdown_blocks(text, path):
    title = path.stem.replace("-", " ").title()
    match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    if match:
        title = match.group(1).strip()
    return [{
        "id": "imported-markdown",
        "type": "markdown",
        "title": title,
        "body": text.rstrip(),
        "boxBackground": "plain",
        "boxBorder": "none",
        "boxPadding": "normal",
        "boxWidth": "normal",
    }]


def managed_page_text(path, section, blocks):
    title = next((block.get("pageTitle") for block in blocks if block.get("pageTitle")), path.stem.replace("-", " ").title())
    return (
        f"# {title}\n\n"
        f'{BLOCKS_START_TEMPLATE.format(section=section)}\n'
        f"{json.dumps(blocks, indent=2)}\n"
        f"{BLOCKS_END_TEMPLATE}\n\n"
        f"{RENDER_START_TEMPLATE.format(section=section)}\n"
        f"{render_blocks(blocks, path)}"
        f"{RENDER_END_TEMPLATE.format(section=section)}\n"
    )


def safe_upload_name(filename):
    stem = Path(filename or "image").stem.lower()
    suffix = Path(filename or "image.png").suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
        suffix = ".png"
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-") or "image"
    return f"{stem}-{int(time.time())}{suffix}"


def save_upload(payload):
    target_dir = STAGING_UPLOAD_DIR if payload.get("staged") else UPLOAD_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    filename = safe_upload_name(payload.get("filename"))
    data_url = payload.get("data", "")
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    data = base64.b64decode(data_url)
    if len(data) > 12 * 1024 * 1024:
        raise ValueError("Image is too large")
    path = target_dir / filename
    path.write_bytes(data)
    relative = str(path.relative_to(ROOT))
    preview_url = "/staged/" + filename if payload.get("staged") else markdown_image_path(relative)
    return {"path": relative, "markdownPath": markdown_image_path(relative), "previewUrl": preview_url}


def finalize_staged_images(blocks):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    for block in blocks:
        if block.get("type") != "image":
            continue
        images = normalized_images(block)
        for image in images:
            image["src"] = finalize_staged_image_path(image.get("src", ""))
            image.pop("previewUrl", None)
        block["images"] = images
        if images:
            block["src"] = images[0]["src"]
        block.pop("previewUrl", None)
    return blocks


def finalize_staged_image_path(src):
    if not src.startswith(".handbook-editor/uploads/"):
        return src
    staged_path = (ROOT / src).resolve()
    if STAGING_UPLOAD_DIR not in staged_path.parents:
        raise ValueError("Invalid staged image path")
    target_path = UPLOAD_DIR / staged_path.name
    if not target_path.exists():
        shutil.copy2(staged_path, target_path)
    return str(target_path.relative_to(ROOT))


def save_upload_for_blocks(payload):
    upload = save_upload(payload)
    blocks = payload.get("blocks", [])
    target_id = payload.get("targetId")
    if target_id:
      for block in blocks:
          if block.get("id") == target_id:
              block["type"] = "image"
              block["src"] = upload["path"]
              block["caption"] = block.get("caption") or payload.get("filename") or "Uploaded image"
              break
    path = safe_path(payload["file"])
    write_blocks(path, payload["section"], blocks)
    upload["blocks"] = blocks
    return upload


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_json(200, {"ok": True})

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            if parsed.path == "/editable":
                params = parse_qs(parsed.query)
                path = safe_path(params["file"][0])
                section = params["section"][0]
                self.send_json(200, {"content": read_section(path, section)})
                return
            if parsed.path == "/page-blocks":
                params = parse_qs(parsed.query)
                path = safe_path(params["file"][0])
                section = params["section"][0]
                self.send_json(200, {"blocks": read_blocks(path, section)})
                return
            if parsed.path == "/resolve-page":
                params = parse_qs(parsed.query)
                path = page_path_from_url(params.get("path", [""])[0])
                self.send_json(200, {"file": str(path.relative_to(ROOT)), "path": docs_relative(path)})
                return
            if parsed.path == "/pattern-sections":
                self.send_json(200, list_pattern_sections())
                return
            if parsed.path.startswith("/staged/"):
                self.send_staged_file(parsed.path.removeprefix("/staged/"))
                return
            self.send_json(404, {"error": "Not found"})
        except Exception as exc:
            self.send_json(400, {"error": str(exc)})

    def send_staged_file(self, filename):
        path = (STAGING_UPLOAD_DIR / Path(filename).name).resolve()
        if STAGING_UPLOAD_DIR not in path.parents or not path.exists():
            self.send_json(404, {"error": "Not found"})
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(path.name)[0] or "application/octet-stream")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            parsed_path = urlparse(self.path).path
            if parsed_path not in {"/editable", "/page-blocks", "/upload", "/create-page", "/delete-page", "/rename-page", "/move-preview", "/move-page"}:
                self.send_json(404, {"error": "Not found"})
                return
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length))
            if parsed_path == "/editable":
                path = safe_path(payload["file"])
                write_section(path, payload["section"], payload.get("content", ""))
                self.send_json(200, {"ok": True})
                return
            if parsed_path == "/page-blocks":
                path = safe_path(payload["file"])
                write_blocks(path, payload["section"], payload.get("blocks", []))
                self.send_json(200, {"ok": True})
                return
            if parsed_path == "/create-page":
                self.send_json(200, create_child_page(payload))
                return
            if parsed_path == "/delete-page":
                self.send_json(200, delete_page(payload))
                return
            if parsed_path == "/rename-page":
                self.send_json(200, rename_page(payload))
                return
            if parsed_path == "/move-preview":
                self.send_json(200, move_page(payload, dry_run=True))
                return
            if parsed_path == "/move-page":
                self.send_json(200, move_page(payload))
                return
            if "file" in payload and "section" in payload and "blocks" in payload:
                self.send_json(200, save_upload_for_blocks(payload))
                return
            self.send_json(200, save_upload(payload))
        except Exception as exc:
            self.send_json(400, {"error": str(exc)})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8765), Handler)
    print("Handbook editor running at http://127.0.0.1:8765")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
