###[jQuery XTable](README.md)
## Selectors

XTable has a set of selectors that makes cell, row, column, range, and user selections easy.

---

## .range | .xrange

Returns the jQuery object that contains the td cell element matching the selector.

To get all the cells from A1 to B1:

     $.table('table').range('A1:B1')


To select a range of cells from A1 to B1 programmatically:

     $.table('table').range('A1:B1').select()


To get all the cells currently selected:

     $.table('table').selection


---

## .row | .xrow

Returns the jQuery object that contains the td elements from the row matching the selector.


To select the first row:

    $.table('table').row(1)

      OR

    $.table('table').row('1')

---

## .column | .xcolumn

Returns the jQuery object that contains the td elements from the column matching the selector.


To select the column A:

    $.table('table').column('A')

---

## .cell | .xcell

Returns the jQuery object that contains the td cell element matching the selector.


To select the cell A1:

    $.table('table').column('A1')
