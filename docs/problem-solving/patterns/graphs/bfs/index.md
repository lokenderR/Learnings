# BFS

<script type="application/json" id="editable-blocks-page">
[
  {
    "id": "strategy-overview",
    "type": "question",
    "title": "Strategy Overview",
    "body": "Breadth-first search explores a graph layer by layer.\n\nUse BFS when distance, minimum steps, shortest time in an unweighted graph, or simultaneous spreading is involved.",
    "boxBackground": "blue",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "pageTitle": "BFS"
  },
  {
    "id": "strategy-logic",
    "type": "logic",
    "title": "How This Strategy Works",
    "body": "- Each move has equal cost.\n- The problem asks for minimum number of steps, minutes, levels, or distance.\n- Multiple sources may start spreading at the same time.\n- You can mark nodes/cells visited when they enter the queue.",
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
    "body": "- [ ] [Rotten Oranges](rotten-oranges.md)\n- [ ] [Editable Page Demo](editable-page-demo.md)",
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

<p>Breadth-first search explores a graph layer by layer.</p>

<p>Use BFS when distance, minimum steps, shortest time in an unweighted graph, or simultaneous spreading is involved.</p>

</div>

</section>

<section class="content-box content-box--bg-green content-box--border-left content-box--padding-normal content-box--width-normal" markdown="1">

## How This Strategy Works

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Each move has equal cost.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>The problem asks for minimum number of steps, minutes, levels, or distance.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Multiple sources may start spreading at the same time.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>You can mark nodes/cells visited when they enter the queue.</span></div>
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

- [ ] [Rotten Oranges](rotten-oranges.md)
- [ ] [Editable Page Demo](editable-page-demo.md)

</section>
<!-- rendered-blocks:page:end -->
