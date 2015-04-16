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

(function() {

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

  var Quad = function(qexpr) {
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

  function class_factory(jquery) {
    jquery = jquery || jQuery;

    if (jquery == null || !(jquery instanceof Object)) {
      throw new Error("Failed to install Quad. jQuery object not found.");
      return false;
    } else if (jquery.extend == null) {
      throw new Error("Failed to install Quad. jQuery object does not have extend method.");
      return false;
    } else {
      jquery.extend(jquery, {
        Quad: Quad
      });

      jquery.extend(jquery.Quad, {
        Cell: Cell,
        Column: Column,
        Row: Row,
        Range: Range,
        Collection: Collection
      });

      console.log('Installed Quad => jQuery.Quad.');
      return Quad;
    }



  }

  if (typeof module !== 'undefined' && module && module.exports) { // Node.js & CommonJS
    module.exports = class_factory();
  } else if (typeof define === 'function' && define.amd) { // Require.js & AMD
    define('jquery-xtable-quad', ['jquery'], function(jquery) {
      class_factory(jquery);
    });
  } else { // Browser
    class_factory();
  }

})();


(function() {

  var Quad;

  function annointTable($TABLE) {
    var $TABLE = $TABLE.extend({
      basis: function() {
        return this.attr('data-basis');
      },
      base: function(basis) {
        basis = basis || "A1";
        var skiprows = Quad.Cell(basis).row.number - 1;
        var skipcols = Quad.Cell(basis).column.number - 1;

        var trows = tr(this);

        trows.children('td,th')
          .removeAttr('data-xcell')
          .removeAttr('data-xrow')
          .removeAttr('data-xcolumn')
          .removeAttr('data-cell')
          .removeAttr('data-row')
          .removeAttr('data-column')

        var seen = Quad.Collection();

        for (var i = skiprows; i < trows.length; i++) {
          var trow = trows[i];
          var acell = Quad.Cell("A" + Quad.Row(i - skiprows + 1).string);

          for (var j = skipcols; j < trow.children.length; j++) {
            var tcell = trow.children[j];

            while (seen.has(acell)) { acell = acell.increment(0,1); }

            var colspan = parseInt(tcell.getAttribute('colspan')) || 1;
            var rowspan = parseInt(tcell.getAttribute('rowspan')) || 1;

            var xcell = Quad.Range(acell.string + ":" + acell.string).extend(rowspan - 1, colspan - 1).cells;

            seen.add(xcell);

            if (xcell) {
              var cellstr = xcell.strarray().join(' ');
              var rowstr = xcell.array().map(function(cell) { return cell.row.string })
                .filter(function(el,idx,arr){ return arr.indexOf(el) >= idx; }).join(' ');
              var colstr = xcell.array().map(function(cell) { return cell.column.string })
                .filter(function(el,idx,arr){ return arr.indexOf(el) >= idx; }).join(' ');

              tcell.setAttribute('data-xcell', cellstr);
              tcell.setAttribute('data-xrow', rowstr);
              tcell.setAttribute('data-xcolumn', colstr);
            }

            if (acell) {
              tcell.setAttribute('data-cell', acell.string);
              tcell.setAttribute('data-row', acell.row.string);
              tcell.setAttribute('data-column', acell.column.string);
            }

          }
        }

        seen.maxColumn && seen.maxRow && this.attr('data-extent', 'A1:' + seen.maxColumn.string + seen.maxRow.string);
        this.attr('data-basis', basis);

        return this;
      },
      extent: function() { return Quad.Range(this.attr('data-extent')); },
      cell: createSliceConstructor(Quad.Cell, 'data-cell'),
      xcell: createSliceConstructor(Quad.Cell, 'data-xcell'),
      row: createSliceConstructor(Quad.Row, 'data-row'),
      xrow: createSliceConstructor(Quad.Row, 'data-xrow'),
      column: createSliceConstructor(Quad.Column, 'data-column'),
      xcolumn: createSliceConstructor(Quad.Column, 'data-xcolumn'),
      range: createSliceConstructor(Quad.Range, 'data-cell'),
      xrange: createSliceConstructor(Quad.Range, 'data-xcell'),
      enableUI: enableUI,
      disableUI: disableUI,
      text: function() {
        var extent = this.extent();
        var text = "";
        for (var i=extent.start.row.number; i < extent.end.row.number; i++) {
          for (var j=extent.start.column.number; j < extent.end.column.number; j++) {
            text += this.cell(Quad.Column(j).string + i).text() + "\t";
          }
          text = text.trim() + "\n";
        }
      },
      coord: function(element) {
        return $(element).attr('data-cell');
      },
    });

    $TABLE.selection = createSelection();


    $TABLE.basis() || $TABLE.base();

    return $TABLE;

    function enableUI() {
      var scell, ecell;
      var mouseDown = false;

      $TABLE.on('mousedown', 'td', mousedown);
      $TABLE.on('mouseup', 'td', mouseup);
      $TABLE.on('mouseover', 'td', mouseover);
      $TABLE.on('mouseleave', mouseleave);

      $TABLE.data('enableUI', true);

      return this;
    }

    function disableUI() {
      $TABLE.off('mousedown', 'td', mousedown);
      $TABLE.off('mouseup', 'td', mouseup);
      $TABLE.off('mouseover', 'td', mouseover);
      $TABLE.off('mouseleave', mouseleave);

      return this;
    }



    function createSliceConstructor(classConstructor, attribute) {
      return function(quad) {
        var quad = Quad(quad);

        if (classConstructor == Quad.Range) {
          var jobj =  jQuery();
          var extent = this.extent();
          var qdarray = quad.cellsInRange(extent).strarray();
          var jqobj = jQuery();

          for (var i=0; i < qdarray.length; i++) {
            jqobj = jqobj.add($TABLE.find('[' + attribute + '~="' + qdarray[i] + '"]'));
          }
        } else {
          jqobj = $TABLE.find('[' + attribute + '~="' + quad.string + '"]');
        }

        return (quad instanceof classConstructor)? annointSlice(jqobj, quad) : annointSlice();
      }
    }

    function annointSlice(jqobj, quad) {

      quad = Quad(quad);

      jqobj = jqobj || jQuery();

      var extObj = {
        quad: quad,
        table: $TABLE,
        count: createReducer(function(cell, cumulative) { return cumulative + 1 }, 0),
        mean: function() { return this.sum() / this.count() },
        max: createReducer(function(cell, cumulative) { return (cumulative >  cell.value())? cumulative : cell.value() }, NaN),
        min: createReducer(function(cell, cumulative) { return (cumulative <  cell.value())? cumulative : cell.value() }, NaN)
      };

      extObj.select = createNewSelection.bind(undefined, extObj.quad);

      if (quad instanceof Quad.Cell) {
        extObj.text = function() { return this.html() || "" };
        extObj.sum = extObj.value = function() { return Number(this.html()) || 0 };
      } else {
        extObj.text = createReducer(function(cell, cumulative) { return cumulative.length? cumulative + " " + cell.text() : cell.text() }, "");
        extObj.sum = extObj.value = createReducer(function(cell, cumulative) { return cumulative + cell.value() }, 0);
        extObj.cells = createMapper(function(e) { return e; });
        extObj.sprint = function() {
          return this.cells().map(function(cell) { return cell.text() });
        };

        extObj.sprintf = function(format) {
          return this.cells().map(function(cell) { return cell.text() });
        };
      }

      return bindSlice(jqobj, extObj);


      function bindSlice(jqobj, object) {
        var ext = {};

        for (prop in object) {
          ext[prop] = (typeof object[prop] == "function")?  object[prop].bind(jqobj) : object[prop];
        }

        jqobj.extend(ext);

        return jqobj;
      }
    }

    function clearSelection() {
      $TABLE.find('td.selected').removeClass('selected');
      $TABLE.data('selection', null);
      $TABLE.selection = createSelection();

      return $TABLE.selection;
    }

    function createNewSelection(quad) {
      clearSelection();
      return createSelection(quad);
    }

    function createSelection(quad) {

      quad = Quad(quad) || Quad($TABLE.data('selection'));

      var jqobj = jQuery();
      var attribute = 'data-cell';

      if (quad != null) {
        var extent = $TABLE.extent();
        var qdarray = quad.cellsInRange(extent).strarray();

        for (var i=0; i < qdarray.length; i++) {
          jqobj = jqobj.add($TABLE.find('[' + attribute + '~="' + qdarray[i] + '"]'));
        }

        td($TABLE).removeClass('selected');
        jqobj.addClass('selected');
        $TABLE.data('selection', quad.string);
      }



      var selobj = $TABLE.selection = annointSlice(jqobj, quad).extend({
        clear: clearSelection,
        new: createNewSelection,
        enableUI: enableUI,
        disable: disableUI
      });



      return selobj;
    }


    function mousedown(e) {

      $TABLE.data('mouseDown', true);
      $TABLE.data('scell', $TABLE.coord(e.target));
      var scell = $TABLE.data('scell');
      $TABLE.selection.new(scell+ ":" + scell);
    }

    function mouseup(e) {
      var $TABLE = $.table(e.delegateTarget);

      $TABLE.data('mouseDown', false);
    }

    function mouseover(e) {
      var $TABLE = $.table(e.delegateTarget);

      if (!$TABLE.data('mouseDown')) return;

      $TABLE.data('ecell', $TABLE.coord(e.target));
      var scell = $TABLE.data('scell');
      var ecell = $TABLE.data('ecell');

      $TABLE.selection.new(scell + ":" + ecell);
    }

    function mouseleave(e) {
      var $TABLE = $.table(e.delegateTarget);

      $TABLE.data('mouseDown', false);
    }
  }

  function tr($table) {
    return ($table.children('tr').length > 0)? $table.children('tr') : $table.children('tbody').children('tr');
  }

  function td($table) {
    return tr($table).children('td');
  }


  function createReducer(fx, initial) {
    return function() {
      if (this.quad == null) return initial;

      var celladdrs = this.quad.cellsInRange(this.table.extent()).array();
      var reduction = initial;

      for (var i=0; i < celladdrs.length; i++) {
        var cell = this.table.cell(celladdrs[i]);
        if (cell.length == 0) continue;
        reduction = fx(cell, reduction);
      }

      return reduction;
    }
  }

  function createMapper(fx) {
    return function() {
      var slice = this;
      if (slice.quad == null) return [];


      return slice.quad.cellsInRange(this.table.extent()).array().map(function(quad) {
        return slice.table.cell(quad.string);
      });
    }
  }

  function class_factory(jquery, quad) {

    jquery = jquery || jQuery;
    quad = quad || jQuery.Quad;

    Quad = quad;
    if (jquery == null || !(jquery instanceof Object)) {
      throw new Error("Failed to install Table. jQuery object not found.");
      return false;
    } else if (jquery.extend == null) {
      throw new Error("Failed to install Quad. jQuery.extend not found.");
      return false;
    } else {
      jquery.extend(jquery, {
        table: function(selector) {

          if (jquery(selector).prop('tagName') != "TABLE") return null;

          return annointTable(jquery(selector));
        }
      });

      jquery.extend(jquery.table, {
        all: function() {
          var arr = [];

          jquery('table').each(function() {
            arr.push(annointTable(jquery(this)));
          });

          return arr;
        }
      });
    }

      console.log('Installed table => jQuery.table.');
      return jQuery.table;
  }


  if (typeof module !== 'undefined' && module && module.exports) {
    module.exports = class_factory();
  } else if (typeof define === 'function' && define.amd) {
    define('jquery-xtable', ['jquery', 'jquery-xtable-quad'], function(jquery, quad) {
      return class_factory(jquery, quad);
    });
  } else {
    class_factory();
  }


})();
