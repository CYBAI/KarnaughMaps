var fs = require('fs');
var KarnaughMaps = require('./lib/karnaughMaps');

var inputs;
var stream = fs.createReadStream('Case1');

stream.on('data', function (data) {
    inputs = data.toString().split('\r\n').map(function (val) {
        if (val.length <= 1) {
            return val;
        }

        // return val.split(' ').join('').match(/(.{4})/g);
        return val.split(' ');
    });
});

stream.on('end', function () {
    var len = parseInt(inputs[0], 10);
    for (var _i = 1; _i < len; _i++) {
        console.log('#' + _i);
        var kmap = new KarnaughMaps(inputs[_i]);
        kmap.hwFormatToFormal();
        kmap.mappingMinterms();
        kmap.setGroup();
        kmap.compressImplicant();
        kmap.printPrimeImplicant(true);
    }
});
