# AGENTS.md

This repository is a long-term personal technical learning handbook. Optimize for learning, revision, pattern recognition, and recall, not content volume.

## Core Principles

- Markdown is the source of truth.
- Maintain the existing information architecture unless the user asks to reorganize it.
- Prefer canonical concept pages and link to them from problems, courses, books, notes, and case studies.
- Avoid duplicate explanations across the repository.
- Use internal links when they help connect related ideas.
- Preserve existing content unless explicitly asked to change it.
- Keep pages concise enough for revision.
- Do not add unnecessary dependencies.
- Do not introduce a backend, database, Docker, Kubernetes, or app framework unless explicitly requested.
- Update `mkdocs.yml` navigation when adding, moving, or renaming pages.
- Ensure links still work after restructuring.
- Run `mkdocs build --strict` after structural changes.

## Coding Problem Convention

Coding problems are organized by pattern:

```text
Pattern
  -> Variant
      -> Representative Problems
```

Every important coding problem should explain why the pattern applies. Do not only provide a final solution.

Use Java as the default programming language.

Use this structure:

- Problem Name
- Quick Reference
- Problem in Short
- What Is Being Asked?
- Constraints -> Implications
- Pattern Recognition
- Base Pattern vs This Problem
- Mental Model
- Visual Model
- Algorithm
- Dry Run
- Java Implementation
- Complexity
- Common Mistakes
- Key Recall
- Related Problems

Complexity sections must explain why the time and space bounds hold, not only state Big-O.

## Review Status Convention

Use simple Markdown metadata for mastery tracking:

- Learning
- Needs Review
- Comfortable
- Mastered

Do not build a database. Keep the convention simple so automation can be added later without rewriting content.

## Pattern Pages

Pattern pages should teach:

- Recognition signals
- Mental model
- Core algorithm
- Visual representation
- Common variants
- Complexity characteristics
- Common mistakes
- Canonical problems
- Related patterns

## System Design Concept Convention

System Design concept pages should support:

- What is it?
- Why does it exist?
- Problem it solves
- Mental model
- Architecture / diagram
- Components
- Request/data flow
- Trade-offs
- Scaling characteristics
- Failure scenarios
- Alternatives
- When to use
- When not to use
- Real-world examples
- Interview perspective
- Key recall
- Related concepts

Use Mermaid heavily for architecture and data-flow diagrams where practical.

## HLD Case Study Convention

HLD case studies may include:

- Requirements
- Functional requirements
- Non-functional requirements
- Scale estimates
- API design
- Data model
- High-level architecture
- Components
- Data flow
- Storage
- Caching
- Messaging
- Partitioning
- Replication
- Availability
- Consistency
- Failure handling
- Bottlenecks
- Trade-offs
- Evolution / scaling
- Interview discussion
- Key recall

Do not force every section when it does not make sense.

## LLD Convention

LLD pages may include:

- Problem / requirements
- Actors
- Use cases
- Entities
- Relationships
- Interfaces
- Classes
- Responsibilities
- Design patterns
- UML / Mermaid class diagrams
- Sequence diagrams
- Extensibility
- SOLID considerations
- Trade-offs
- Java implementation where useful
- Key recall

## Course And Book Notes

Course structure:

```text
Course
  -> Module
      -> Lesson
```

Book structure:

```text
Book
  -> Chapter
      -> Notes
```

Courses and books should avoid becoming isolated silos. Link important ideas to canonical handbook pages.

## Diagrams And Assets

- Prefer Mermaid for maintainable diagrams.
- Use static PNG/SVG assets when Mermaid is insufficient.
- Store images in `docs/assets/images/`.
- Store diagram source or exports in `docs/assets/diagrams/`.

## Local Commands

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Serve locally:

```bash
mkdocs serve
```

Build:

```bash
mkdocs build --strict
```
