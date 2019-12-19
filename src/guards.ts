import { Comparator, CompareFunction } from './types';

/**
 * Type guard that returns `true`, if and only if the given input
 * - is a function
 * - takes two arguments
 * - has a `then` function, which takes one argument
 * - has a `reversed` function, which takes zero arguments
 * @param input any input value
 * @see [[isCompareFunction]]
 * @typeparam T type of the values to compare
 */
export function isComparator<T>(input: any): input is Comparator<T> {
  return (
    typeof input === 'function' &&
    input.length === 2 &&
    'then' in input &&
    typeof input.then === 'function' &&
    input.then.length === 1 &&
    'reversed' in input &&
    typeof input.reversed === 'function' &&
    input.reversed.length === 0
  );
}

/**
 * Type guard that returns `true`, if and only if the given input
 * - is a function
 * - takes two arguments
 * @param input any input value
 * @see [[isComparator]]
 * @typeparam T type of the values to compare
 */
export function isCompareFunction<T>(input: any): input is CompareFunction<T> {
  return typeof input === 'function' && input.length === 2;
}
