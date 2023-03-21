import { compareNumber } from '@/util/bigNumber';

describe('test bigNumber utils', () => {
  it('compareNumber', () => {
    expect(compareNumber('99999999999989899999999', 87878798787)).toEqual(1);
  });
});
