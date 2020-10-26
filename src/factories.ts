import { Comparator } from './types';
import { naturalOrder } from './comparators';

/**
 * Creates a comparator that compares two values of type `T`, based on the selected value of type `O` and the given comparator.
 * If no comparator is passed, the `naturalOrder` comparator will be used.
 * @param selector function to extract the comparable value
 * @param comparator comparator for the extracted values, defaults to `naturalOrder`
 * @example
 * const idComparator = compareBy(x => x.id, naturalOrder);
 * [{ id: 1, name: 'JavaScript' }, { id: 0, name: 'TypeScript' }].sort(idComparator);
 */
export function compareBy<T, O>(
  selector: (t: T) => O,
  comparator: Comparator<O> = naturalOrder
): Comparator<T> {
  return (a: T, b: T) => comparator(selector(a), selector(b));
}

/**
 * Creates a new `Comparator` that imposes the ordering defined by the given array.
 * If the produced comparator receives a value, that isn't in the original array, an error will be thrown.
 * @param values the unique values in desired order
 * @example
 * const myComparator = comparatorForOrder(['b', 'a', 'c']);
 * ['a', 'b', 'c', 'b'].sort(myComparator) == ['b', 'b', 'a', 'c'];
 */
export function comparatorForOrder<T>(values: T[]): Comparator<T> {
  const order = new Map<T, number>();
  for (let i = 0; i < values.length; i++) {
    order.set(values[i], i);
  }
  return (a: T, b: T) => {
    if (!order.has(a)) {
      throw new Error(`Unknown value of type ${typeof a}: ${a}`);
    }
    if (!order.has(b)) {
      throw new Error(`Unknown value of type ${typeof b}: ${b}`);
    }
    return order.get(a)! - order.get(b)!;
  };
}

/**
 * Creates a new `Comparator` that imposes the reverse ordering of the given comparator.
 * @param comparator the comparator function
 */
export function reverseComparator<T>(comparator: Comparator<T>): Comparator<T> {
  return (a, b) => -1 * comparator(a, b);
}

/**
 * Composes multiple comparators into a single new one.
 * The new comparator will call them in order, if the current comparator defined the values as equal.
 *
 * Nullish values in the initial array of comparators will be removed,
 * before creating the composed comparator.
 * @param comparators array of comparator functions
 * @example
 * // compare by length. if equal in length, compare alphabetically
 * const myStringComparator = composeComparators([byLength, localeCompare]);
 */
export function composeComparators<T>(
  comparators: Array<Comparator<T> | undefined | null>
): Comparator<T> {
  const _comparators = comparators.filter(Boolean) as Array<Comparator<T>>;
  return (a, b) => {
    let order = 0;
    let i = 0;
    while (order === 0 && i < _comparators.length) {
      order = _comparators[i++](a, b);
    }
    return order;
  };
}
