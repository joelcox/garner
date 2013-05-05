var S = require('string');

/**
 * Creates a Garner object
 * @api private
 * @constructor
 * @this Garner
 */
function Garner() {
  this.results = {
    '_rows': undefined
  };
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
  if (typeof this.results[column] === 'undefined') {
    this.results[column] = {
      '_index': undefined,
      'operations': {},
    };
  }

  this.results[column].operations[operationType] = {};
};

/**
 * Process a stream, firing a callback when it's done.
 * @param {Stream} array data stream
 * @param {Function} callback fired when the processing is completed or an
 * error is encounters
 * @api public
 */
Garner.prototype.process = function(stream, fn) {
  var that = this;
  stream.on('record', this._processRow.bind(this))
  stream.on('end', function() {
    fn(null, that.results);
  });
};

/**
 * Processes an individual row
 * @param {Array} single row from the multidimension array
 * @api private
 */
Garner.prototype._processRow = function(data) {
  var that = this;

  // Write the index of each column to the results and initiate the row counter
  if (that.results._rows === undefined) {
    data.forEach(function(item, index) {
      if (typeof that.results[S(item).camelize().s] !== 'undefined') {
        that.results[S(item).camelize().s]._index = index;
      }
    });

    that.results._rows = 0;
    return true;
  }

  // Loop over each operation in each column, and append the value
  for (var column in that.results) {

    // Don't loop over private properties
    if (column.substring(0, 1) === '_') continue;

    // Pull the value from the current row from the correct index
    var value = data[that.results[column]._index];

    for (var operation in that.results[column].operations) {

      // Create or increment the counter of a value for this operation
      if (typeof that.results[column].operations[operation][value] === 'undefined') {
        that.results[column].operations[operation][value] = 1;
      } else {
        that.results[column].operations[operation][value]++;
      }
    }
  }

  that.results._rows++;

};

module.exports.createGarner = function() {
  return new Garner();
};
