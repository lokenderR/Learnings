# State Machine DP

<script type="application/json" id="editable-blocks-page">
[
  {
    "id": "strategy-overview",
    "type": "question",
    "title": "Strategy Overview",
    "body": "State Machine DP is useful when the process moves between a small number of meaningful states after each decision.",
    "boxBackground": "blue",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "pageTitle": "State Machine DP"
  },
  {
    "id": "strategy-logic",
    "type": "logic",
    "title": "How This Strategy Works",
    "body": "- You repeatedly choose between actions such as buy, sell, hold, rest, take, skip, open, or close.\n- Some actions are legal only from certain states.\n- The best future depends on the current state, not the full history.\n\nMental Model:\nName each state by what must be true after processing the current item.\n\nFor stock problems, common states are:\n\n- `cash`: not holding stock after this day\n- `hold`: holding stock after this day",
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
    "body": "- [ ] [Stock With Transaction Fee](stock-with-transaction-fee.md)\n- [ ] Dynamic Programming\n- [ ] Greedy, when a local exchange argument can replace state tracking",
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

<p>State Machine DP is useful when the process moves between a small number of meaningful states after each decision.</p>

</div>

</section>

<section class="content-box content-box--bg-green content-box--border-left content-box--padding-normal content-box--width-normal" markdown="1">

## How This Strategy Works

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>You repeatedly choose between actions such as buy, sell, hold, rest, take, skip, open, or close.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Some actions are legal only from certain states.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>The best future depends on the current state, not the full history.</span></div>
</div>

<p>Mental Model: Name each state by what must be true after processing the current item.</p>

<p>For stock problems, common states are:</p>

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>`cash`: not holding stock after this day</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>`hold`: holding stock after this day</span></div>
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

- [ ] [Stock With Transaction Fee](stock-with-transaction-fee.md)
- [ ] Dynamic Programming
- [ ] Greedy, when a local exchange argument can replace state tracking

</section>
<!-- rendered-blocks:page:end -->
