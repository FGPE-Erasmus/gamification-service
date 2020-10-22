export interface IOrderByOption<S extends string = string, D extends string = 'ASC' | 'DESC'> {
  field: S;
  direction: D;
}
