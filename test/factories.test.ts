import {
  byLength,
  Comparator,
  comparatorForOrder,
  comparatorWithPredicate,
  compareBy,
  composeComparators,
  ignoreCase,
  localeCompare,
  naturalOrder,
  reverseComparator,
  reversedOrder,
} from '../src';

const FIRST_BEFORE_SECOND = -1;
const FIRST_SAME_AS_SECOND = 0;
const FIRST_AFTER_SECOND = 1;

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

describe('reverseComparator', () => {
  it('should invert the result', () => {
    const comparator = reverseComparator(naturalOrder);
    expect(comparator(1, 2)).toBe(FIRST_AFTER_SECOND);
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

describe('comparatorWithPredicate', () => {
  interface Person {
    name: string;
  }
  const isPerson = (value: any): value is Person => typeof value === 'object' && 'name' in value;
  const isString = (value: any): value is string => typeof value === 'string';
  const isNumber = (value: any): value is number => typeof value === 'number';
  const isPrimitive = (value: any): boolean => typeof value !== 'object';

  it('should work with a single comparator', () => {
    const stringComparator = comparatorWithPredicate(isString, ignoreCase).orElseThrow();
    expect(stringComparator('A', 'a')).toBe(FIRST_SAME_AS_SECOND);
  });

  it('should work for unions', () => {
    // Comparator<Person | string | number>
    const unionComparator = comparatorWithPredicate(
      isPerson,
      compareBy((foo) => foo.name, localeCompare)
    )
      .orIf(isString, ignoreCase)
      .orIf(isNumber, reversedOrder)
      .orElseThrow();

    expect(unionComparator(1, 2)).toBe(FIRST_AFTER_SECOND); // isNumber -> reversedOrder
    expect(unionComparator('A', 'a')).toBe(FIRST_SAME_AS_SECOND); // isString -> ignoreCase
    expect(unionComparator({ name: 'John' }, { name: 'Frannie' })).toBe(FIRST_AFTER_SECOND); // isPerson -> compare by names
  });

  it('should work with the deprecated methods', () => {
    // Comparator<Person | string | number>
    const unionComparator = comparatorWithPredicate(
      isPerson,
      compareBy((foo) => foo.name, localeCompare)
    )
      .add(isString, ignoreCase)
      .add(isNumber, reversedOrder)
      .toComparator();

    expect(unionComparator(1, 2)).toBe(FIRST_AFTER_SECOND); // isNumber -> reversedOrder
    expect(unionComparator('A', 'a')).toBe(FIRST_SAME_AS_SECOND); // isString -> ignoreCase
    expect(unionComparator({ name: 'John' }, { name: 'Frannie' })).toBe(FIRST_AFTER_SECOND); // isPerson -> compare by names
  });

  it('should accept specify the type of the added comparator via generics', () => {
    // Comparator<Person | string | number>
    const unionComparator = comparatorWithPredicate(
      isPerson,
      compareBy((foo) => foo.name, localeCompare)
    )
      // As "isPrimitive" only returns "boolean", the comparator would accept "any" but you can narrow the types.
      // Type Guards are preferred though.
      .orIf<string | number>(isPrimitive, naturalOrder)
      .orElseThrow();

    expect(unionComparator(1, 2)).toBe(FIRST_BEFORE_SECOND); // isPrimitive -> naturalOrder
    expect(unionComparator('A', 'a')).toBe(FIRST_BEFORE_SECOND); // isPrimitive -> naturalOrder
    expect(unionComparator({ name: 'John' }, { name: 'Frannie' })).toBe(FIRST_AFTER_SECOND); // isPerson -> compare by names
  });

  describe('with orElseThrow', () => {
    it("should throw an error if the values don't match the type of the comparator", () => {
      const stringComparator = comparatorWithPredicate(
        isString,
        ignoreCase
      ).orElseThrow() as Comparator<any>;
      expect(() => stringComparator(1, 2)).toThrow();
    });

    it("should throw an error if the two passed values don't have the same type", () => {
      // Comparator<string | number>
      const unionComparator = comparatorWithPredicate(isString, ignoreCase)
        .orIf(isNumber, naturalOrder)
        .orElseThrow();
      expect(() => unionComparator(1, '2')).toThrow();
    });
  });

  describe('with orElse', () => {
    it("should use the fallback comparator if the values don't match the type of the comparator", () => {
      const stringComparator = comparatorWithPredicate(isString, ignoreCase).orElse(
        naturalOrder
      ) as Comparator<any>;
      expect(stringComparator(1, 2)).toBe(FIRST_BEFORE_SECOND);
    });

    it("should throw an error if the two passed values don't have the same type", () => {
      // Comparator<string | number>
      const unionComparator = comparatorWithPredicate(isString, ignoreCase)
        .orIf(isNumber, naturalOrder)
        .orElse(naturalOrder);
      expect(unionComparator(1, 2)).toBe(FIRST_BEFORE_SECOND);
    });
  });
});
