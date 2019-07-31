import { path as burnerwalletPath } from '../auth/routes/burnerwallet';
import { runningServer as server } from '../index';

describe('Happy flow', () => {
  test('Users registers in the platform and a new burnerwallet is created', async () => {
    const { statusCode, result } = await (await server).inject({
      method: 'POST',
      url: `/v1${burnerwalletPath}`,
    });
    expect(statusCode).toBe(200);
    expect(Object.keys(result)).toEqual([
      'mnemonic',
      'ethereumAddress',
      'privateKey',
    ]);
  });

  test('Platform authenticates to the ', () => {
    // expect(1)).toBe(3);
  });
});
