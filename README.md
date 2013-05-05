Garner
======

Array aggregations for Node.

Example
-------

````
var garner = require('garner'); 
var csv = require('csv');

var stream = new Readable()
csv().from.path(path, {delimiter: ';'}).to.stream(stream);

var garn = garner.createGarner();
garn.groupBy('age').groupByRelative('hair-color').maximum('weight');
garn.process(stream, function(error, result) {
    console.log(result);
});
