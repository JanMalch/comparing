import { Comparators } from '../src/comparators';
import { isComparator, isCompareFunction } from '../src/guards';

describe('type guards', () => {
  it('isComparator should identify Comparators', () => {
    const comparator = Comparators.byLength;
    expect(isComparator(comparator)).toBe(true);

    const compareFunction = (a: string, b: string) => a.length - b.length;
    expect(isComparator(compareFunction)).toBe(false);
  });

  it('isCompareFunction should identify CompareFunctions', () => {
    const comparator = Comparators.byLength;
    expect(isCompareFunction(comparator)).toBe(true);

    const compareFunction = (a: string, b: string) => a.length - b.length;
    expect(isCompareFunction(compareFunction)).toBe(true);
  });
});
