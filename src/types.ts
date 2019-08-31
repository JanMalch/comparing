/**
 * Type alias for a function that compares two values for sorting purposes.
 * @see [[Comparators.of]]
 */
export type CompareFunction<T> = (a: T, b: T) => number;

/**
 * Type alias for a function that compares two values for sorting purposes.
 *
 * Has a `then` function to add a subsequent comparator.
 * Has a `reversed` function to invert the results of this comparator.
 * Comparator functions like these may be constructed by using `Comparators.of`.
 * @see [[Comparators.of]]
 */
export type Comparator<T> = CompareFunction<T> & {
  /**
   * Returns a copy of this comparator, with a subsequent compare function, that will be used if the first one returns `0`.
   * @param subsequent the subsequent CompareFunction
   */
  then: (subsequent: CompareFunction<T>) => Comparator<T>;
  /**
   * Returns a new comparator, which inverts the results of this comparator
   */
  reversed: () => Comparator<T>;
};
