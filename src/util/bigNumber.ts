import BigNumber from 'bignumber.js';

export function compareNumber(a, b) {
  a = a + '';
  b = b + '';
  const bigA = new BigNumber(a);
  const bigB = new BigNumber(b);
  return bigA.comparedTo(bigB);
}
