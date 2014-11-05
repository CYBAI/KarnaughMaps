# Karnaugh Map in javascript

Find essential prime implicants in Functions by [Quine-McCluskey Algorithm](http://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm) and print them.

The function order is as same as [wiki's sample function](http://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm#Step_1:_finding_prime_implicants).

## example

``` js
var KarnaughMaps = require('karnaughMaps');
var kmap = new KarnaughMaps(input);
kmap.mappingMinterms();
kmap.setGroup();
kmap.compressImplicant();
kmap.printPrimeImplicant();
```
