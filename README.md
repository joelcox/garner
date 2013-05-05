Garner
======

Array aggregations for Node.

Example
-------

````
var garner = require('garner'); 
var csv = require('csv');

var stream = csv().from('in.csv');
var garn = garner.createGarner();

garn.groupBy('age').groupBy('hair-color');
garn.process(stream, function(error, results) {
    console.log(results);
});
````

License
-------

MIT
