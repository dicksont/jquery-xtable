[![Build Status](https://travis-ci.org/dicksont/jquery-xtable.svg?branch=master)](https://travis-ci.org/dicksont/jquery-xtable) [![npm version](https://badge.fury.io/js/jquery-xtable.svg)](http://badge.fury.io/js/jquery-xtable) [![Bower version](https://badge.fury.io/bo/jquery-xtable.svg)](http://badge.fury.io/bo/jquery-xtable)


### jQuery XTable
# Introduction

XTable provides a table selection API for HTML tables on top of jQuery. XTable  augments the base jQuery object with a table function. The developer can use this table function to construct a XTable object. Via the XTable object, the developer can access XTable methods in addition to standard jQuery ones.

### API Documentation
[Table selectors](SELECTORS.md) | [User selection](USERSEL.md)

#Abstract

For example:

```javascript

var obj = $.table('table.buster')


```

gives you access to a suite XTable methods. These methods include:

- **base/basis** - *set/return the origin for coordinate mapping*
- **row/xrow** - *select a row by passing in the row number*
- **column/xcolumn** - *select a column by passing in the column label*
- **cell/xcell** - *select a cell by passing in the cell label*


#Examples
## Styling
To set the background color of cells in row 2 to red:
```javascript
$.table('table').row(2).css('background-color', 'red');
```

To set the text color of cells of A1 to D2 to blue:
```javascript
$.table('table').range('A1:D2').css('color', 'blue');
```


Find the title element in cell A1 and hide it:
```javascript
$.table('table').cell('A1').find('.title').hide();
```

## Data Extraction

To get the text of the first row:

```javascript
$.table('table').row(1).text()
```

To get the text of the A1 cell:
```javascript
$.table('table').cell('A1').text();
```

To get the value of the A1 cell:
```javascript
$.table('table').cell('A1').value();
```

## Statistics
To sum, the value of column D in a table with the mlb class:

```javascript
$.table('table.mlb').column('D').sum()
```

To calculate the average of column D:

```javascript
$.table('table.mlb').column('D').avg()
```

## Coordinate Remapping
Remap coordinates by skipping the first header row. Retrieve the value of the A1 cell with the new coordinate mapping.

```javascript
$.table('table').base('A2').cell('A1').value()
```

Remap coordinates by skipping the first header row and first header column. Retrieve the value of the A1 cell with the new coordinate mapping.
```javascript
$.table('table').base('B2').cell('A1').value()
```

## User Selection

To enable user selection:
```javascript
$.table('table').enableUI();
```

To get cells selected by user:
```javascript
$.table('table').selection
```
