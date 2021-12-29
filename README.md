# comparing <a href="https://www.github.com/JanMalch/comparing"><img src="https://raw.githubusercontent.com/JanMalch/comparing/master/.github/assets/logo.png" width="90" height="90" align="right"></a>

[![npm](https://img.shields.io/npm/v/comparing)][npm-url]
[![documentation](https://img.shields.io/badge/docs-available-success)][docs-url]
[![minified + gzip](https://badgen.net/bundlephobia/minzip/comparing)][bundlephobia-url]
[![Build](https://github.com/JanMalch/comparing/workflows/Build/badge.svg)][build-url]
[![codecov](https://codecov.io/gh/JanMalch/comparing/branch/master/graph/badge.svg)][codecov-url]

<i>Easily create descriptive comparators.</i>

## Features

- predefined Comparators for common use-cases
- lightweight
- easily sort arrays of objects via [`compareBy`](https://janmalch.github.io/comparing/modules.html#compareBy)
- [compose](https://janmalch.github.io/comparing/modules.html#composeComparators) or [reverse](https://janmalch.github.io/comparing/modules.html#reverseComparator) predefined and custom Comparators
- define custom [orders for enums](https://janmalch.github.io/comparing/modules.html#comparatorForOrder) or other arbitrary value sets
- create comparators that [support type unions](https://janmalch.github.io/comparing/modules.html#comparatorWithPredicate)

Make sure to check out the [documentation][docs-url].

## Installation

```bash
npm i comparing
```

Import all comparators, factories and types `from 'comparing'`.

## Examples

All comparators are fully tested, so you can find more examples in the [unit tests][test-files-url].
A lot of comparators also have examples in their [documentation][docs-url].

### Basic usage

```typescript
import { naturalOrder } from 'comparing';

const actual = [4, 1, 3, 5].sort(naturalOrder);
expect(actual).toEqual([1, 3, 4, 5]);
```

```typescript
const comparator: Comparator<string | null> = composeComparators([nullishFirst, localeCompare]);
const actual = ['A', 'a', 'b', null, 'B'].sort(comparator);
expect(actual).toEqual([null, 'a', 'A', 'b', 'B']);

const reversedComparator = reverseComparator(comparator);
const actualReversed = ['A', 'a', 'b', null, 'B'].sort(reversedComparator);
expect(actual).toEqual(['B', 'b', 'A', 'a', null]);
```

### Comparing objects

```typescript
const nameComparator: Comparator<{ name: string }> = compareBy((x) => x.name, ignoreCase);
const orderComparator = compareBy((x) => x.order, composeComparators([nullishLast, naturalOrder]));
const myObjectComparator = composeComparators([orderComparator, nameComparator]);

const actual = [
  { name: 'B', order: 1 },
  { name: 'F' },
  { name: 'C', order: 3 },
  { name: 'A', order: 1 },
  { name: 'D' },
  { name: 'E', order: 2 },
].sort(myObjectComparator);

expect(actual).toEqual([
  { name: 'A', order: 1 },
  { name: 'B', order: 1 },
  { name: 'E', order: 2 },
  { name: 'C', order: 3 },
  { name: 'D' },
  { name: 'F' },
]);
```

The library has no dependencies, thus only creates and
works with the JavaScript objects and functions you already know.

```typescript
import {
  compareBy,
  comparatorForOrder,
  compareBy,
  composeComparators,
  Comparator,
} from 'comparing';
import toposort from 'toposort'; // not included in this library

const graph = [
  // must first put on the shirt before the jacket, and so on ...
  ['put on your shirt', 'put on your jacket'],
  ['put on your shorts', 'put on your jacket'],
  ['put on your shorts', 'put on your shoes'],
];

const taskComparator = comparatorForOrder(toposort(graph));
const comparator: Comparator<{ day: number; task: string }> = composeComparators([
  compareBy((x) => x.day), // naturalOrder implicitly
  compareBy((x) => x.task, taskComparator),
]);

const todoList = [
  { day: 0, task: 'put on your jacket' },
  { day: 0, task: 'put on your shirt' },
  { day: 1, task: 'put on your shoes' },
  { day: 2, task: 'put on your shirt' },
  { day: 1, task: 'put on your jacket' },
  { day: 1, task: 'put on your shorts' },
].sort(comparator);

expect(todoList).toEqual([
  { day: 0, task: 'put on your shirt' },
  { day: 0, task: 'put on your jacket' },
  { day: 1, task: 'put on your shorts' },
  { day: 1, task: 'put on your jacket' },
  { day: 1, task: 'put on your shoes' },
  { day: 2, task: 'put on your shirt' },
]);
```

[docs-url]: https://janmalch.github.io/comparing/
[npm-url]: https://www.npmjs.com/package/comparing
[build-url]: https://github.com/JanMalch/comparing/actions?query=workflow%3ABuild
[codecov-url]: https://codecov.io/gh/JanMalch/comparing
[bundlephobia-url]: https://bundlephobia.com/result?p=comparing
[test-files-url]: https://github.com/JanMalch/comparing/tree/master/test
