# comparing <a href="https://www.github.com/JanMalch/comparing"><img src="https://raw.githubusercontent.com/JanMalch/comparing/master/.github/assets/logo.png" width="90" height="90" align="right"></a>

[![npm](https://img.shields.io/npm/v/comparing)][npm-url]
[![Build](https://github.com/JanMalch/comparing/workflows/Build/badge.svg)][build-url]
[![codecov](https://codecov.io/gh/JanMalch/comparing/branch/master/graph/badge.svg)][codecov-url]
[![minified + gzip](https://badgen.net/bundlephobia/minzip/comparing)][bundlephobia-url]

<i>Easily create descriptive comparators.</i>

## Features

- predefined Comparators for common use-cases
- lightweight
- easily sort arrays of objects via [`compareBy`](http://janmalch.github.io/comparing/#compareby)
- [compose](http://janmalch.github.io/comparing/#composecomparators) or [reverse](http://janmalch.github.io/comparing/#reverse) predefined and custom Comparators
- define custom [orders for enums](http://janmalch.github.io/comparing/#comparatorfororder) or other arbitrary value sets

Make sure to checkout the [documentation][docs-url].

## Installation

```bash
npm i comparing
```

## Usage

```typescript
import {
  naturalOrder,
  reverse,
  composeComparators,
  ignoreCase,
  compareBy,
  comparatorOfOrder,
  Comparator,
} from 'comparing';

// chose from various available Comparators
const simple = [4, 1, 3, 5].sort(naturalOrder);
expect(simple).toEqual([1, 3, 4, 5]);

// start with your own simple function
const myCompareFn: Comparator<string> = (a, b) => a.charCodeAt(0) - b.charCodeAt(0);
// create "then ..." comparisons with compose
const complex: Comparator<string> = composeComparators([
  // reverse any comparator
  reverse(myCompareFn),
  // compare by a certain field or other values via `compareBy`
  compareBy((x) => x.charAt(1), ignoreCase),
]);
const result = ['aB', 'bB', 'aa'].sort(complex);
expect(result).toEqual(['bB', 'aa', 'aB']);

// define your own order for known values
const myEnumComparator = comparatorForOrder([MyEnum.C, MyEnum.A, MyEnum.B]);
const myDataComparator = compareBy((data) => data.type, myEnumComparator);
```

[docs-url]: https://janmalch.github.io/comparing/
[npm-url]: https://www.npmjs.com/package/comparing
[build-url]: https://github.com/JanMalch/comparing/actions?query=workflow%3ABuild
[codecov-url]: https://codecov.io/gh/JanMalch/comparing
[bundlephobia-url]: https://bundlephobia.com/result?p=comparing
