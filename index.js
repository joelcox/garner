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
  this._setOperation(column, 'groupBy');
  return this;
};

/**
 * Pick the value from the first row
 * @param {String} column name that is picked
 * @api public
 * @return {Garner}
 */
Garner.prototype.first = function(column) {
  this._setOperation(column, 'first');
  return this;
};

/**
 * Groups and counts all values in a column
 * @param {String} column name that is grouped
 * @api public
 * @return {Garner}
 */
Garner.prototype.groupByRelative = function(column) {
  this._setOperation(column, 'groupByRelative');
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
    that._processOperation('after')
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

  // Write the index of each column to the results and initiate the row counter.
  // This allows us to cache the position of a column, so we can easily retrieve
  // it later by index
  if (that.results._rows === undefined) {
    data.forEach(function(item, index) {
      if (typeof that.results[S(item).camelize().s] !== 'undefined') {
        that.results[S(item).camelize().s]._index = index;
      }
    });

    that.results._rows = 0;
    return true;
  }

  this._processOperation('each', data)
  that.results._rows++;

};

/**
 * Calls the desired hook, for each operation for a single row. If a hook
 * is defined for a certain operation, it will pass the data to the hook
 * function, which will modify the data and assigns it back to the results obj
 * @param {String} name of the hook (before, after, each)
 * @param {Array} row data
 * @api private
 */
Garner.prototype._processOperation = function(hook, row) {

  // Loop over each operation in each column, and append the value
  for (var column in this.results) {

    // Don't loop over private properties
    if (column.substring(0, 1) === '_') continue;

    // Pull the value from the current row from the correct index
    var value;
    if (hook === 'each') value = row[this.results[column]._index];

    for (var operation in this.results[column].operations) {

      // Get the current result for the operation until now and compose name
      var result = this.results[column].operations[operation];
      var fnName = '_' + hook + S(operation).camelize().s;

      // Call the specific hooks function for this operation with the current
      // result which is modified in the hook function.
      if (typeof this[fnName] !== 'undefined') {
        this.results[column].operations[operation] = this[fnName](result, value);
      }

    }

  }

}

/**
 * Takes an object, adds the value to the object if it's not already in
 * the object, else it increases the counter
 * @param {Object} current result set
 * @param {Mixed} value that has be be counted
 * @return {Object} new result set
 * @api private
 */
Garner.prototype._eachgroupBy = function(result, value) {
  // Create or increment the counter of a value for this operation
  if (typeof result[value] === 'undefined') {
    result[value] = 1;
  } else {
    result[value]++;
  }

  return result;
}

/**
 * Proxy for `eachGroupBy`.
 */
Garner.prototype._eachgroupByRelative = function(result, value) {
  return this._eachgroupBy(result, value);
}

/**
 * Devides the results by the total number of rows after everything has been
 * counted
 * @param {Object} current result set
 * @param {undefined}
 * @return {Object} new result set
 * @api private
 */
Garner.prototype._aftergroupByRelative = function(result, value) {
  for (var index in result) {
    result[index] = result[index] / this.results._rows;
  }

  return result;
}


/**
 * Pick the value from the first row
 * @param {Object} current result set
 * @param {undefined}
 * @return {Object} new result set
 * @api private
 */
Garner.prototype._eachfirst = function(result, value) {
  if (typeof result === 'object') return value;
  else return result;
}

module.exports.createGarner = function() {
  return new Garner();
};
