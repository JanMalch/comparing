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

/**
 * A factory that holds a list of comparators and attached predicates.
 * Use the `add` method to push additional comparators with predicates, thus broadening the range of accepted values and types.
 *
 * `toComparator()` will produce the final `Comparator`, that will only accept values which match one of the added predicates.
 * Predicates will be checked in the same order as they were added.
 *
 * **On each comparator call both arguments must match the same predicate.**
 * If no such predicate exists, the comparator will throw an error.
 *
 * Use type guards as predicates to ensure the best type safety.
 *
 * @example
 * // inferred type: Comparator<string | number>
 * const unionComparator = comparatorWithPredicate(isString, ignoreCase)
 *   .add(isNumber, reversedOrder)
 *   .toComparator();
 *
 * // set type explicitly when not using a proper type guard; otherwise any will be inferred
 * // inferred type: Comparator<string | number | boolean | Person>
 * const anotherUnionComparator = comparatorWithPredicate(isPerson, personComparator)
 *   .add<string | number | boolean>(isPrimitive, naturalOrder)
 *   .toComparator();
 *
 * // not provided by this library
 * declare const isString = (value: any) => value is string;
 * declare const isNumber = (value: any) => value is number;
 * declare const isPerson = (value: any) => value is Person;
 * declare const isPrimitive = (value: any) => boolean;
 */
export interface ComparatorWithPredicateFactory<T> {
  /**
   * Add another predicate and comparator that the final comparator can handle.
   * @param predicate a predicate that indicates if the following comparator can handle the value
   * @param comparator a comparator for the incoming value
   */
  add<U>(
    predicate: ((value: any) => value is U) | ((value: U) => boolean),
    comparator: Comparator<U>
  ): ComparatorWithPredicateFactory<T | U>;

  /**
   * Creates a single comparator that will only accept values, that match the attached predicates.
   */
  toComparator(): Comparator<T>;
}

class ComparatorWithPredicateFactoryImpl<T> implements ComparatorWithPredicateFactory<T> {
  constructor(private readonly comparators: Array<[(value: T) => boolean, Comparator<T>]>) {}

  add<U>(
    predicate: ((value: any) => value is U) | ((value: U) => boolean),
    comparator: Comparator<U>
  ): ComparatorWithPredicateFactory<T | U> {
    return new ComparatorWithPredicateFactoryImpl<T | U>([
      ...(this.comparators as any),
      [predicate, comparator],
    ]);
  }

  toComparator(): Comparator<T> {
    return (a, b) => {
      const fittingComparator = this.comparators.find(
        ([predicate]) => predicate(a) && predicate(b)
      );
      if (!fittingComparator) {
        throw new Error(`Unable to find comparator for types [${typeof a}, ${typeof b}]`);
      }
      return fittingComparator[1](a, b);
    };
  }
}

/**
 * Creates a new `ComparatorWithPredicateFactory`, with the given first comparator and predicate.
 * @param predicate a predicate that indicates if the following comparator can handle the value
 * @param comparator a comparator for the incoming value
 * @see ComparatorWithPredicateFactory
 */
export function comparatorWithPredicate<U>(
  predicate: ((value: any) => value is U) | ((value: U) => boolean),
  comparator: Comparator<U>
): ComparatorWithPredicateFactory<U> {
  return new ComparatorWithPredicateFactoryImpl([[predicate, comparator]]);
}
