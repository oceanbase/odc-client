import { ConstraintType } from '@/d.ts';

export function isConstaintSupportDisable(c: ConstraintType) {
  return [ConstraintType.FOREIGN, ConstraintType.INVALID].includes(c);
}
