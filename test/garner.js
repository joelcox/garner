var garner = require('../index.js');
var should = require('should');
var stream = require('stream');

describe('Garner', function() {

  var garn;

  beforeEach(function() {
    garn = garner.createGarner();
  });

  describe('has a `groupBy` function that', function() {

    it('sets a `groupBy` operation for a column', function() {
      garn.groupBy('hair-color');
      garn.results.hairColor.operations.groupBy.should.be.eql({});
    });

  });

  describe('has a `groupByRelative` function that', function() {

    it('sets a `groupByRelative` operation for a column', function() {
      garn.groupByRelative('hair-color');
      garn.results.hairColor.operations.groupByRelative.should.be.eql({});
    });

  });

  describe('has a `first` function that', function() {

    it('sets a `first` operation for a column', function() {
      garn.first('hair-color');
      garn.results.hairColor.operations.first.should.be.eql({});
    });

  });

  describe('has a `_eachGroupBy` function that', function() {

    it('counts occurrences of a value', function() {
      var group = garn._eachgroupBy({}, 'blonde');
      group.should.have.keys('blonde');
      group.blonde.should.eql(1);
      group = garn._eachgroupBy(group, 'blonde');
      group.should.have.keys('blonde');
      group.blonde.should.eql(2);
      group = garn._eachgroupBy(group, 'black');
      group.should.have.keys(['blonde', 'black']);
      group.blonde.should.eql(2);
      group.black.should.eql(1);
    });

  });

  describe('has a `_aftergroupByRelative` function that', function() {

    it('divides the occurrences by the amount of rows', function() {
      garn.results._rows = 10;
      var results = garn._aftergroupByRelative({'foo': 4, 'bar': 6});
      results.foo.should.eql(0.4);
      results.bar.should.eql(0.6);
    });

  });

  describe('has a `_setOperation` function that', function() {

    it('sets an operation for a given column', function() {
      garn._setOperation('hair-color', 'groupBy');
      garn.results.should.have.keys(['_rows', 'hairColor']);
    });

  });

  describe('has a `process` function that', function() {

    it('..umh, does some processing!', function(done) {

      // Mock out a stream
      var csvStream = new stream.Stream();
      csvStream.writable = true;

      csvStream.write = function (data) {
        this.emit('record', data);
        return true;
      }

      csvStream.end = function (data) {
        this.emit('end')
      }

      garn.groupBy('hair-color');
      garn.groupByRelative('hair-color');
      garn.first('weight');

      garn.process(csvStream, function(err, results) {
        results.hairColor.operations.groupBy.blonde.should.eql(1);
        results.hairColor.operations.groupBy.black.should.eql(2);
        results.hairColor.operations.groupByRelative.blonde.should.eql(0.3333333333333333);
        results.hairColor.operations.groupByRelative.black.should.eql(0.6666666666666666);
        results.weight.operations.first.should.eql(71);
        results._rows.should.eql(3);
        done();
      });

      csvStream.write(['eye-color', 'hair-color', 'weight']);
      csvStream.write(['blue', 'blonde', 71]);
      csvStream.write(['blue', 'black', 82]);
      csvStream.write(['brown', 'black', 87]);
      csvStream.end();

    });

  });

});