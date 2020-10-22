export interface IFieldFilter {
  eq?: string;
  ne?: string;
  in?: string[];
  nin?: string[];
  contains?: {
    value: string;
    options?: string;
  };
}
