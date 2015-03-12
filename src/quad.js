/*
* Copyright (c) 2015 Dickson Tam
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*
*/

(function(root) {

  Array.prototype.equals = Array.prototype.equals || function (array) {
    // if the other array is a falsy value, return
    if (!array)
      return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
      return false;

    for (var i = 0, l=this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i]))
          return false;
        }
        else if (this[i] != array[i]) {
          // Warning - two different object instances will never be equal: {x:20} != {x:20}
          return false;
        }
    }
    return true;
  }


  function Row(row) {
    if (Object.getPrototypeOf(this) == Row.prototype)
      throw new Error("The 'new' keyword is NOT required or allowed for Row instantiation.");

    if (row instanceof Row) return row;

    var o = Object.create(Row.prototype);

    var number = Row.parse(row);
    if (!number) return null;

    o.number = number;

    return o;
  }



  Row.parse = function(vary) {
    var row;

    if (typeof vary == 'number') {
      row = vary;
    } else if (typeof vary == 'string') {
      row = parseInt(vary);
    } else {
      return null;
    }

    if (row <= 0 || row > Number.MAX_SAFE_INTEGER) {
      return null;
    }

    return Math.floor(row);
  }

  Row.prototype.hasCell = function(cell) {
    cell = Cell(cell);

    return (cell != null) && (cell.row.number == this.number);
  }

  Row.prototype.cellsInRange = function(range) {
    range = Range(range);

    var collection = Collection();

    if (range != null && range.hasRow(this)) {
      for (var colnum = range.leftColumn.number; colnum <= range.rightColumn.number; colnum++) {
        collection.add(Cell(Column.num2str(colnum) + this.string));
      }
    }

    return collection;
  }

  Row.prototype.compare = function(otherrow) {
    otherrow = Row(otherrow);

    if (otherrow == null) return undefined;

    return this.number - otherrow.number;
  }

  Row.prototype.increment = function(amount) {
    amount = (amount != null)? amount : 1;
    return Row(this.number + amount);
  }

  Object.defineProperty(Row.prototype, 'string', {
    get: function() {
      return this.number + "";
    }
  });

  Object.defineProperty(Row.prototype, 'type', {
    value: "row"
  });

  function Column(colstr) {

    if (Object.getPrototypeOf(this) == Column.prototype)
      throw new Error("The 'new' keyword is NOT required or allowed for Column instantiation.");

    if (colstr instanceof Column) return colstr;

    if (typeof colstr == 'number') return Column(Column.num2str(colstr));
    if (typeof colstr == "string" && parseInt(colstr)) return Column(Column.num2str(parseInt(colstr)));

    var o = Object.create(Column.prototype);



    var string = Column.parse(colstr);
    if (!string) return null;

    o.string = string.toUpperCase();

    return o;
  }

  Column.num2str = function num2str(num) {
    var rv = "";
    var baseCode = 'A'.charCodeAt(0);

    while (num > 0) {
      var quotient = Math.floor(num / 26);
      var remainder = (num - 26 * quotient);
      rv = String.fromCharCode(baseCode + remainder - 1) + rv;
      num = quotient;
    }

    return rv;
  }

  Column.prototype.hasCell = function(cell) {
    cell = Cell(cell);

    return (cell != null) && (cell.column.number == this.number);
  }

  Column.parse = function(colstr) {
    if (typeof colstr != 'string') return null;
    if (!colstr.match(/^([A-Za-z]+)$/)) return null;
    return colstr;
  }

  Column.prototype.increment = function(amount) {
    amount = (amount != null)? amount : 1;
    return Column(this.number + amount);
  }

  Column.prototype.compare = function(othercol) {
    othercol = Column(othercol);

    if (othercol == null) return undefined;

    return this.number - othercol.number;
  }

  Column.prototype.cellsInRange = function(range) {
    range = Range(range);

    var collection = Collection();

    if (range != null && range.hasColumn(this)) {
      for (var rownum = range.topRow.number; rownum <= range.bottomRow.number; rownum++) {
        collection.add(Cell(this.string + rownum));
      }
    }

    return collection;
  }

  Object.defineProperty(Column.prototype, 'number', {
    get: function() {
      var rv = 0;

      alpha = this.string;

      for (var i = 0; i < alpha.length; i++) {
        rv = rv * 26 + (alpha.charCodeAt(i) -'A'.charCodeAt(0) + 1);
      }

      return rv;
    }
  });

  function Cell(qstr) {

    if (Object.getPrototypeOf(this) == Cell.prototype)
      throw new Error("The 'new' keyword is NOT required or allowed for Cell instantiation.");

    if (qstr instanceof Cell) return qstr;

    var o = Object.create(Cell.prototype);

    var split = Cell.parse(qstr);

    if (split == null) return null;

    o.column = Column(split[0]);
    o.row = Row(split[1]);

    if (o.column == null || o.row == null) return null;

    return o;
  }


  Cell.parse = function(cellstr) {

    if (typeof cellstr != 'string') return null;

    var matches = cellstr.match(/^([A-Za-z]+)([1-9][0-9]*)$/);

    if (matches == null) return null;

    return [matches[1], matches[2]];
  }

  Cell.prototype.hasCell = function(cell) {
    cell = Cell(cell);

    return cell.row.hasCell(this) && cell.column.hasCell(this);
  }

  Cell.prototype.inRow = function(row) {
    row = Row(row);

    return (row != null) && row.hasCell(this);
  }

  Cell.prototype.inColumn = function(col) {
    col = Column(col);

    return (col != null) && col.hasCell(this);
  }

  Cell.prototype.increment = function(rowamt, colamt) {
    rowamt = (rowamt != null)? rowamt : 1;
    colamt = (colamt != null)? colamt : 0;

    var column = this.column.increment(colamt);
    var row = this.row.increment(rowamt);

    if (column == null || row == null) return null;

    return Cell(column.string + row.string);
  }

  Cell.prototype.cellsInRange = function(range) {
    range = Range(range);

    if (range == null || !range.hasColumn(this.column) || !range.hasRow(this.row))
      return Collection();

      return Collection(this);
    }

  Object.defineProperty(Cell.prototype, 'string', {
    get: function() {
      return this.column.string + this.row.string;
    }
  });


  function Collection() {
    if (Object.getPrototypeOf(this) == Cell.prototype)
      throw new Error("The 'new' keyword is NOT required or allowed for Range instantiation.");

    var o = Object.create(Collection.prototype);
    o.kvstore = {};

    for (var i= 0; i < arguments.length; i++) {
      o.add(arguments[i]);
    }

    return o;
  }

  Collection.prototype.add = function(quad) {

    if (quad instanceof Array) {
      for (var i=0; i < quad.length; i++) {
        this.add(quad[i]);
      }
    } else if (quad instanceof Collection) {
      this.add(quad.array());
    } else if (quad = Quad(quad)) {
      this.kvstore[quad.string] = quad;

    }

    return this;
  }

  Collection.prototype.has = function(quad) {

    if (quad instanceof Array) {
      return quad.reduce(function(pv, cv) { return this.has(pv) && this.has(cv); }, true);
    } else if (quad instanceof Collection) {
      return this.has(quad.array());
    } else if (quad = Quad(quad)){
      return quad.string in this.kvstore;
    }

    return false;

  }

  Collection.prototype.remove = function(quad) {

    if (quad instanceof Array) {
      for (var i=0; i < quad.length; i++) {
        this.remove(quad[i]);
      }
    } else if (quad instanceof Collection) {
      this.remove(quad.array());
    } else if (quad = Quad(quad)) {
      delete this.kvstore[quad.string];
    }

    return this;
  }

  Collection.prototype.strarray = function() {
      return Object.keys(this.kvstore);
  }

  Collection.prototype.array = function() {
      var collection = this;
      return Object.keys(collection.kvstore).map(function(key) { return collection.kvstore[key] });
  }

  Collection.prototype.matches = function(set) {
    if (!(set instanceof Collection)) {
      set = Collection(set)
    }

    if (set == null) return false;
    if (set.cardinality != this.cardinality) return false;

    var arr1 = this.strarray().sort();
    var arr2 = set.strarray().sort();

    return arr1.equals(arr2);
  }




  Object.defineProperty(Collection.prototype, 'cardinality', {
    get: function() {
      return Object.keys(this.kvstore).length;
    }
  });

  Object.defineProperty(Collection.prototype, "maxRow", {
    get: function() {
      var collection = this;
      var arr = this.array();
      var maxrow = null;

      for (var i=0; i < arr.length; i++) {
        var elem = arr[i];

        if (elem instanceof Row && (maxrow == null || elem.compare(maxrow) > 0)) {
          maxrow = elem;
        } else if (elem instanceof Column) {
          continue;
        } else if (elem instanceof Cell && (maxrow == null || elem.row.compare(maxrow) > 0)) {
          maxrow = elem.row;
        } else if (elem instanceof Range && (maxrow == null || elem.bottomRow.compare(maxrow) > 0)) {
          maxrow = elem.bottomRow;
        }
      }

      return maxrow;
    }
  });

  Object.defineProperty(Collection.prototype, "maxColumn", {
    get: function() {
      var collection = this;
      var arr = this.array();
      var maxcol = null;

      for (var i=0; i < arr.length; i++) {
        var elem = arr[i];

        if (elem instanceof Row) {
          continue;
        } else if (elem instanceof Column && (maxcol == null || elem.compare(maxcol) > 0)) {
          maxcol = elem;
        } else if (elem instanceof Cell && (maxcol == null || elem.column.compare(maxcol) > 0)) {
          maxcol = elem.column;
        } else if (elem instanceof Range && (maxcol == null || elem.rightColumn.compare(maxcol) > 0)) {
          maxcol = elem.rightColumn;
        }
      }

      return maxcol;
    }
  });

  function Range(rstr) {
    if (Object.getPrototypeOf(this) == Range.prototype)
      throw new Error("The 'new' keyword is NOT required or allowed for Range instantiation.");

      if (rstr instanceof Range) return rstr;

      var o = Object.create(Range.prototype);

      var split = Range.parse(rstr);

      if (split == null) return null;

      o.start = Cell(split[0]);
      o.end = Cell(split[1]);

      if (o.start == null || o.end == null) return null;

      return o;

    }

  Range.parse = function(rstr) {
    if (typeof rstr != 'string') return null;

    var matches = rstr.match(/^([A-Za-z]+[1-9][0-9]*):([A-Za-z]+[1-9][0-9]*)$/);

    if (matches == null) return null;
    return [matches[1], matches[2]];
  }

  Range.prototype.extend = function(yamt, xamt) {
    xamt = xamt || 0;
    yamt = yamt || 0;

    var xmod = (this.end.column.number - this.start.column.number) >= 0 ? 1: -1;
    var ymod = (this.end.row.number - this.start.row.number) >= 0 ? 1: -1;

    xamt = xmod * xamt;
    yamt = ymod * yamt;

    yamt = Math.max(yamt, -1 * (this.height - 1));
    xamt = Math.max(xamt, -1 * (this.width - 1));

    var end = this.end.increment(yamt, xamt);

    if (end == null) return null;

    return Range(this.start.column.string + this.start.row.string + ":" + end.column.string + end.row.string);
  }

  Object.defineProperty(Range.prototype, 'string', {
    get: function() {
      return this.start.string + ":" + this.end.string;
    }
  });


  Object.defineProperty(Range.prototype, 'rightColumn', {
    get: function() {
      return this.start.column.number > this.end.column.number? this.start.column : this.end.column;
    }
  });

  Object.defineProperty(Range.prototype, 'leftColumn', {
    get: function() {
      return this.start.column.number < this.end.column.number? this.start.column : this.end.column;
    }
  });

  Object.defineProperty(Range.prototype, 'topRow', {
    get: function() {
      return this.start.row.number < this.end.row.number? this.start.row : this.end.row;
    }
  });

  Object.defineProperty(Range.prototype, 'bottomRow', {
    get: function() {
      return this.start.row.number > this.end.row.number? this.start.row : this.end.row;
    }
  });

  Object.defineProperty(Range.prototype, 'width', {
    get: function() {
      return this.rightColumn.number - this.leftColumn.number + 1;
    }
  })

  Object.defineProperty(Range.prototype, 'height', {
    get: function() {
      return this.bottomRow.number - this.topRow.number + 1;
    }
  });

  Object.defineProperty(Range.prototype, 'size', {
    get: function() {
      return this.height * this.width;
    }
  });

  Range.prototype.hasColumn = function(col) {
    col = Column(col);

    if (col == null) return false;

    return (col.number >= this.leftColumn.number) && (col.number <= this.rightColumn.number);
  }

  Range.prototype.hasRow = function(row) {
    row = Row(row);

    if (row == null) return false;

    return (row.number >= this.topRow.number) && (row.number <= this.bottomRow.number);
  }

  Range.prototype.hasCell = function(cell) {
    cell = Cell(cell);

    if (cell == null) return false;

    return this.hasColumn(cell.column) && this.hasRow(cell.row);
  }

  Object.defineProperty(Range.prototype, 'rows', {
    get: function() {
      var rows = Collection();

      for (var number = this.topRow.number; number <= this.bottomRow.number; number++) {
        rows.add(Row(number));
      }

      return rows;
    }
  });

  Object.defineProperty(Range.prototype, 'columns', {
    get: function() {
      var columns = Collection();

      for (var number = this.leftColumn.number; number <= this.rightColumn.number; number++) {
        columns.add(Column(number));
      }

      return columns;
    }
  });

  Object.defineProperty(Range.prototype, 'cells', {
    get: function() {
      var cells = Collection();

      for (var colnum = this.leftColumn.number; colnum <= this.rightColumn.number; colnum++) {
        for(var rownum = this.topRow.number; rownum <= this.bottomRow.number; rownum++) {
          cells.add(Cell(Column.num2str(colnum) + rownum));
        }
      }

      return cells;
    }
  });

  Range.prototype.cellsInRange = function(range) {

    range = Range(range);

    var collection = Collection();

    var lcol = Math.max(this.leftColumn.number, range.leftColumn.number);
    var rcol = Math.min(this.rightColumn.number, range.rightColumn.number);
    var trow = Math.max(this.topRow.number, range.topRow.number);
    var brow = Math.min(this.bottomRow.number, range.bottomRow.number);

    if (rcol >= lcol && brow >= trow) {
      for (var colnum = lcol; colnum <= rcol; colnum++) {
        for (var rownum = trow; rownum <= brow; rownum++) {
          collection.add(Cell(Column.num2str(colnum) + rownum));
        }
      }
    }

    return collection;
  }

  var Quad = root.Quad = function(qexpr) {
    if (qexpr instanceof Column || qexpr instanceof Row || qexpr instanceof Cell || qexpr instanceof Range || qexpr instanceof Collection) {
      return qexpr;
    }

    if (Column.parse(qexpr)) {
      return Column(qexpr);
    } else if (Row.parse(qexpr)) {
      return Row(qexpr);
    } else if (Cell.parse(qexpr)) {
      return Cell(qexpr);
    } else if (Range.parse(qexpr)) {
      return Range(qexpr);
    } else {
      return null;
    }
  };

  root.Quad.Cell = Cell;
  root.Quad.Column = Column;
  root.Quad.Row = Row;
  root.Quad.Range = Range;
  root.Quad.Collection = Collection;

})(window);
