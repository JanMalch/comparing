import * as toposort from 'toposort';
import { unchanged } from './comparators';
import {
  comparatorForOrder,
  composeComparators, reverseComparator,
} from './factories';
import { Comparator } from './types';

export const comparatorForTopologicalOrder = <T>(edges: ReadonlyArray<[T, T | undefined]>) =>
  comparatorForOrder(toposort(edges).reverse());

export function comparatorForTable<T>(
  ascendingComparators: {
    [K in keyof T]:  Comparator<T> | [Comparator<T>, ...Array<Exclude<keyof T, K>>]
  }
): (sort: { active: keyof T; direction: 'asc' | 'desc' | '' }) => Comparator<T>;
export function comparatorForTable<T, Asc, Desc>(
  ascendingComparators: {
    [K in keyof T]:  Comparator<T> | [Comparator<T>, ...Array<Exclude<keyof T, K>>]
  },
  options: {
    asc: Asc;
    desc: Desc;
  }
): (sort: { active: keyof T; direction: Asc | Desc }) => Comparator<T>;
export function comparatorForTable<T, Asc, Desc, Unchanged>(
  ascendingComparators: {
    [K in keyof T]:  Comparator<T> | [Comparator<T>, ...Array<Exclude<keyof T, K>>]
  },
  options: {
    asc: Asc;
    desc: Desc;
    unchanged: Unchanged;
  }
): (sort: { active: keyof T; direction: Asc | Desc | Unchanged }) => Comparator<T>;
export function comparatorForTable<T>(
  ascendingComparators: {
    [key: string]: Comparator<T> | [Comparator<T>, ...Array<keyof T>];
  },
  options: {
    asc: string;
    desc: string;
    unchanged?: string;
  } = { asc: 'asc', desc: 'desc', unchanged: '' }
) {
  const dependencies = Object.keys(ascendingComparators).reduce((edges, key) => {
    const input = ascendingComparators[key];
    edges.push([key, undefined]);
    if (Array.isArray(input)) {
      for (let i = 1; i < input.length; i++) {
        edges.push([key, input[i] as string]);
      }
    }
    return edges;
  }, [] as Array<[string, string | undefined]>);
  const comparators = toposort(dependencies)
    .reverse()
    .slice(1)
    .reduce(
      (acc, key) => {
        const input = ascendingComparators[key];
        const ascComparator = Array.isArray(input)
          ? composeComparators([
              input[0],
              ...input.slice(1).map((otherKey: any) => {
                // TODO: this behaviour is quite opinionated and not exactly transparent or immediately obvious
                const existingCmp = acc.asc[otherKey];
                if (!existingCmp) {
                  throw new Error(`Unable to find existing '${otherKey}' comparator to create '${key}' comparator.`);
                }
                return existingCmp;
              }),
            ])
          : input;
        acc.asc[key] = ascComparator;
        acc.desc[key] = reverseComparator(ascComparator);
        return acc;
      },
      { asc: {}, desc: {} } as Record<'asc' | 'desc', Record<string, Comparator<T>>>
    );

  const hasUnchanged = 'unchanged' in options;
  return ({ active, direction }: { active: string; direction: any }) => {
    if (hasUnchanged && direction === options.unchanged) {
      return unchanged;
    }
    let comparator;
    if (direction === options.asc) {
      comparator = comparators.asc[active];
    } else if (direction === options.desc) {
      comparator = comparators.desc[active];
    }
    if (!comparator) {
      throw new Error(`Cannot determine comparator for key '${active}' and direction '${direction}'.`);
    }
    return comparator;
  }

}
