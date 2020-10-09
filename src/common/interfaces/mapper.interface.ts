export interface IMapper<I, O> {
  transform(obj: I, resolve?: (keyof I)[]): O | Promise<O>;
}
