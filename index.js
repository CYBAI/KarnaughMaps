var fs = require('fs');
var kmap = require('./lib/karnaughMaps');

var stream = fs.createReadStream('Case1');
stream.on('data', function (data) {
	console.log(data.toString().split('\r\n'));
});
stream.on('end', function () {
	console.log('__END__');
});