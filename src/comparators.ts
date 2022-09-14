import { Comparable } from './types';

/**
 * A comparator, that will leave any order unchanged by returning 0 for every comparison.
 */
export function unchanged(): number {
  return 0;
}

/**
 * Compares the values `a` and `b` by their natural order via the `<` operator.
 * Returns `0` if the values are strictly equal.
 * @param a first value
 * @param b second value
 * @example
 * // ascending
 * [0, 3, 5, 1, 2, 4].sort(naturalOrder) == [0, 1, 2, 3, 4, 5];
 * naturalOrder(-1, 1) === -1;
 * naturalOrder("AA", "B") === -1; // alphabetical for strings
 * naturalOrder("A", "a") === -1; // alphabetical for strings
 */
export function naturalOrder<T>(a: T, b: T): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

/**
 * Compares the values `a` and `b` by their natural reversed order via the `>` operator.
 * Returns `0` if the values are strictly equal.
 * @param a first value
 * @param b second value
 * @example
 * // descending
 * [0, 3, 5, 1, 2, 4].sort(reversedOrder) == [5, 4, 3, 2, 1, 0];
 * reversedOrder(-1, 1) === 1;
 * reversedOrder("AA", "B") === 1; // alphabetical for strings
 * reversedOrder("A", "a") === 1; // alphabetical for strings
 * reversedOrder(0, 0) === 0;
 * reversedOrder(0, "0") === 1;
 */
export function reversedOrder<T>(a: T, b: T): number {
  return a === b ? 0 : a > b ? -1 : 1;
}

/**
 * Compares two strings case insensitively with `localeCompare`.
 * @param a first value
 * @param b second value
 * @see localeCompare
 * @example
 * ignoreCase("A", "a") === 0;
 * compareBy(v => v.toString(), ignoreCase)(0, "0") === 0;
 */
export function ignoreCase(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

/**
 * Compares two strings case sensitively with `localeCompare`.
 * @param a first value
 * @param b second value
 * @see ignoreCase
 */
export function localeCompare(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Compares two values by their `length` property.
 * Puts the value with the shorter length first.
 * @param a first value
 * @param b second value
 * @example
 * ['abc', 'a', 'ab'].sort(byLength) == ['a', 'ab', 'abc'];
 */
export function byLength(a: { length: number }, b: { length: number }): number {
  return a.length - b.length;
}

/**
 * Compares two values by their `size` property.
 * Puts the value with the smaller size first.
 * @param a first value
 * @param b second value
 * @example
 * [new Set([0, 1, 2]), new Set([0]), new Set([0, 1])].sort(bySize)
 *   == [new Set([0]), new Set([0, 1]), new Set([0, 1, 2])];
 */
export function bySize(a: { size: number }, b: { size: number }): number {
  return a.size - b.size;
}

/**
 * Compares two values and puts `null` and `undefined` first.
 * Returns `0` if both values are null-ish or not null-ish.
 * @param a first value
 * @param b second value
 * @see nullishLast
 */
export function nullishFirst<T>(a: T, b: T): number {
  if (a == null && b == null) {
    return 0;
  } else if (a == null) {
    return -1;
  } else if (b == null) {
    return 1;
  }
  return 0;
}

/**
 * Compares two values and puts `null` and `undefined` last.
 * Returns `0` if both values are null-ish or not null-ish.
 * @param a first value
 * @param b second value
 * @see nullishFirst
 */
export function nullishLast<T>(a: T, b: T): number {
  if (a == null && b == null) {
    return 0;
  } else if (a == null) {
    return 1;
  } else if (b == null) {
    return -1;
  }
  return 0;
}

/**
 * Compares two values and puts `true` first.
 * @param a first value
 * @param b second value
 * @see trueLast
 * @example
 * // use compareBy to broaden to truthy and falsy values
 * const truthyFirst = compareBy(x => !!x, trueFirst);
 */
export function trueFirst(a: boolean, b: boolean): number {
  return a === b ? 0 : a ? -1 : 1;
}

/**
 * Compares two values and puts `true` last.
 * @param a first value
 * @param b second value
 * @see trueFirst
 * @example
 * // use compareBy to broaden to truthy and falsy values
 * const truthyLast = compareBy(x => !!x, trueLast);
 */
export function trueLast(a: boolean, b: boolean): number {
  return a === b ? 0 : a ? 1 : -1;
}

/**
 * Compares two values that implement the `Comparable` interface,
 * by invoking the `compareTo` method on the first value,
 * with the second value as the argument.
 * @param a first value
 * @param b second value
 * @example
 * class Person implements Comparable<Person> {
 *   constructor(public readonly name: string, public readonly age: number) {
 *   }
 *   compareTo(other: Person): number {
 *     // implement this any way you want
 *     return naturalOrder(this.age, other.age);
 *   }
 * }
 * [new Person('a', 100), new Person('b', 20), new Person('c', 50)].sort(comparables);
 */
export function comparables<T>(a: Comparable<T>, b: T): number {
  return a.compareTo(b);
}
