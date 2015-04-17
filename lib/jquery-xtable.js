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

(function(factory_xtable) {
  var jquery = (typeof(jQuery) == 'undefined')? undefined : jQuery;
  var quad;

 if (typeof module !== 'undefined' && module && module.exports) { // Node.js & CommonJS
   jquery = require('jQuery');
   quad = require('Quad');
   module.exports = factory_xtable(jquery,quad);
 } else if (typeof define === 'function' && define.amd) { // Require.js & AMD
   define('jquery-xtable', ['jquery', 'jquery-xtable-quad'], function(jquery, quad) {
     return factory_xtable(jquery, quad);
   });
 } else { // Browser
   quad = jquery.Quad;
   factory_xtable(jquery, quad);
 }

})(function(jQuery, Quad) {

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
        return jQuery(element).attr('data-cell');
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
      var $TABLE = jQuery.table(e.delegateTarget);

      $TABLE.data('mouseDown', false);
    }

    function mouseover(e) {
      var $TABLE = jQuery.table(e.delegateTarget);

      if (!$TABLE.data('mouseDown')) return;

      $TABLE.data('ecell', $TABLE.coord(e.target));
      var scell = $TABLE.data('scell');
      var ecell = $TABLE.data('ecell');

      $TABLE.selection.new(scell + ":" + ecell);
    }

    function mouseleave(e) {
      var $TABLE = jQuery.table(e.delegateTarget);

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

  if (jQuery == null || !(jQuery instanceof Object)) {
    throw new Error("jQuery object not found.");
    return null;
  } else if (jQuery.extend == null) {
    throw new Error("jQuery.extend not found.");
    return null;
  } else {
    jQuery.extend(jQuery, {
      table: function(selector) {

        if (jQuery(selector).prop('tagName') != "TABLE") return null;

        return annointTable(jQuery(selector));
      }
    });

    jQuery.extend(jQuery.table, {
      all: function() {
        var arr = [];

        jQuery('table').each(function() {
          arr.push(annointTable(jQuery(this)));
        });

        return arr;
      }
    });
  }
});
