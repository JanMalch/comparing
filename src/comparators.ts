import { Comparator } from './types';

/**
 * A comparator, that will leave any order unchanged by returning 0 for every comparison.
 */
export const unchanged: Comparator<any> = () => 0;

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
export const naturalOrder: Comparator<any> = (a, b) => (a === b ? 0 : a < b ? -1 : 1);

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
export const reversedOrder: Comparator<any> = (a, b) => (a === b ? 0 : a > b ? -1 : 1);

/**
 * Compares two strings case insensitively with `localeCompare`.
 * @param a first value
 * @param b second value
 * @see localeCompare
 * @example
 * ignoreCase("A", "a") === 0;
 * compareBy(v => v.toString(), ignoreCase)(0, "0") === 0;
 */
export const ignoreCase: Comparator<string> = (a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase());

/**
 * Compares two strings case sensitively with `localeCompare`.
 * @param a first value
 * @param b second value
 * @see ignoreCase
 */
export const localeCompare: Comparator<string> = (a, b) => a.localeCompare(b);

/**
 * Compares two values by their `length` property.
 * Puts the value with the shorter length first.
 * @param a first value
 * @param b second value
 * @example
 * ['abc', 'a', 'ab'].sort(byLength) == ['a', 'ab', 'abc'];
 */
export const byLength: Comparator<{ length: number }> = (a, b) => a.length - b.length;

/**
 * Compares two values by their `size` property.
 * Puts the value with the smaller size first.
 * @param a first value
 * @param b second value
 * @example
 * [new Set([0, 1, 2]), new Set([0]), new Set([0, 1])].sort(bySize)
 *   == [new Set([0]), new Set([0, 1]), new Set([0, 1, 2])];
 */
export const bySize: Comparator<{ size: number }> = (a, b) => a.size - b.size;

/**
 * Compares two values and puts `null` and `undefined` first.
 * Returns `0` if both values are null-ish or not null-ish.
 * @param a first value
 * @param b second value
 * @see nullishLast
 */
export const nullishFirst: Comparator<unknown> = (a, b) => {
  if (a == null && b == null) {
    return 0;
  } else if (a == null) {
    return -1;
  } else if (b == null) {
    return 1;
  }
  return 0;
};

/**
 * Compares two values and puts `null` and `undefined` last.
 * Returns `0` if both values are null-ish or not null-ish.
 * @param a first value
 * @param b second value
 * @see nullishFirst
 */
export const nullishLast: Comparator<any> = (a, b) => {
  if (a == null && b == null) {
    return 0;
  } else if (a == null) {
    return 1;
  } else if (b == null) {
    return -1;
  }
  return 0;
};

/**
 * Compares two values and puts `true` first.
 * @param a first value
 * @param b second value
 * @see trueLast
 * @example
 * // use compareBy to broaden to truthy and falsy values
 * const truthyFirst = compareBy(x => !!x, trueFirst);
 */
export const trueFirst: Comparator<boolean> = (a, b) => (a === b ? 0 : a ? -1 : 1);

/**
 * Compares two values and puts `true` last.
 * @param a first value
 * @param b second value
 * @see trueFirst
 * // use compareBy to broaden to truthy and falsy values
 * const truthyLast = compareBy(x => !!x, trueLast);
 */
export const trueLast: Comparator<boolean> = (a, b) => (a === b ? 0 : a ? 1 : -1);
