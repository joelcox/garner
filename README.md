Garner
======

Array aggregations for Node.

Example
-------

````
var garner = require('garner'); 
var csv = require('csv');
var stream = require('stream');

var stream = new stream.Stream();
csv().from.path(path, {delimiter: ';'}).to.stream(stream);

var garn = garner.createGarner();
garn.groupBy('age').groupBy('hair-color');
garn.process(stream, function(error, results) {
    console.log(results);
});

License
-------

MIT
