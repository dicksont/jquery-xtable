[![Build Status](https://travis-ci.org/dicksont/jquery-xtable.svg?branch=master)](https://travis-ci.org/dicksont/jquery-xtable) [![npm version](https://badge.fury.io/js/jquery-xtable.svg)](http://badge.fury.io/js/jquery-xtable) [![Bower version](https://badge.fury.io/bo/jquery-xtable.svg)](http://badge.fury.io/bo/jquery-xtable)


### jQuery XTable
# Introduction

XTable provides a table selection API for HTML tables on top of jQuery. XTable  augments the base jQuery object with a table function. The developer can use this table function to construct a XTable object. Via the XTable object, the developer can access XTable methods in addition to standard jQuery ones.

[Table selectors](SELECTORS.md) | [User selection](USERSEL.md) | [More examples](EXAMPLES.md)


# Sample

For example, when you specify:

```javascript

var ez = $.table('table.buster')

```

you will be able to access additional XTable methods via the *ez* variable. These selectors include:

- **base/basis** - *set/return the origin of the coordinate system*
- **row/xrow** - *select a row by passing in the row number*
- **column/xcolumn** - *select a column by passing in the column label*
- **cell/xcell** - *select a cell by passing in the cell label*
