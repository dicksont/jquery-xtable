(function(factory) {

  if (typeof module !== 'undefined' && module && module.exports) { // Node.js & CommonJS
    var isIojs = parseInt(process.version.match(/^v(\d+)\./)[1]) >= 1;

    if (!isIojs) throw new Error('QUnit tests for node require io.js.');

    var dirname = (typeof(__dirname) == "undefined")? "./" : __dirname;
    var qunit = (typeof(QUnit) == "undefined")? require('qunitjs') : QUnit;
    var jsdom = require('jsdom');
    var fs = require('fs');
    var path = require('path');
    var txt = fs.readFileSync(path.resolve(dirname,'sample_tables.html'), 'utf8');
    var document = jsdom.jsdom(txt);
    var window = document.defaultView;
    var jquery = require('jquery')(window);
    var xtable = require('../lib/jquery-xtable.js')(jquery);
    module.exports = factory(qunit, jquery, xtable);
  } else if (typeof define === 'function' && define.amd) { // Require.js & AMD

    define([ 'qunit', 'jquery', 'jquery-xtable'], function(qunit, jquery, xtable) {
      factory(qunit, jquery, xtable);
    });
  } else { // Browser
    factory(QUnit, jQuery, jQuery.table);
  }
})(function(QUnit, jQuery, XTable) {

QUnit.test( ".base", function( assert ) {
  assert.ok(XTable('table.buster').base('A2').column('B').text() == XTable('table.buster').base('B2').column('A').text(), "base('A2').column('B') == base('B2').column('A')");
  assert.ok(XTable('table.buster').base('A1').row(2).text() == XTable('table.buster').base('A2').row(1).text(), "base('A1').row(2) == base('A2').row(1)");
});

QUnit.test( ".text", function( assert ) {
  assert.ok(XTable('table.buster').base('A2').column('A').text() == "24 25 26 27", "column('A').text() == '24 25 26 27'");
  assert.ok(XTable('table.buster').base('A2').row(1).text() == "24 45 .284 4", "row(1).text() == '24 45 .284 4'");
  assert.ok(XTable('table.buster').base('A2').cell('A1').text() == "24", "cell('A1').text() == '24'");
});

QUnit.test( ".value", function( assert ) {
  assert.ok(XTable('table.buster').base('A2').cell('A1').value() == 24, "cell('A1').value() == 24");
});

QUnit.test(".sum", function(assert) {
  assert.ok(XTable('table.buster').base('A2').column('D').sum() == 65, "column('D').sum() == 65");
  assert.ok(XTable('table.buster').base('A2').range('D1:D4').sum() == 65, "range('D1:D4').sum() == 65");
  assert.ok(XTable('table.buster').base('A2').range('D2:D4').sum() == 61, "range('D2:D4').sum() == 61");
});

QUnit.test(".max", function(assert) {
  assert.ok(XTable('table.buster').base('A2').column('D').max() == 24, "column('D').max() == 24");
  assert.ok(XTable('table.buster').base('A2').range('D2:D4').max() == 24, "column('D').range('D1:D4').max() == 24");
  assert.ok(XTable('table.buster').base('A2').range('D2:D4').sum() == 61, "column('D').range('D2:D4').sum() == 61");
});

QUnit.test(".select", function(assert) {
  assert.ok(XTable('table.buster').column('A').select().text() == XTable('table.buster').column('A').text(), "column('A').select() == column('A')");
  assert.ok(XTable('table.buster').range('D1:D3').select().text() == XTable('table.buster').range('D1:D3').text(), "range('D1:D3').select() == range('D1:D3')");
});

QUnit.test(".all", function(assert) {
  assert.ok(XTable.all().length == jQuery('table').length, "all().length == $('table').length");
  assert.ok(XTable.all()[0].get(0) == jQuery('table')[0], "all()[0] == $('table')[0]");
  assert.ok(XTable.all()[1].get(0) == jQuery('table')[1], "all()[1] == $('table')[1]");
});

QUnit.load();

});
