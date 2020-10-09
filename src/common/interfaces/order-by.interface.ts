import { OrderByDirection } from '../enums/order-by-direction.enum';

export interface OrderBy<F> {
  field: F;
  direction: keyof typeof OrderByDirection;
}
