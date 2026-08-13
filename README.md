# Learnings

Personal Engineering & Problem-Solving Handbook.

This repository is a long-term technical knowledge base for learning, revision, interview preparation, and engineering recall. It is built with MkDocs and Material for MkDocs, using Markdown as the source of truth.

## Local Development

Install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

Run locally:

```bash
mkdocs serve
```

Then open:

```text
http://127.0.0.1:8000
```

Build the static site:

```bash
mkdocs build --strict
```

## Content Principles

- Organize knowledge around concepts and patterns, not chronology.
- Prefer one canonical concept page and link to it from problems, courses, books, and interview notes.
- Keep pages concise enough for revision.
- Explain why an approach applies, not only what the final answer is.
- Use Java as the default implementation language for coding problems.
- Use Mermaid for maintainable diagrams and static images only when Mermaid is insufficient.

## GitHub Pages

The repository includes a minimal GitHub Actions workflow at `.github/workflows/pages.yml`. After a GitHub remote exists and Pages is configured to use GitHub Actions, pushes to `main` will build and deploy the MkDocs site.
