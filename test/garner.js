var garner = require('../index.js');
var should = require('should');

describe('Garner', function() {

  var garn;

  before(function() {
    garn = garner.createGarner();
  });

  it('has a `groupBy` function', function() {
    garn.should.have.property('groupBy');
  });

  it('has a `groupByRelative` function', function() {
    garn.should.have.property('groupByRelative');
  });

  it('has a `maximum` function', function() {
    garn.should.have.property('maximum');
  });

  it('has a `_setOperation` function', function() {
    garn._setOperation('hair-color', 'GROUP_BY');
    garn.operations.should.have.keys('hairColor');
    garn.operations.hairColor.should.have.length(1);
  });

});