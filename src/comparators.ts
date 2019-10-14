import { Comparator, CompareFunction } from './types';

/**
 * Common Comparators and utilites to construct them.
 */
export class Comparators {
  /* istanbul ignore next */
  private constructor() {}

  /**
   * Leaves sorting unchanged by returning 0 for every comparison
   */
  static readonly unchanged: Comparator<any> = Comparators.of(() => 0);

  /**
   * Compares the values a and b with the < operator.
   * For strings the alphabetical order will be implied.
   * Returns 0 if values are strictly equal.
   * @param a first value
   * @param b second value
   */
  static readonly lessThan: Comparator<any> = Comparators.of((a: any, b: any) =>
    a === b ? 0 : a < b ? -1 : 1
  );

  /**
   * Compares two values by their natural order.
   * Same as `Comparators.lessThan`.
   * @param a first value
   * @param b second value
   * @see [[Comparators.lessThan]]
   */
  static readonly naturalOrder: Comparator<any> = Comparators.lessThan;

  /**
   * Compares two values by their reverse order.
   * Reverse of `Comparators.naturalOrder`.
   * @param a first value
   * @param b second value
   * @see [[Comparators.naturalOrder]]
   */
  static readonly reversedOrder: Comparator<any> = Comparators.naturalOrder.reversed();

  /**
   * Compares the values a and b with the > operator.
   * For strings the alphabetical order will be implied.
   * Returns 0 if values are strictly equal.
   * @param a first value
   * @param b second value
   */
  static readonly greaterThan: Comparator<any> = Comparators.of((a: any, b: any) =>
    a === b ? 0 : a > b ? -1 : 1
  );

  /**
   * Compares any two values with `localeCompare`.
   * For any type of values their `toString().toLowerCase()` representation will be used.
   * @param a first value
   * @param b second value
   * @see [[Comparators.localeCompare]]
   */
  static readonly ignoreCase: Comparator<any> = Comparators.of((a: any, b: any) =>
    a
      .toString()
      .toLowerCase()
      .localeCompare(b.toString().toLowerCase())
  );

  /**
   * Compares any two values with `localeCompare`.
   * For any type of values their `toString()` representation will be used.
   * @param a first value
   * @param b second value
   * @see [[Comparators.ignoreCase]]
   */
  static readonly localeCompare: Comparator<any> = Comparators.of((a: any, b: any) =>
    a.toString().localeCompare(b.toString())
  );

  /**
   * Compares two values by their length property
   * @param a first value
   * @param b second value
   */
  // tslint:disable-next-line:completed-docs
  static readonly byLength: Comparator<{ length: number }> = Comparators.of(
    (a, b) => a.length - b.length
  );

  /**
   * Compares two values and puts nulls first
   * @param a first value
   * @param b second value
   */
  static readonly nullFirst: Comparator<any> = Comparators.of((a, b) => {
    if (a == null && b == null) {
      return 0;
    } else if (a == null) {
      return -1;
    } else if (b == null) {
      return 1;
    }
    return 0;
  });

  /**
   * Compares two values and puts nulls last
   * @param a first value
   * @param b second value
   */
  static readonly nullLast: Comparator<any> = Comparators.of((a, b) => {
    if (a == null && b == null) {
      return 0;
    } else if (a == null) {
      return 1;
    } else if (b == null) {
      return -1;
    }
    return 0;
  });

  /**
   * Compares two values based on the respective value, extracted by the given function.
   * By default the `naturalOrder` comparator will be used.
   * @param extractor the function used to extract the sort value, defaults to `naturalOrder`
   * @param comparator comparator function to
   * @typeparam T type of the values to compare
   * @typeparam O type of the extracted value to compare by
   */
  static with<T, O>(
    extractor: (t: T) => O,
    comparator: CompareFunction<O> = Comparators.naturalOrder
  ): Comparator<T> {
    return Comparators.of((a: T, b: T) => comparator(extractor(a), extractor(b)));
  }

  /**
   * Takes any comparator and reverses its order
   * @param comparator the comparator function
   * @typeparam T type of the values to compare
   */
  static reverse<T>(comparator: CompareFunction<T>): Comparator<T> {
    return Comparators.of((a, b) => {
      return -1 * comparator(a, b);
    });
  }

  /**
   * Composes multiple comparator functions into one.
   * If the first comparator returns 0, the next one will be used, until none are left.
   * `null`-like values will be removed.
   * @param comparators array of comparator functions
   * @typeparam T type of the values to compare
   */
  static compose<T>(comparators: Array<CompareFunction<T> | undefined | null>): Comparator<T> {
    const _comparators = comparators.filter(Boolean) as Array<CompareFunction<T>>;
    return Comparators.of((a, b) => {
      let order = 0;
      let i = 0;

      while (order === 0 && _comparators[i]) {
        order = _comparators[i++](a, b);
      }

      return order;
    });
  }

  /**
   * Creates a `Comparator` function, by mutating the given comparator function.
   * @param comparator the actual comparator function
   * @typeparam T type of the values to compare
   */
  static of<T>(comparator: CompareFunction<T>): Comparator<T> {
    (comparator as Comparator<T>).then = function(subsequent: CompareFunction<T>) {
      return Comparators.of((a, b) => {
        const firstComp = comparator(a, b);
        if (firstComp !== 0) {
          return firstComp;
        } else {
          return subsequent(a, b);
        }
      });
    };
    (comparator as Comparator<T>).reversed = function() {
      return Comparators.reverse(this);
    };
    return comparator as Comparator<T>;
  }
}
