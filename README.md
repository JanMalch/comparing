# comparing <a href="https://www.github.com/JanMalch/comparing"><img src="https://raw.githubusercontent.com/JanMalch/comparing/master/.github/assets/logo.png" width="90" height="90" align="right"></a>

[![npm](https://badge.fury.io/js/comparing.svg)][npm-url]
[![Travis-CI](https://travis-ci.org/JanMalch/comparing.svg?branch=master)][build-url]
[![codecov](https://codecov.io/gh/JanMalch/comparing/branch/master/graph/badge.svg)][codecov-url]
[![minified + gzip](https://badgen.net/bundlephobia/minzip/comparing)][bundlephobia-url]

<i>Easily create descriptive comparators.</i>

## Features

- predefined Comparators for common use-cases
- easily sort arrays of objects via [`Comparators.with`](http://janmalch.github.io/comparing/classes/comparators.html#with)
- easily combine predefined and custom Comparators
- chain or reverse your own custom Comparators
- define custom orders for enums or other arbitrary value sets
- single [`Comparators` class](http://janmalch.github.io/comparing/classes/comparators.html#bylength) as a common namespace
- lightweight, only [739 bytes](https://bundlephobia.com/result?p=comparing) gzipped

Make sure to checkout the [complete documentation][docs-url].

## Installation & Usage

```bash
npm i comparing
```

All functionality is contained in the [`Comparators` class](http://janmalch.github.io/comparing/classes/comparators.html#bylength).

```typescript
import { Comparators, CompareFunction, Comparator } from 'comparing';

// chose from various available Comparators
const simple = [4, 1, 3, 5].sort(Comparators.naturalOrder);
expect(simple).toEqual([1, 3, 4, 5]);

// start with your own simple function
const myCompareFn: CompareFunction<string> = (a, b) => a.charCodeAt(0) - b.charCodeAt(0);
// add `reversed` and `then` to any function with Comparators.of
const complex: Comparator<string> = Comparators.of(myCompareFn)
  .reversed() // reverse any Comparator
  .then(
    // compare by a certain field or other values via `Comparators.with`
    Comparators.with((x) => x.charAt(1), Comparators.ignoreCase)
  );
const result = ['aB', 'bB', 'aa'].sort(complex);
expect(result).toEqual(['bB', 'aa', 'aB']);

// define your own order for known values
const myEnumComparator = Comparators.ofOrder([MyEnum.C, MyEnum.A, MyEnum.B]);
const dataComparator = Comparators.with((data) => data.type, myEnumComparator);
```

[docs-url]: https://janmalch.github.io/comparing/
[npm-url]: https://www.npmjs.com/package/comparing
[build-url]: https://travis-ci.org/JanMalch/comparing
[codecov-url]: https://codecov.io/gh/JanMalch/comparing
[bundlephobia-url]: https://bundlephobia.com/result?p=comparing
