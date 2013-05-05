var garner = require('../index.js');
var should = require('should');
var stream = require('stream');

describe('Garner', function() {

  var garn;

  before(function() {
    garn = garner.createGarner();
  });

  it('has a `groupBy` function', function() {
    garn.should.have.property('groupBy');
  });

  it('has a `_setOperation` function', function() {
    garn._setOperation('hair-color', 'GROUP_BY');
    garn.operations.should.have.keys('hairColor');
    garn.operations.hairColor.should.have.length(1);
  });

  it('has a `process` function', function(done) {

    // Mock out a stream
    var csvStream = new stream.Stream()
    csvStream.writable = true;

    csvStream.write = function (data) {
      this.emit('data', data);
      return true;
    }

    csvStream.end = function (data) {
      this.emit('end')
    }

    garn.groupBy('hair-color');
    garn.process(csvStream, function(err, result) {
      result.should.eql(['eyeColor', 'hairColor', 'weight'])
      done();
    });

    csvStream.write(['eye-color', 'hair-color', 'weight']);
    csvStream.write(['blue', 'blonde', '71']);
    csvStream.write(['blue', 'black', '82']);
    csvStream.write(['brown', 'black', '87']);
    csvStream.end();

  });

});