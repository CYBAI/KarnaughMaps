require('string.prototype.repeat');
var _ = require('lodash');
var leven = require('leven');

/**
 * String replace character at particular index(es)
 * @param  {Int or IntArray} index     [index to start]
 * @param  {String} character [character which you want to replace]
 * @return {String}           [Replaced character]
 */
String.prototype.replaceAt = function(index, character) {
    if (typeof index !== 'number' && index instanceof Array !== true) {
        throw Error('Please pass a number or an array of number as first argument and your index is ' + index);
    }

    if (index.length === 1 || typeof index === 'number') {
        return this.substr(0, index) + character + this.substr(index + character.length);
    } else {
        var result = this.toString();
        index.forEach(function (val) {
            result = result.substr(0, val) + character + result.substr(val + character.length);
        });
        return result;
    }
    return this;
};

/**
 * DataStructure: Set
 * @return {Set} [return set that there's no duplicate item in array]
 */
function Set (arr) {
    return _.intersection(arr);
}

/**
 * Constructor of Prime Implicant
 * @param {String}  value   [String of binary number]
 * @param {Boolean} isPrime [is prime implicant or not]
 */
function Implicant (value, isDontCare, isPrime) {
    this.value = value || '0000';
    this.implicantIndex = [];
    this.dashIndex = [];
    this.isDontCare = isDontCare || false;
    this.isPrime = isPrime || false;
}

/**
 * KarnaughMaps, 0 for 0, 1 for 1, 2 for X(don't care)
 * @param {String Array} data [Format like `['1000', '1001', '1102', '1100']`]
 */
function KarnaughMaps (data) {
    this._fun = data;
    this._minterms = {};
    this.group = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: []
    };
    this._implicants = [];
    this._implicantLevel = 0;
    this.primeImplicants = [];
    this.result = [];
}

/**
 * Change Homework format to formal format of Karnaugh Map
 * @return {Int Array} [Return re-format data]
 */
KarnaughMaps.prototype.hwFormatToFormal = function() {
    var original = _.clone(this._fun, true);
    this._fun[3] = original[2];
    this._fun[2] = original[3];
    this._fun[7] = original[6];
    this._fun[6] = original[7];
    this._fun[12] = original[8];
    this._fun[13] = original[9];
    this._fun[15] = original[10];
    this._fun[14] = original[11];
    this._fun[8] = original[12];
    this._fun[9] = original[13];
    this._fun[11] = original[14];
    this._fun[10] = original[15];
};

/**
 * Put existing minterm into the corresponding index of minterm array
 * @return {String Array} [This function will not return anything, but put values into this._minterms]
 */
KarnaughMaps.prototype.mappingMinterms = function() {
    var _this = this;
    _.forEach(this._fun, function (val, index) {
        if (val === '1' || val === '2') {
            _this._minterms[index] = decimalToBinary(parseInt(index, 10));
        }
    });
};

/**
 * Group how many there are in the minterm
 * @return {String Array} [This function will not return anything, but put values into corresponding group]
 */
KarnaughMaps.prototype.setGroup = function() {
    var _this = this;
    _.forEach(this._minterms, function (val, index) {
        var groupIdx;
        try {
            groupIdx = val.match(/1/g).length;
        } catch (e) {
            groupIdx = 0;
        }
        var thisGroup = _this.group[groupIdx];
        thisGroup.push(new Implicant(val, checkDontCareOrNot(_this._fun[index])));
        thisGroup[thisGroup.length - 1].implicantIndex.push(parseInt(index, 10));
    });
};

/**
 * Find all Prime Implicant in group
 */
KarnaughMaps.prototype.compressImplicant = function() {
    var _this = this;
    var _implicants;

    // console.log('Compressing ... ');
    do {
        // console.log(this._implicantLevel + '-level compression:');
        if (!_implicants) {
            _implicants = implicantIterator(this, this.group);
        } else {
            _implicants = implicantIterator(this, this._implicants[this._implicantLevel - 1]);
        }
    } while (!_implicants[1]);
};

/**
 * Print Prime Implicant Chart
 * @param  {Boolean} print [if it's true, it will print in YZU HW format]
 */
KarnaughMaps.prototype.printPrimeImplicant = function (print) {
    var _this = this;
    var primeUniqIndex = [];
    var flattenedImplicantIndex = _.flatten(_.map(this.primeImplicants, function (item) {
        return Set(item.implicantIndex);
    }));
    var countIdx = _.countBy(flattenedImplicantIndex, function (value) {
        return value;
    });

    _.forEach(countIdx, function (val, key) {
        if (val === 1 && !_this._minterms[key].isDontCare) {
            primeUniqIndex.push(parseInt(key, 10));
        }
    });

    _.forEach(this.primeImplicants, function (item) {
        var idxSet = Set(item.implicantIndex);
        _.forEach(idxSet, function (val) {
            if (_.contains(primeUniqIndex, val)) {
                if (print) {
                    _this.result.push(item.value.replace(/\-/g, '2'));
                } else {
                    _this.result.push(item.value);
                }
            }
        });
    });

    if (print) {
        _.forEach(this.result, function (val) {
            console.log(val);
        });
    } else {

    }
};

/**
 * If two terms vary by bit(s), that digit(s) will be replaced with a dash('-')
 * @param  {String} value  [String of binary number to be replaced]
 * @param  {Int or IntArray} offset [Where to replace with dash]
 * @return {String}        [ex. replaceToDash('1001', 1) => '1-01']
 */
function replaceToDash (value, offset) {
    return value.replaceAt(offset, '-');
}

/**
 * Decimal to four digit binary
 * @param  {Int} num [Number to be transformed]
 * @return {String}     [Will be a string of binary number]
 */
function decimalToBinary (num) {
    var bin = num.toString(2);
    return '0'.repeat(4 - bin.length)  + bin;
}

/**
 * Check if don't care in the String, and don't care is '2' here
 * @param  {Int} value [Number to be checked]
 * @return {Boolean}       [If there exists any don't care, it will return true. Or, it will return false.]
 */
function checkDontCareOrNot (value) {
    if (value.indexOf('2') !== -1) {
        return true;
    } else {
        return false;
    }
}

/**
 * Get the offset of different character between term1 and term2
 * @param  {String} term1 [string for comparison]
 * @param  {String} term2 [string to compare with term1]
 * @return {Int}       [The offset of different character]
 */
function getDifferentOffsets (term1, term2) {
    Array.prototype.slice.call(term1).forEach(function (val, index) {
        if (val !== term2[index]) {
            offset = index;
        }
    });
    return offset;
}

/**
 * Iterate implicants to find the primes
 * @param  {KarnaughMaps} thisArg [`this` refer to context of thisArg]
 * @param  {Array} iter    [what to iterate for]
 * @return {Array}         [first element is PrimeImplicant and second one will determine finishing the loop or not]
 */
function implicantIterator (thisArg, iter) {
    var _this = thisArg;
    var prevSet;
    var setImplicant;
    var thisImplicant = [];

    if (!thisArg._implicantLevel) {
        _.reduce(iter, function (prev, curr, key) {
            if (!prev.length && _this._implicantLevel === 0) {
                return curr;
            }
            var prevCloned = _.clone(prev, true);
            comparisonLoop(prevCloned, curr, thisImplicant, _this);
            return curr;
        });
    } else {
        var cloned = _.clone(iter, true);
        comparisonLoop(cloned, iter, thisImplicant, _this);
    }

    prevSet = _.reduce(_this._implicants, function (prev, curr) {
        return concatToSet(prev, curr);
    });

    _this._implicants.push(Set(thisImplicant));
    _this._implicantLevel++;

    setImplicant = _.reduce(_this._implicants, function (prev, curr) {
        return concatToSet(prev, curr);
    });

    return [setImplicant , _.isEqual(prevSet, setImplicant)];
}

/**
 * Compare prev and curr implicant to find it's prime or not
 * @param  {Array} prev          [first implicant]
 * @param  {Array} curr          [second implicant]
 * @param  {Array} thisImplicant [this time of prime implicant]
 */
function comparisonLoop (prev, curr, thisImplicant, _this) {
    _.forEach(prev, function (prevVal) {
        var isPrime = true;
        _.forEach(curr, function (currVal) {
            if (leven(prevVal.value, currVal.value) === 1) {
                isPrime = false;
                var prevCloned = _.clone(prevVal, true);

                var dashIndex = getDifferentOffsets(prevCloned.value, currVal.value);
                prevCloned.dashIndex.push(dashIndex);
                prevCloned.value = replaceToDash(prevCloned.value, dashIndex);

                var findCheck = _.find(thisImplicant, function (item, key) {
                    return item.value === prevCloned.value;
                });

                if (!findCheck) {
                    prevCloned.implicantIndex.push(prevCloned.implicantIndex[0]);
                    thisImplicant.push(prevCloned);
                } else {
                    var findCheckIdx = _.findIndex(thisImplicant, {value: findCheck.value});
                    thisImplicant[findCheckIdx].implicantIndex = Set(findCheck.implicantIndex.concat(currVal.implicantIndex));
                }
            }
        });

        if (isPrime) {
            prevVal.isPrime = isPrime;
            _this.primeImplicants.push(prevVal);
        }
    });
}

/**
 * Concat two array to be a Set
 * @param  {Array} orig     [Previous array]
 * @param  {Array} concated [Post array. It will follow by the previous.]
 * @return {Set}          [Concated and Intersection-ed array]
 */
function concatToSet (orig, concated) {
    return Set(orig.concat(concated));
}

/**
 * Print Compress Implicant
 * @param  {String} value1 [Previous Implicant]
 * @param  {String} value2 [Post Implicant]
 * @param  {String} result [Combination Implicant]
 * @return {String}        [Output of compressing value1 and value2]
 */
function printCompressImplicant (value1, value2, result) {
    return 'COMPRESS(' + value1 + ', ' + value2 + ') = ' + result;
}

module.exports = KarnaughMaps;
