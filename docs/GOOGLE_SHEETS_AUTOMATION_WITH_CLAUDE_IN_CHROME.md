# Google Sheets Automation with Claude in Chrome

> A practical guide for batch-editing Google Spreadsheets using Claude in Chrome MCP tools and JavaScript automation.
>
> Based on real-world experience automating a timesheet spreadsheet (GAVIGO Engineering Timesheet 2026).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Core Technique: ClipboardEvent Paste](#core-technique-clipboardevent-paste)
5. [Step-by-Step Workflow](#step-by-step-workflow)
6. [Cell Navigation](#cell-navigation)
7. [Formatting Cells](#formatting-cells)
8. [Locale Pitfalls](#locale-pitfalls)
9. [Approaches That Do NOT Work](#approaches-that-do-not-work)
10. [Troubleshooting](#troubleshooting)
11. [Complete Code Examples](#complete-code-examples)

---

## Overview

Google Sheets does not expose a simple DOM-based editing API. Unlike standard web forms, cells are rendered inside a custom `<canvas>`-based grid (`waffle-grid-container`), making direct DOM manipulation impossible. However, Google Sheets **does** intercept `ClipboardEvent` dispatched on its internal `.cell-input` element, which enables programmatic bulk data insertion.

This guide documents the only reliable method found for batch-editing Google Sheets cells from the browser context using Claude in Chrome's `javascript_tool`.

## Prerequisites

- **Claude in Chrome extension** installed and connected
- A Google Spreadsheet open in a Chrome tab within the MCP tab group
- The spreadsheet must be editable (you must have write permissions)
- Tab ID obtained via `tabs_context_mcp`

## Getting Started

### 1. Get Tab Context

Always start by calling `tabs_context_mcp` to discover available tabs:

```
Tool: mcp__claude-in-chrome__tabs_context_mcp
```

This returns tab IDs. Identify the tab with your Google Sheet.

### 2. Take a Screenshot

Before any automation, take a screenshot to understand the current state:

```
Tool: mcp__claude-in-chrome__computer
Action: screenshot
tabId: <your-tab-id>
```

### 3. Identify the Active Cell

The active cell determines where pasted data will be inserted. Check the **Name Box** (top-left corner showing cell reference like "A1") in the screenshot.

## Core Technique: ClipboardEvent Paste

The key discovery: Google Sheets listens for `paste` events on its internal `.cell-input` element. By constructing a `ClipboardEvent` with TSV (Tab-Separated Values) and HTML table data, we can paste multi-cell data in bulk.

### How It Works

1. Prepare data as a 2D array of strings
2. Convert to TSV format (tabs between columns, newlines between rows)
3. Also convert to an HTML `<table>` (Google Sheets uses this for rich paste)
4. Create a `DataTransfer` object with both `text/plain` (TSV) and `text/html` formats
5. Dispatch a `ClipboardEvent` of type `paste` on the `.cell-input` element
6. Google Sheets intercepts the event and populates cells starting from the active cell

### Minimal Example

```javascript
// Data to paste (each inner array = one row)
const rows = [
  ["2026-01-21", "Alice", "Setup project", "4"],
  ["2026-01-22", "Alice", "Build feature", "6"],
];

// Convert to TSV
const tsv = rows.map(row => row.join('\t')).join('\n');

// Convert to HTML table
const html = '<table>' +
  rows.map(row =>
    '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>'
  ).join('') +
'</table>';

// Get the cell-input element
const cellInput = document.querySelector('.cell-input');

// Create DataTransfer with both formats
const dt = new DataTransfer();
dt.setData('text/plain', tsv);
dt.setData('text/html', html);

// Dispatch paste event
const pasteEvent = new ClipboardEvent('paste', {
  bubbles: true,
  cancelable: true,
  clipboardData: dt
});

cellInput.dispatchEvent(pasteEvent);
// Returns: true (if event was dispatched successfully)
```

### Critical Requirements

| Requirement | Details |
|-------------|---------|
| Target element | Must be `.cell-input`, NOT `.waffle-grid-container` or other elements |
| Event type | Must be `ClipboardEvent` with type `paste` |
| Data formats | Must include BOTH `text/plain` (TSV) and `text/html` (table) |
| Active cell | Must be set to the correct starting position BEFORE dispatching |
| `bubbles` | Must be `true` |
| `cancelable` | Must be `true` |

## Step-by-Step Workflow

### Step 1: Navigate to the Target Cell

Use the Name Box to navigate to the starting cell. This is the most reliable method:

```
Tool: mcp__claude-in-chrome__computer
Action: left_click
coordinate: [57, 127]    // Name Box location (top-left of spreadsheet)
```

Then type the cell reference:

```
Tool: mcp__claude-in-chrome__computer
Action: type
text: "A2"
```

Press Enter to confirm:

```
Tool: mcp__claude-in-chrome__computer
Action: key
text: "Return"
```

### Step 2: Verify Active Cell

Take a screenshot to confirm the Name Box shows the correct cell reference (e.g., "A2").

### Step 3: Execute the Paste Script

Use `javascript_tool` to run the ClipboardEvent paste:

```
Tool: mcp__claude-in-chrome__javascript_tool
Action: javascript_exec
tabId: <your-tab-id>
text: |
  const rows = [
    ["2026-01-21", "Chan Meng", "Project initialization: Spec Kit setup...", "4"],
    ["2026-01-22", "Chan Meng", "README documentation...", "3"],
    // ... more rows
  ];
  const tsv = rows.map(row => row.join('\t')).join('\n');
  const htmlRows = rows.map(row =>
    '<tr>' + row.map(c => '<td>' + c + '</td>').join('') + '</tr>'
  ).join('');
  const html = '<table>' + htmlRows + '</table>';
  const cellInput = document.querySelector('.cell-input');
  const dt = new DataTransfer();
  dt.setData('text/plain', tsv);
  dt.setData('text/html', html);
  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: dt
  });
  cellInput.dispatchEvent(pasteEvent);
```

### Step 4: Verify the Result

Take a screenshot to confirm all data was pasted correctly. Check:
- Data starts at the correct cell
- All rows and columns are populated
- No data corruption or misalignment

### Step 5: Undo if Needed

If the paste landed in the wrong position, immediately undo with Ctrl+Z:

```
Tool: mcp__claude-in-chrome__computer
Action: key
text: "ctrl+z"
```

Then re-navigate to the correct cell and retry.

## Cell Navigation

### Using the Name Box (Recommended)

The Name Box is the most reliable way to navigate to a specific cell or select a range:

1. Click the Name Box (top-left corner, shows current cell reference)
2. Type the cell reference (e.g., `A2`) or range (e.g., `D2:D19`)
3. Press Enter

The Name Box is typically located at approximately `[57, 127]` in screen coordinates, but verify with a screenshot first.

### Using Keyboard Shortcuts

- **Ctrl+Home**: Go to cell A1
- **Ctrl+End**: Go to last used cell
- **Ctrl+G** or **F5**: Open "Go to" dialog (may not work in all locales)

### Clicking Cells Directly

Less reliable due to:
- Scroll position uncertainty
- Canvas-based rendering (coordinates may not match visible cells)
- Merged cells or hidden rows/columns can shift positions

Always verify the active cell via the Name Box after clicking.

## Formatting Cells

### Number Format (Remove Decimals)

To change number format for a range:

1. Select the range via Name Box (e.g., type `D2:D19` and press Enter)
2. Open **Format > Number > Custom number format**
3. Select or type the format `0` (integer, no decimals)
4. Click **Apply**

Menu navigation coordinates (approximate):
- Format menu: `[265, 47]`
- Number submenu: hover/click on "Number" item
- Custom number format: scroll to bottom of Number submenu

### Text Wrapping

To enable text wrapping so long text is fully visible:

1. Select the range via Name Box (e.g., `C2:C20`)
2. Open **Format > Wrapping > Wrap**

This auto-expands row heights to fit the content.

### Via Toolbar

You can also use toolbar buttons. Take a screenshot to identify button positions:
- **Decrease decimal places**: `.0` button with left arrow
- **Text wrapping**: icon in toolbar (looks like a curved arrow wrapping text)

## Locale Pitfalls

Google Sheets respects the spreadsheet's locale setting, which affects how numbers, dates, and separators are interpreted.

### Turkish Locale (and similar European locales)

| Symbol | Meaning in US/UK | Meaning in Turkish |
|--------|-------------------|--------------------|
| `.` (period) | Decimal separator | Thousands separator |
| `,` (comma) | Thousands separator | Decimal separator |

### Common Problems

#### Problem: Decimal numbers interpreted as dates
- Input: `"2.5"` (intended as 2.5 hours)
- Result: Interpreted as date `02.05.2026` (May 2nd)
- **Fix**: Use comma as decimal separator: `"2,5"`

#### Problem: SUM returns wildly wrong values
- Cause: Some cells contain date serial numbers instead of numeric values (due to the above date misinterpretation)
- **Fix**: Correct the individual cells first, then recalculate

### Best Practice

Before pasting numeric data, check the spreadsheet's locale:
1. Go to **File > Settings** (or **File > Spreadsheet settings**)
2. Note the locale (e.g., "Turkey", "United States", "Germany")
3. Format numbers accordingly in your paste data

**For integer values, use plain integer strings (e.g., `"4"`, `"7"`) which are unambiguous across all locales.**

### Data Validation

Google Sheets may have data validation rules on cells. For example, an "Hours" column might restrict input to numbers between 0 and 24. A SUM formula result (e.g., 56) would violate this validation. Place summary formulas in columns outside the validated range.

## Approaches That Do NOT Work

The following methods were tested and **failed** for Google Sheets automation:

### 1. `navigator.clipboard.writeText()` + Ctrl+V

```javascript
// DOES NOT WORK
await navigator.clipboard.writeText("data");
// Then pressing Ctrl+V pastes the browser URL, not the clipboard content
```

**Why**: The `javascript_tool` execution context lacks the user gesture required for clipboard API access. Even if `writeText` succeeds, subsequent Ctrl+V from the `computer` tool pastes the system clipboard (which contains the page URL), not the programmatically set content.

### 2. `document.execCommand('copy')`

```javascript
// DOES NOT WORK
const textarea = document.createElement('textarea');
textarea.value = 'data';
document.body.appendChild(textarea);
textarea.select();
document.execCommand('copy'); // Returns false - "Copy failed"
```

**Why**: `execCommand('copy')` requires a trusted user gesture (click/keypress) context. Scripts executed via MCP do not have this context.

### 3. Direct DOM Manipulation

```javascript
// DOES NOT WORK
document.querySelector('.cell-input').textContent = 'new value';
```

**Why**: Google Sheets uses a virtual rendering model. The DOM elements are presentation layers; changing their text content does not update the underlying spreadsheet data model.

### 4. Google Apps Script via URL Navigation

```javascript
// DOES NOT WORK - causes infinite auth redirect loop
window.location.href = 'https://script.google.com/macros/s/.../exec';
```

**Why**: Google Apps Script endpoints require OAuth authentication. Navigating to them triggers redirect loops (Error 400) because the automated browser session cannot complete the OAuth flow.

### 5. Google Sheets API via `fetch()`

```javascript
// DOES NOT WORK - no auth token available
fetch('https://sheets.googleapis.com/v4/spreadsheets/ID/values/A1', {
  headers: { 'Authorization': 'Bearer TOKEN' }
});
```

**Why**: There is no way to obtain a valid OAuth token from within the page context. The Google Sheets API requires a properly scoped Bearer token.

### 6. ClipboardEvent on `waffle-grid-container`

```javascript
// DOES NOT WORK
const grid = document.querySelector('.waffle-grid-container');
grid.dispatchEvent(new ClipboardEvent('paste', { ... }));
```

**Why**: Google Sheets only intercepts paste events on the `.cell-input` element, not on the grid container.

## Troubleshooting

### Data pasted in wrong position

**Cause**: Active cell was not at the intended starting position.
**Fix**: Undo (Ctrl+Z), navigate to the correct cell via Name Box, and retry.

### Paste event returns `true` but no data appears

**Possible causes**:
- The `.cell-input` element was not found (check with `document.querySelector('.cell-input')`)
- The spreadsheet was in a modal/dialog state
- A cell was in edit mode (press Escape first)

**Fix**: Press Escape to exit any edit mode, click on a cell to ensure the sheet is focused, then retry.

### Numbers show unexpected decimal places

**Cause**: Number format includes decimal places (e.g., `#,##0.00`).
**Fix**: Select the range and change format to `0` via Format > Number > Custom number format.

### Dropdown/validation cells not accepting values

**Cause**: The pasted value doesn't match the validation list.
**Fix**: Ensure pasted values exactly match the dropdown options (case-sensitive).

### Script execution timeout

**Cause**: Very large data sets may cause the paste to take longer.
**Fix**: Split into smaller batches (e.g., 50 rows at a time) and paste sequentially.

## Complete Code Examples

### Example 1: Paste a Full Timesheet

```javascript
// Prepare timesheet data
const rows = [
  ["2026-01-21", "Chan Meng", "Project initialization: Spec Kit setup, feature specification, implementation plan, task breakdown, full-stack prototype implementation (Go backend, React dashboard, WebSocket, K8s manifests - 73 files, 6154+ lines)", "4"],
  ["2026-01-22", "Chan Meng", "README documentation, DigitalOcean App Platform deployment configuration and iterative debugging (12 deployment fix commits across Dockerfile, buildpack, go.sum issues)", "3"],
  ["2026-01-22", "Chan Meng", "Kubernetes cluster deployment with managed Redis, restore full K8s/Redis infrastructure code, deployment status documentation (11 files, 5180+ lines)", "3"],
];

// Build TSV (tab-separated values)
const tsv = rows.map(row => row.join('\t')).join('\n');

// Build HTML table (Google Sheets uses this for rich paste)
const htmlRows = rows.map(row =>
  '<tr>' + row.map(c => '<td>' + c + '</td>').join('') + '</tr>'
).join('');
const html = '<table>' + htmlRows + '</table>';

// Target the cell-input element
const cellInput = document.querySelector('.cell-input');
if (!cellInput) throw new Error('.cell-input not found - is a Google Sheet open?');

// Create DataTransfer with both formats
const dt = new DataTransfer();
dt.setData('text/plain', tsv);
dt.setData('text/html', html);

// Dispatch paste event
const pasteEvent = new ClipboardEvent('paste', {
  bubbles: true,
  cancelable: true,
  clipboardData: dt
});

const result = cellInput.dispatchEvent(pasteEvent);
`Paste dispatched: ${result}, rows: ${rows.length}`;
```

### Example 2: Paste a Single Cell Value

For single-cell edits, the same technique works but it's often easier to use the `computer` tool to double-click a cell and type directly:

```
Tool: mcp__claude-in-chrome__computer
Action: double_click
coordinate: [x, y]  // cell position

Tool: mcp__claude-in-chrome__computer
Action: type
text: "new value"

Tool: mcp__claude-in-chrome__computer
Action: key
text: "Return"
```

### Example 3: Insert a Formula

Formulas can be typed directly into cells:

```
1. Navigate to the target cell via Name Box
2. Type the formula:

Tool: mcp__claude-in-chrome__computer
Action: type
text: "=SUM(D2:D19)"

3. Press Enter:

Tool: mcp__claude-in-chrome__computer
Action: key
text: "Return"
```

**Note**: For formulas, typing is more reliable than the paste method because Google Sheets formula parsing varies by locale (e.g., `;` vs `,` as argument separator).

### Example 4: Read Cell Values

To read the current value of the active cell, check the formula bar:

```javascript
// Read the formula bar content
const formulaBar = document.querySelector('.cell-input');
formulaBar ? formulaBar.textContent : 'No cell-input found';
```

Or take a screenshot and read the formula bar visually.

## Summary of Key Findings

| Method | Works? | Notes |
|--------|--------|-------|
| ClipboardEvent on `.cell-input` | **Yes** | The only reliable bulk-paste method |
| `navigator.clipboard` API | No | Lacks user gesture context |
| `document.execCommand('copy')` | No | Requires trusted user gesture |
| Direct DOM manipulation | No | Doesn't update spreadsheet data model |
| Google Apps Script URL | No | Auth redirect loop |
| Google Sheets API fetch | No | No OAuth token available |
| ClipboardEvent on grid container | No | Wrong target element |
| `computer` tool typing | **Yes** | Works for single cells, slow for bulk |
| Name Box navigation | **Yes** | Most reliable cell navigation method |

## Tips for Claude in Chrome Automation

1. **Always screenshot first** - Understand the page state before acting
2. **Use Name Box for navigation** - More reliable than clicking cells
3. **Verify after paste** - Screenshot to confirm data landed correctly
4. **Keep Ctrl+Z ready** - Undo immediately if paste goes wrong
5. **Check locale settings** - Number/date formats vary by locale
6. **Use integers when possible** - Avoids locale decimal separator issues
7. **Escape edit mode first** - Press Escape before dispatching paste events
8. **Batch large datasets** - Split into groups of ~50 rows for reliability
9. **Include both TSV and HTML** - Google Sheets uses both for paste interpretation
10. **Test with a small dataset first** - Verify the approach works before pasting all data
