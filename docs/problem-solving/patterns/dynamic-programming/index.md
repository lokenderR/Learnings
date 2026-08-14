# Dynamic Programming

<script type="application/json" id="editable-blocks-page">
[
  {
    "id": "strategy-overview",
    "type": "question",
    "title": "Strategy Overview",
    "body": "Dynamic Programming applies when a problem has overlapping subproblems and decisions whose future value depends on a compact state.",
    "boxBackground": "blue",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "pageTitle": "Dynamic Programming"
  },
  {
    "id": "strategy-logic",
    "type": "logic",
    "title": "How This Strategy Works",
    "body": "- The problem asks for an optimum count, cost, profit, or feasibility answer.\n- Brute force repeats the same subproblems.\n- A small set of past information is enough to make the next decision.\n- The current answer depends on previous answers.",
    "boxBackground": "green",
    "boxBorder": "left",
    "boxPadding": "normal",
    "boxWidth": "normal"
  },
  {
    "id": "strategy-diagram",
    "type": "image",
    "title": "Visual Diagram",
    "body": "",
    "boxBackground": "yellow",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "images": [],
    "src": "",
    "caption": "Attach a diagram or screenshot that explains the strategy.",
    "imageSize": "medium",
    "align": "center",
    "layout": "single",
    "customWidth": "640px"
  },
  {
    "id": "strategy-pseudocode",
    "type": "code",
    "title": "Java Pseudocode",
    "body": "class PatternTemplate {\n    void solve() {\n        // 1. Identify the state or invariant.\n        // 2. Initialize the data structures.\n        // 3. Iterate through the input.\n        // 4. Update state and answer.\n        // 5. Return the final answer.\n    }\n}",
    "boxBackground": "gray",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "language": "java",
    "width": "narrow"
  },
  {
    "id": "strategy-standard-problems",
    "type": "checklist",
    "title": "Standard Problems",
    "body": "- [ ] [State Machine](state-machine/index.md)\n- [ ] [Stock With Transaction Fee](state-machine/stock-with-transaction-fee.md)",
    "boxBackground": "violet",
    "boxBorder": "left",
    "boxPadding": "normal",
    "boxWidth": "normal"
  }
]
</script>

<!-- rendered-blocks:page:start -->
<section class="content-box content-box--bg-blue content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<div class="admonition question" markdown="1">
<p class="admonition-title">Strategy Overview</p>

<p>Dynamic Programming applies when a problem has overlapping subproblems and decisions whose future value depends on a compact state.</p>

</div>

</section>

<section class="content-box content-box--bg-green content-box--border-left content-box--padding-normal content-box--width-normal" markdown="1">

## How This Strategy Works

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>The problem asks for an optimum count, cost, profit, or feasibility answer.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Brute force repeats the same subproblems.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>A small set of past information is enough to make the next decision.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>The current answer depends on previous answers.</span></div>
</div>

</section>

<section class="content-box content-box--bg-yellow content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<figure class="image-window image-window--placeholder" style="--image-window-width: 560px;">
  <figcaption class="image-window__title">Attach a diagram or screenshot that explains the strategy.</figcaption>
  <div class="image-window__empty">No image added yet.</div>
</figure>

</section>

<section class="content-box content-box--bg-gray content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<div class="code-window code-window--narrow" markdown="1">

```java title="Java Pseudocode"
class PatternTemplate {
    void solve() {
        // 1. Identify the state or invariant.
        // 2. Initialize the data structures.
        // 3. Iterate through the input.
        // 4. Update state and answer.
        // 5. Return the final answer.
    }
}
```

</div>

</section>

<section class="content-box content-box--bg-violet content-box--border-left content-box--padding-normal content-box--width-normal" markdown="1">

## Standard Problems

- [ ] [State Machine](state-machine/index.md)
- [ ] [Stock With Transaction Fee](state-machine/stock-with-transaction-fee.md)

</section>
<!-- rendered-blocks:page:end -->
