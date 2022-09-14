import {
  byLength,
  bySize,
  Comparable,
  comparables,
  compareBy,
  composeComparators,
  ignoreCase,
  localeCompare,
  naturalOrder,
  nullishFirst,
  nullishLast,
  reversedOrder,
  trueFirst,
  trueLast,
  unchanged,
} from '../src';

const FIRST_BEFORE_SECOND = -1;
const FIRST_SAME_AS_SECOND = 0;
const FIRST_AFTER_SECOND = 1;

describe('ignoreCase', () => {
  it('should compare strings', () => {
    expect(ignoreCase('A', 'a')).toBe(FIRST_SAME_AS_SECOND);
    expect(ignoreCase('b', 'A')).toBe(FIRST_AFTER_SECOND);
    expect(ignoreCase('B', 'a')).toBe(FIRST_AFTER_SECOND);
  });
});

describe('localeCompare', () => {
  it('should compare strings', () => {
    expect(localeCompare('A', 'a')).toBe(FIRST_AFTER_SECOND);
    expect(localeCompare('b', 'A')).toBe(FIRST_AFTER_SECOND);
    expect(localeCompare('B', 'a')).toBe(FIRST_AFTER_SECOND);
  });
});

describe('byLength', () => {
  it('should compare for strings', () => {
    expect(byLength('BA', 'B')).toBe(FIRST_AFTER_SECOND);
  });

  it('should compare for arrays', () => {
    expect(byLength([1, 2, 3], [1, 2])).toBe(FIRST_AFTER_SECOND);
  });
});

describe('bySize', () => {
  it('should compare for anything with a size property', () => {
    expect(bySize({ size: 1 }, { size: 0 })).toBe(FIRST_AFTER_SECOND);
  });

  it('should compare for sets', () => {
    expect(bySize(new Set([1, 2, 3]), new Set([1, 2]))).toBe(FIRST_AFTER_SECOND);
  });
});

describe('unchanged', () => {
  it('should invert the result', () => {
    expect([2, 1, 3]).toEqual([2, 1, 3].sort(unchanged));
    expect([2, 1, 3]).not.toEqual([2, 1, 3].sort());
    expect([2, 1, 3]).not.toEqual([2, 1, 3].sort(undefined));
  });
});

describe('nullishFirst', () => {
  it('should put nulls first', () => {
    const comparator = nullishFirst;
    expect(comparator(null, 1)).toBe(FIRST_BEFORE_SECOND);
    expect(comparator(null, null)).toBe(FIRST_SAME_AS_SECOND);
    expect(comparator(1, null)).toBe(FIRST_AFTER_SECOND);
    expect(comparator(1, 1)).toBe(FIRST_SAME_AS_SECOND);
  });

  it('should put nulls in array first', () => {
    const expected = [null, null, 2, 1, 3];
    const actual = [2, null, 1, 3, null].sort(nullishFirst);
    expect(actual).toEqual(expected);
  });

  it('should sort complex structures', () => {
    const input = [
      { id: 0, foo: null },
      { id: 3, foo: 1 },
      { id: 1, foo: 1 },
      { id: 2, foo: null },
    ];
    const actual = input.sort(
      composeComparators([
        compareBy<{ id: number; foo: number | null }, any>((x) => x.foo, nullishFirst),
        compareBy((x) => x.id),
      ])
    );

    const expected = [
      { id: 0, foo: null },
      { id: 2, foo: null },
      { id: 1, foo: 1 },
      { id: 3, foo: 1 },
    ];
    expect(actual).toEqual(expected);
  });
});

describe('nullishLast', () => {
  it('should put nulls last', () => {
    const comparator = nullishLast;
    expect(comparator(1, null)).toBe(FIRST_BEFORE_SECOND);
    expect(comparator(null, null)).toBe(FIRST_SAME_AS_SECOND);
    expect(comparator(null, 1)).toBe(FIRST_AFTER_SECOND);
    expect(comparator(1, 1)).toBe(FIRST_SAME_AS_SECOND);
  });
});

describe('trueFirst', () => {
  it('should put trues first', () => {
    const comparator = trueFirst;
    expect(comparator(true, false)).toBe(FIRST_BEFORE_SECOND);
    expect(comparator(true, true)).toBe(FIRST_SAME_AS_SECOND);
    expect(comparator(false, true)).toBe(FIRST_AFTER_SECOND);
    expect(comparator(false, false)).toBe(FIRST_SAME_AS_SECOND);
  });

  it('should put nulls in array first', () => {
    const expected = [true, true, false, false, false];
    const actual = [false, true, false, false, true].sort(trueFirst);
    expect(actual).toEqual(expected);
  });

  it('should sort complex structures', () => {
    const input = [
      { id: 0, foo: true },
      { id: 3, foo: false },
      { id: 1, foo: false },
      { id: 2, foo: true },
    ];
    const actual = input.sort(
      composeComparators<{ id: number; foo: boolean }>([
        compareBy((x) => x.foo, trueFirst),
        compareBy((x) => x.id),
      ])
    );

    const expected = [
      { id: 0, foo: true },
      { id: 2, foo: true },
      { id: 1, foo: false },
      { id: 3, foo: false },
    ];
    expect(actual).toEqual(expected);
  });

  it('can be used with compareBy to handle truthy values', () => {
    const truthyFirst = compareBy((x) => !!x, trueFirst);
    const actual = ['hi', 0, 'hello', '', false, true, 'hi', 'hey', ''].sort(truthyFirst);
    const expected = ['hi', 'hello', true, 'hi', 'hey', 0, '', false, ''];
    expect(actual).toEqual(expected);
  });
});

describe('trueLast', () => {
  it('should put trues last', () => {
    const comparator = trueLast;
    expect(comparator(false, true)).toBe(FIRST_BEFORE_SECOND);
    expect(comparator(true, true)).toBe(FIRST_SAME_AS_SECOND);
    expect(comparator(true, false)).toBe(FIRST_AFTER_SECOND);
    expect(comparator(false, false)).toBe(FIRST_SAME_AS_SECOND);
  });
});

describe('naturalOrder', () => {
  it('should use < comparison', () => {
    expect(naturalOrder(1, 2)).toBe(FIRST_BEFORE_SECOND);
    expect(naturalOrder(1, 1)).toBe(FIRST_SAME_AS_SECOND);
    expect(naturalOrder(2, 1)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder('AA', 'B')).toBe(FIRST_BEFORE_SECOND); // alphabetical
  });
  it('should always put NaN last', () => {
    expect(naturalOrder(Number.NaN, Number.NEGATIVE_INFINITY)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder(Number.NaN, Number.MIN_SAFE_INTEGER)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder(Number.NaN, -1)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder(Number.NaN, 0)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder(Number.NaN, 1)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder(Number.NaN, Number.MAX_SAFE_INTEGER)).toBe(FIRST_AFTER_SECOND);
    expect(naturalOrder(Number.NaN, Number.POSITIVE_INFINITY)).toBe(FIRST_AFTER_SECOND);
  });
});

describe('reversedOrder', () => {
  it('should use > comparison', () => {
    expect(reversedOrder(2, 1)).toBe(FIRST_BEFORE_SECOND);
    expect(reversedOrder(1, 1)).toBe(FIRST_SAME_AS_SECOND);
    expect(reversedOrder(1, 2)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder('B', 'AA')).toBe(FIRST_BEFORE_SECOND); // alphabetical
  });
  it('should always put NaN last', () => {
    expect(reversedOrder(Number.NaN, Number.NEGATIVE_INFINITY)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder(Number.NaN, Number.MIN_SAFE_INTEGER)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder(Number.NaN, -1)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder(Number.NaN, 0)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder(Number.NaN, 1)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder(Number.NaN, Number.MAX_SAFE_INTEGER)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder(Number.NaN, Number.POSITIVE_INFINITY)).toBe(FIRST_AFTER_SECOND);
  });
});

describe('comparables', () => {
  class Person implements Comparable<Person> {
    constructor(public readonly name: string, public readonly age: number) {}

    compareTo(other: Person): number {
      // implement this any way you want
      return naturalOrder(this.age, other.age);
    }
  }

  it('should use the compareTo method', () => {
    expect(comparables(new Person('A', 100), new Person('B', 101))).toBe(FIRST_BEFORE_SECOND);
    expect(comparables(new Person('A', 100), new Person('B', 100))).toBe(FIRST_SAME_AS_SECOND);
    expect(comparables(new Person('A', 101), new Person('B', 100))).toBe(FIRST_AFTER_SECOND);
  });
});
