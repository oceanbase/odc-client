import { compareNumber } from '@/util/bigNumber';

export function getValidOfCompareTo(
  getTarget: () => string,
  resultCallback: (result: number, fn: (errMsg?: string) => void) => void,
) {
  return (rule, value, callback) => {
    const target = getTarget();
    const result = compareNumber(value, target);
    resultCallback(result, callback);
  };
}
