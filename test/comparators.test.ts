import {
  byLength,
  bySize,
  ignoreCase,
  localeCompare,
  naturalOrder,
  nullishFirst,
  nullishLast,
  reversedOrder,
  trueFirst,
  trueLast,
  unchanged,
} from '../src/comparators';
import {
  comparatorForOrder,
  compareBy,
  composeComparators,
  reverseComparator,
} from '../src/factories';

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

describe('compose', () => {
  it('should compare by chaining comparators', () => {
    const composed = composeComparators([byLength, ignoreCase]);

    expect(composed('BA', 'B')).toBe(FIRST_AFTER_SECOND);
    expect(composed('BB', 'AA')).toBe(FIRST_AFTER_SECOND);
  });

  it('should work with optional comparator', () => {
    const someCondition = false;
    const composed = composeComparators([someCondition ? byLength : undefined, ignoreCase]);

    expect(composed('BA', 'B')).toBe(FIRST_AFTER_SECOND);
  });
});

describe('compareBy', () => {
  it('should apply comparator to given field', () => {
    const comparator = compareBy<{ id: string }, string>((x) => x.id, ignoreCase);
    const actual = comparator({ id: 'b' }, { id: 'a' });
    expect(actual).toBe(FIRST_AFTER_SECOND);
  });

  it('should default to lessThan comparator', () => {
    const comparator = compareBy<{ value: number }, number>((x) => x.value % 2);
    const actual = comparator({ value: 1 }, { value: 2 });
    expect(actual).toBe(FIRST_AFTER_SECOND);
  });

  it('should work on primitives', () => {
    const comparator = compareBy<number, number>((x) => x % 2);
    const actual = comparator(1, 2);
    expect(actual).toBe(FIRST_AFTER_SECOND);
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

describe('reverseComparator', () => {
  it('should invert the result', () => {
    const comparator = reverseComparator(naturalOrder);
    expect(comparator(1, 2)).toBe(FIRST_AFTER_SECOND);
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
});

describe('reversedOrder', () => {
  it('should use > comparison', () => {
    expect(reversedOrder(2, 1)).toBe(FIRST_BEFORE_SECOND);
    expect(reversedOrder(1, 1)).toBe(FIRST_SAME_AS_SECOND);
    expect(reversedOrder(1, 2)).toBe(FIRST_AFTER_SECOND);
    expect(reversedOrder('B', 'AA')).toBe(FIRST_BEFORE_SECOND); // alphabetical
  });
});

describe('byOrder', () => {
  it('should use the specified order', () => {
    const comparator = comparatorForOrder(['b', 'a', 'c']);
    const actual = ['b', 'a', 'c', 'b', 'b', 'c', 'a'].sort(comparator);
    const expected = ['b', 'b', 'b', 'a', 'a', 'c', 'c'];
    expect(actual).toEqual(expected);
  });

  it('should throw an error for unknown values', () => {
    const comparator = comparatorForOrder([1, 2, 3]);
    expect(() => [3, 2, 4, 1].sort(comparator)).toThrow('Unknown value of type number: 4');
    expect(() => [4, 1].sort(comparator)).toThrow('Unknown value of type number: 4');
  });

  it('should be useful or ordering by arbitrary type', () => {
    enum MyType {
      Foo = 'Foo',
      Bar = 'Bar',
    }

    interface MyData {
      id: number;
      type: MyType | null;
    }

    const comparator = composeComparators([
      compareBy((d: MyData) => d.type, comparatorForOrder([MyType.Bar, MyType.Foo, null])),
      compareBy((d: MyData) => d.id, naturalOrder),
    ]);
    const actual = [
      { id: 1, type: MyType.Bar },
      { id: 3, type: MyType.Foo },
      { id: 5, type: null },
      { id: 4, type: MyType.Bar },
      { id: 2, type: MyType.Foo },
    ].sort(comparator);
    const expected = [
      { id: 1, type: MyType.Bar },
      { id: 4, type: MyType.Bar },
      { id: 2, type: MyType.Foo },
      { id: 3, type: MyType.Foo },
      { id: 5, type: null },
    ];
    expect(actual).toEqual(expected);
  });
});
