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
    a.toString().toLowerCase().localeCompare(b.toString().toLowerCase())
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
   * Compares two values and puts `null` first
   * @param a first value
   * @param b second value
   * @see nullLast
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
   * Compares two values and puts `null` last
   * @param a first value
   * @param b second value
   * @see nullFirst
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
   * Compares two values and puts `true` first
   * @param a first value
   * @param b second value
   * @see trueLast
   */
  static readonly trueFirst: Comparator<boolean> = Comparators.of((a, b) => {
    return a === b ? 0 : a ? -1 : 1;
  });

  /**
   * Compares two values and puts `true` last
   * @param a first value
   * @param b second value
   * @see trueFirst
   */
  static readonly trueLast: Comparator<boolean> = Comparators.of((a, b) => {
    return a === b ? 0 : a ? 1 : -1;
  });

  /**
   * Compares two values based on the respective value, that was extracted by the given function.
   * By default the `naturalOrder` comparator will be used.
   * @param selector function to extract the comparable value
   * @param comparator comparator for the extracted values, defaults to `naturalOrder`
   * @typeparam T type of the values to compare
   * @typeparam O type of the extracted value to compare by
   * @example
   * const idComparator = Comparators.with<{ id: string }, string>(
   *   x => x.id,
   *   Comparators.ignoreCase
   * );
   */
  static with<T, O>(
    selector: (t: T) => O,
    comparator: CompareFunction<O> = Comparators.naturalOrder
  ): Comparator<T> {
    return Comparators.of((a: T, b: T) => comparator(selector(a), selector(b)));
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
   * Returns a factory that will return the appropriate comparator based on the given direction.
   *
   * If the given `direction` matches
   * - the `ascendingIndicator`, the `Comparators.naturalOrder` will be returned.
   * - the `descendingIndicator`, the `Comparators.reversedOrder` will be returned.
   * - none of them, the `Comparators.unchanged` will be returned.
   *
   * @param ascendingIndicator the value that indicates using the natural order
   * @param descendingIndicator the value that indicates using the reversed order
   * @typeparam A type of the ascendingIndicator
   * @typeparam D type of the descendingIndicator
   * @example
   * // create comparator once
   * const myDirectionComparator = Comparators.forDirections('asc', 'desc');
   * // reuse it when sorting the data
   * const { active, direction } = mySort.state;
   * const sortedData = data.sort(Comparators.with(
   *   x => x[active],
   *   myDirectionComparator(direction)
   * ));
   */
  static forDirections<A, D>(
    ascendingIndicator: A,
    descendingIndicator: D
  ): <T>(direction: A | D | unknown) => Comparator<T> {
    return <T>(direction: A | D | unknown): Comparator<T> => {
      if (direction === ascendingIndicator) {
        return Comparators.naturalOrder;
      } else if (direction === descendingIndicator) {
        return Comparators.reversedOrder;
      } else {
        return Comparators.unchanged;
      }
    };
  }

  /**
   * Composes multiple comparator functions into one.
   * If the first comparator returns 0, the next one will be used, until none are left.
   * `null`-like values will be removed.
   * @param comparators array of comparator functions
   * @typeparam T type of the values to compare
   * @example
   * Comparators.compose([Comparators.byLength, Comparators.ignoreCase]);
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
   * @example
   * Comparators.of<number>((a, b) => b - a).reversed();
   */
  static of<T>(comparator: CompareFunction<T>): Comparator<T> {
    (comparator as Comparator<T>).then = function (subsequent: CompareFunction<T>) {
      return Comparators.of((a, b) => {
        const firstComp = comparator(a, b);
        if (firstComp !== 0) {
          return firstComp;
        } else {
          return subsequent(a, b);
        }
      });
    };
    (comparator as Comparator<T>).reversed = function () {
      return Comparators.reverse(this);
    };
    return comparator as Comparator<T>;
  }

  /**
   * Creates a `Comparator` that will sort a set of known values as specified in the given array.
   * If the produced comparator receives an unknown value, an error will be thrown.
   * @param values the values in desired order
   * @typeparam T type of the values to compare
   * @example
   * const comparator = Comparators.ofOrder(['b', 'a', 'c']);
   * const actual = ['b', 'a', 'c', 'b', 'b', 'c', 'a'].sort(comparator);
   * const expected = ['b', 'b', 'b', 'a', 'a', 'c', 'c'];
   * expect(actual).toEqual(expected);
   */
  static ofOrder<T>(values: T[]): Comparator<T> {
    const order = new Map<T, number>();
    values.forEach((v, i) => order.set(v, i));

    return Comparators.of((a: T, b: T) => {
      if (!order.has(a)) {
        throw new Error(`Unknown value for sorting: ${a} (${typeof a})`);
      }
      if (!order.has(b)) {
        throw new Error(`Unknown value for sorting: ${b} (${typeof b})`);
      }
      return order.get(a)! - order.get(b)!;
    });
  }
}
