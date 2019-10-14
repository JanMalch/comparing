import { Comparators } from '../src/comparators';
import { isComparator } from '../src/guards';

describe('Comparators', () => {
  const FIRST_BEFORE_SECOND = -1;
  const FIRST_SAME_AS_SECOND = 0;
  const FIRST_AFTER_SECOND = 1;

  it('should be used as sort argument', () => {
    const actual = [4, 1, 3, 5].sort(Comparators.lessThan);
    const expected = [1, 3, 4, 5];
    expect(actual).toEqual(expected);
  });

  describe('lessThan', () => {
    it('should use < comparison', () => {
      expect(Comparators.lessThan(1, 2)).toBe(FIRST_BEFORE_SECOND);
      expect(Comparators.lessThan(1, 1)).toBe(FIRST_SAME_AS_SECOND);
      expect(Comparators.lessThan(2, 1)).toBe(FIRST_AFTER_SECOND);
      expect(Comparators.lessThan('AA', 'B')).toBe(FIRST_BEFORE_SECOND); // alphabetical
    });
  });

  describe('greaterThan', () => {
    it('should use > comparison', () => {
      expect(Comparators.greaterThan(2, 1)).toBe(FIRST_BEFORE_SECOND);
      expect(Comparators.greaterThan(1, 1)).toBe(FIRST_SAME_AS_SECOND);
      expect(Comparators.greaterThan(1, 2)).toBe(FIRST_AFTER_SECOND);
      expect(Comparators.greaterThan('B', 'AA')).toBe(FIRST_BEFORE_SECOND); // alphabetical
    });
  });

  describe('ignoreCase', () => {
    it('should compare strings', () => {
      expect(Comparators.ignoreCase('A', 'a')).toBe(FIRST_SAME_AS_SECOND);
      expect(Comparators.ignoreCase('b', 'A')).toBe(FIRST_AFTER_SECOND);
      expect(Comparators.ignoreCase('B', 'a')).toBe(FIRST_AFTER_SECOND);
    });

    it('should compare any value', () => {
      expect(Comparators.ignoreCase(2, 1)).toBe(FIRST_AFTER_SECOND);
    });
  });

  describe('localeCompare', () => {
    it('should compare strings', () => {
      expect(Comparators.localeCompare('A', 'a')).toBe(FIRST_AFTER_SECOND);
      expect(Comparators.localeCompare('b', 'A')).toBe(FIRST_AFTER_SECOND);
      expect(Comparators.localeCompare('B', 'a')).toBe(FIRST_AFTER_SECOND);
    });

    it('should compare any value', () => {
      expect(Comparators.localeCompare(2, 1)).toBe(FIRST_AFTER_SECOND);
    });
  });

  describe('with', () => {
    it('should apply comparator to given field', () => {
      const expected = FIRST_AFTER_SECOND;
      // tslint:disable-next-line:completed-docs
      const comparator = Comparators.with<{ id: string }, string>(
        x => x.id,
        Comparators.ignoreCase
      );
      const actual = comparator({ id: 'b' }, { id: 'a' });
      expect(actual).toBe(expected);
    });

    it('should default to lessThan comparator', () => {
      const expected = FIRST_AFTER_SECOND;
      // tslint:disable-next-line:completed-docs
      const comparator = Comparators.with<{ value: number }, number>(x => x.value % 2);
      const actual = comparator({ value: 1 }, { value: 2 });
      expect(actual).toBe(expected);
    });

    it('should work on primitives', () => {
      const expected = FIRST_AFTER_SECOND;
      const comparator = Comparators.with<number, number>(x => x % 2);
      const actual = comparator(1, 2);
      expect(actual).toBe(expected);
    });
  });

  describe('compose', () => {
    it('should compare by chaining comparators', () => {
      const expected = FIRST_AFTER_SECOND;
      const composed = Comparators.compose([Comparators.byLength, Comparators.ignoreCase]);

      expect(composed('BA', 'B')).toBe(expected);
      expect(composed('BB', 'AA')).toBe(expected);
    });

    it('should work with optional comparator', () => {
      const someCondition = false;
      const composed = Comparators.compose([
        someCondition ? Comparators.byLength : undefined,
        Comparators.ignoreCase
      ]);

      expect(composed('BA', 'B')).toBe(FIRST_AFTER_SECOND);
    });
  });

  describe('byLength', () => {
    it('should compare for strings', () => {
      const expected = FIRST_AFTER_SECOND;
      const comparator = Comparators.byLength;
      expect(comparator('BA', 'B')).toBe(expected);
    });

    it('should compare for arrays', () => {
      const expected = FIRST_AFTER_SECOND;
      const comparator = Comparators.byLength;
      expect(comparator([1, 2, 3], [1, 2])).toBe(expected);
    });
  });

  describe('unchanged', () => {
    it('should invert the result', () => {
      const expected = [2, 1, 3];
      const actual = [2, 1, 3].sort(Comparators.unchanged);
      const natural = [2, 1, 3].sort(); // not the same as unchanged!
      const withUndefined = [2, 1, 3].sort(undefined); // not the same as unchanged!
      expect(actual).toEqual(expected);
      expect(actual).not.toEqual(natural);
      expect(actual).not.toEqual(withUndefined);
    });
  });

  describe('reverse', () => {
    it('should invert the result', () => {
      const expected = FIRST_AFTER_SECOND;
      const comparator = Comparators.reverse(Comparators.lessThan);
      expect(comparator(1, 2)).toBe(expected);
    });
  });

  describe('nullFirst', () => {
    it('should put nulls first', () => {
      const comparator = Comparators.nullFirst;
      expect(comparator(null, 1)).toBe(FIRST_BEFORE_SECOND);
      expect(comparator(null, null)).toBe(FIRST_SAME_AS_SECOND);
      expect(comparator(1, null)).toBe(FIRST_AFTER_SECOND);
      expect(comparator(1, 1)).toBe(FIRST_SAME_AS_SECOND);
    });

    it('should put nulls in array first', () => {
      const expected = [null, null, 2, 1, 3];
      const actual = [2, null, 1, 3, null].sort(Comparators.nullFirst);
      expect(actual).toEqual(expected);
    });

    it('should sort complex structures', () => {
      const input = [
        { id: 0, foo: null },
        { id: 3, foo: 1 },
        { id: 1, foo: 1 },
        { id: 2, foo: null }
      ];
      const actual = input.sort(
        // tslint:disable-next-line:completed-docs
        Comparators.with<{ id: number; foo: number | null }, any>(
          x => x.foo,
          Comparators.nullFirst
        ).then(Comparators.with(x => x.id))
      );

      const expected = [
        { id: 0, foo: null },
        { id: 2, foo: null },
        { id: 1, foo: 1 },
        { id: 3, foo: 1 }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('nullLast', () => {
    it('should put nulls last', () => {
      const comparator = Comparators.nullLast;
      expect(comparator(1, null)).toBe(FIRST_BEFORE_SECOND);
      expect(comparator(null, null)).toBe(FIRST_SAME_AS_SECOND);
      expect(comparator(null, 1)).toBe(FIRST_AFTER_SECOND);
      expect(comparator(1, 1)).toBe(FIRST_SAME_AS_SECOND);
    });
  });

  describe('then', () => {
    it('should only use first comparator if sufficient', () => {
      const comparator = Comparators.lessThan.then(Comparators.greaterThan);
      const actual = [2, 1, 3].sort(comparator);

      const expected = [1, 2, 3];
      expect(actual).toEqual(expected);
    });

    it('should use subsequent if necessary', () => {
      const comparator = Comparators.byLength.then(Comparators.lessThan);
      const actual = ['BBB', 'AA', 'CC'].sort(comparator);

      const expected = ['AA', 'CC', 'BBB'];
      expect(actual).toEqual(expected);
    });
  });

  describe('reversed', () => {
    it('should invert the result', () => {
      const comparator = Comparators.lessThan.reversed();
      expect(comparator(1, 2)).toBe(FIRST_AFTER_SECOND);
    });
  });

  describe('of', () => {
    it('should make a comparator of any function', () => {
      const comparator = Comparators.of((a: number, b) => (a < b ? -1 : 0));
      expect(isComparator(comparator)).toBe(true);
    });
  });

  describe('naturalOrder', () => {
    it('should compare in natural order', () => {
      const actual = [4, 1, 3, 5].sort(Comparators.naturalOrder);
      const expected = [1, 3, 4, 5];
      expect(actual).toEqual(expected);
    });
  });

  describe('reversedOrder', () => {
    it('should compare in reverse order', () => {
      const actual = [4, 1, 3, 5].sort(Comparators.reversedOrder);
      const expected = [5, 4, 3, 1];
      expect(actual).toEqual(expected);
    });
  });
});
