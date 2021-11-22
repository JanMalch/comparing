/**
 * A function that compares two values for sorting purposes.
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * An interface that imposes the ordering for implementing classes.
 */
export interface Comparable<T> {
  /**
   * Compares this object with the specified object for order.
   * @param other the object to be compared
   */
  compareTo(other: T): number;
}
