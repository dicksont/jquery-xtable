<link href="http://kevinburke.bitbucket.org/markdowncss/markdown.css" rel="stylesheet"></link>

### jQuery XTable
# API Usage


XTable is a jQuery-based data extractor and manipulator for HTML tables.

---

## .range

Returns the jQuery object that contains the td cell element matching the selector.

To get all cells within from A1 to B1:

     $.table('table').range('A1:B1')


To select a range of cells from A1 to B1 programmatically:

     $.table('table').range('A1:B1').select()
     
     
To get all the cells currently selected:

     $.table('table').selection




---

## .row

Returns the jQuery object that contains the td elements from the row matching the selector.


To select the first row:

    $.table('table').row(1)

      OR

    $.table('table').row('1')

---

## .enableUI

Enables UI interactions for the table, including cell selection.

    $.table('table').enableUI();

---

## .disableUI

Disables UI interactions for the table, including cell selection.

    $.table('table').enableUI();
