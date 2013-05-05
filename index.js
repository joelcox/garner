var S = require('string');
var _ = require('underscore');

/**
 * Creates a Garner object
 * @api private
 * @constructor
 * @this Garner
 */
function Garner() {
  this.operations = [];
  this.results = {};
}

/**
 * Groups and counts all values in a column
 * @param {String} column name that is grouped
 * @api public
 * @return {Garner}
 */
Garner.prototype.groupBy = function(column) {
  this._setOperation(column, 'GROUP_BY');
  return this;
};

/**
 * Sets an operation on a column
 * @param {String} column name that the operation is performed on
 * @param {String} operation that should be performed on the column
 * @api private
 */
Garner.prototype._setOperation = function(column, operationType) {
  column = S(column).camelize();
  if (typeof this.operations[column] === 'undefined') {
    this.operations[column] = [];
  }

  this.operations[column].push(operationType);
};

Garner.prototype.process = function(stream, fn) {
  var that = this;
  stream.on('data', this._processRow.bind(this))
  stream.on('end', function() {
    fn(null, that.columnNames);
  });
};

Garner.prototype._processRow = function(data) {
  var that = this;

  if (typeof this.columnNames === 'undefined') {
    this.columnNames = [];
    data.forEach(function(item) {
      that.columnNames.push(S(item).camelize().s);
    });

    return true;
  }

}

module.exports.createGarner = function() {
  return new Garner();
}
