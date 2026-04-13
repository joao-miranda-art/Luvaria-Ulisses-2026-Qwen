/**
 * Entidade base — Clean Architecture
 * Toda entidade de domínio estende esta classe
 */
export abstract class Entity<T = string> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  abstract equals(other: Entity<T>): boolean;
}
