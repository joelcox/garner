var string = require('string');
var _ = require('underscore');

/**
 * Creates a Garner object
 * @api private
 * @constructor
 * @this Garner
 */
function Garner() {
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
  column = string(column).camelize();
  if (typeof this.operations[column] === 'undefined') {
    this.operations[column] = [];
  }

  this.operations[column].push(operationType);
};

Garner.prototype.process = function(stream, fn) {
  var that = this;

  stream.on('data', this._processRow.bind(this))
  stream.on('end', function() {
    fn(null, that.result);
  });
};

Garner.prototype._processRow = function(data) {

  // Keep the column names around
  if (typeof this.columnNames === 'undefined') {

    // Transform all column names to camelCase
    this.columnNames = _.map(data, function(name) {
      return string(name).camelize();
    });
    
  }
}

module.exports.createGarner = function() {
  return new Garner();
}
