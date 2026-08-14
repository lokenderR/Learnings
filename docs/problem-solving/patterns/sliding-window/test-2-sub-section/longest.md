# Longest Common Substring 1

<script type="application/json" id="editable-blocks-page">
[
  {
    "id": "problem-statement",
    "type": "question",
    "title": "Problem Statement",
    "body": "You are given an m x n grid where each cell can have one of three values:\n\n1. 0 representing an empty cell,\n2. 1 representing a fresh orange, or\n3. 2 representing a rotten orange.\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.\n\n \n\nExample 1:\n    \n    \n    Input: grid = [[2,1,1],[1,1,0],[0,1,1]]\n    Output: 4\n    Example 2:\n\n    Input: grid = [[2,1,1],[0,1,1],[1,0,1]]\n    Output: -1\n    Explanation: The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.\nExample 3:\n\nInput: grid = [[0,2]]\nOutput: 0\nExplanation: Since there are already no fresh oranges at minute 0, the answer is just 0.\n \n\nConstraints:\n\nm == grid.length\nn == grid[i].length\n1 <= m, n <= 10\ngrid[i][j] is 0, 1, or 2.",
    "boxBackground": "blue",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "pageTitle": "Longest Common Substring 1"
  },
  {
    "id": "problem-images",
    "type": "image",
    "title": "Problem Images / Examples",
    "body": "",
    "boxBackground": "yellow",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "images": [],
    "src": "",
    "caption": "Attach any statement image, example diagram, or screenshot here.",
    "imageSize": "medium",
    "align": "center",
    "layout": "grid",
    "customWidth": "720px"
  },
  {
    "id": "problem-logic",
    "type": "logic",
    "title": "Logic",
    "body": "- Pattern: name the pattern this problem belongs to.\n- State: describe what information must be tracked.\n- Transition: describe how each step changes the state.\n- Answer: describe where the final answer comes from.\n- Edge cases: list null, empty, boundary, duplicate, or unreachable cases.",
    "boxBackground": "green",
    "boxBorder": "left",
    "boxPadding": "normal",
    "boxWidth": "normal"
  },
  {
    "id": "problem-diagram",
    "type": "image",
    "title": "Solution Diagram",
    "body": "",
    "boxBackground": "rose",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "images": [],
    "src": "",
    "caption": "Attach your dry-run, flow, or state diagram here.",
    "imageSize": "medium",
    "align": "center",
    "layout": "single",
    "customWidth": "720px"
  },
  {
    "id": "problem-java-code",
    "type": "code",
    "title": "Java Code",
    "body": "class Solution {\n    public int solve() {\n        // paste final Java solution here\n        return 0;\n    }\n}",
    "boxBackground": "gray",
    "boxBorder": "full",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "language": "java",
    "width": "narrow"
  },
  {
    "id": "problem-complexity",
    "type": "callout",
    "title": "Time And Space Complexity",
    "body": "- Time: O(?)\n- Space: O(?)\n- Why: explain the dominant loop/data structure.",
    "boxBackground": "violet",
    "boxBorder": "left",
    "boxPadding": "normal",
    "boxWidth": "normal",
    "kind": "note"
  }
]
</script>

<!-- rendered-blocks:page:start -->
<section class="content-box content-box--bg-blue content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<div class="admonition question" markdown="1">
<p class="admonition-title">Problem Statement</p>

<p class="learning-paragraph">You are given an m x n grid where each cell can have one of three values:</p>

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">1.</span><span>0 representing an empty cell,</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">2.</span><span>1 representing a fresh orange, or</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">3.</span><span>2 representing a rotten orange.</span></div>
</div>

<p class="learning-paragraph">Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.</p>

<p class="learning-paragraph">Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.</p>

<p class="learning-paragraph">Example 1:</p>

<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: 4;">Input: grid = [[2,1,1],[1,1,0],[0,1,1]]</p>
<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: 4;">Output: 4</p>
<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: 4;">Example 2:</p>

<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: 4;">Input: grid = [[2,1,1],[0,1,1],[1,0,1]]</p>
<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: 4;">Output: -1</p>
<p class="learning-paragraph learning-paragraph--indented" style="--paragraph-indent: 4;">Explanation: The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.</p>
<p class="learning-paragraph">Example 3:</p>

<p class="learning-paragraph">Input: grid = [[0,2]] Output: 0 Explanation: Since there are already no fresh oranges at minute 0, the answer is just 0.</p>

<p class="learning-paragraph">Constraints:</p>

<p class="learning-paragraph">m == grid.length n == grid[i].length 1 &lt;= m, n &lt;= 10 grid[i][j] is 0, 1, or 2.</p>

</div>

</section>

<section class="content-box content-box--bg-yellow content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<figure class="image-window image-window--placeholder" style="--image-window-width: 560px;">
  <figcaption class="image-window__title">Attach any statement image, example diagram, or screenshot here.</figcaption>
  <div class="image-window__empty">No image added yet.</div>
</figure>

</section>

<section class="content-box content-box--bg-green content-box--border-left content-box--padding-normal content-box--width-normal" markdown="1">

## Logic

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Pattern: name the pattern this problem belongs to.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>State: describe what information must be tracked.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Transition: describe how each step changes the state.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Answer: describe where the final answer comes from.</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Edge cases: list null, empty, boundary, duplicate, or unreachable cases.</span></div>
</div>

</section>

<section class="content-box content-box--bg-rose content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<figure class="image-window image-window--placeholder" style="--image-window-width: 560px;">
  <figcaption class="image-window__title">Attach your dry-run, flow, or state diagram here.</figcaption>
  <div class="image-window__empty">No image added yet.</div>
</figure>

</section>

<section class="content-box content-box--bg-gray content-box--border-full content-box--padding-normal content-box--width-normal" markdown="1">

<div class="code-window code-window--narrow" markdown="1">

```java title="Java Code"
class Solution {
    public int solve() {
        // paste final Java solution here
        return 0;
    }
}
```

</div>

</section>

<section class="content-box content-box--bg-violet content-box--border-left content-box--padding-normal content-box--width-normal" markdown="1">

<div class="admonition note" markdown="1">
<p class="admonition-title">Time And Space Complexity</p>

<div class="learning-list">
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Time: O(?)</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Space: O(?)</span></div>
  <div class="learning-list__line" style="--list-indent: 0;"><span class="learning-list__marker">-</span><span>Why: explain the dominant loop/data structure.</span></div>
</div>

</div>

</section>
<!-- rendered-blocks:page:end -->
