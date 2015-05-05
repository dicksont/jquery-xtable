###[jQuery XTable](README.md)
##User Selection

XTable also provides an interface for user selection. User selection works by dragging the mouse cursor across the cells to be selected. When providing user selection, please include the jquery-xtable.css file. This file provides CSS rules for selection highlighting.

---
## .selection

To get all the cells currently selected:

     $.table('table').selection

---

## .enableUI

Enables user selection for table cells:

    $.table('table').enableUI();

---

## .disableUI

Disables user selection for table cells:

    $.table('table').enableUI();
