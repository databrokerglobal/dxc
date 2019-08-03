import { path as burnerwalletPath } from '../auth/routes/burnerwallet';
import { runningServer as server } from '../index';
import { getLatestQuote } from './helpers/getLatestQuote';

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

  let filePriceInDTX: number;

  test('Users browses the marketplace and finds an interesting set', async () => {
    // no test for this, just here for the flow
    filePriceInDTX = 200 / (await getLatestQuote()); // USD
  });

  test('Users uses their credit card to buy the file', () => {
    // Stripe payment of 200 USD
    // filePriceInDTX
  });

  // test('Users buys access to a file listing', () => {
  //   // expect(1)).toBe(3);
  // });

  // let balanceResult = await dDXC.balanceOf(accounts[1]);
  // expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
  // await dDXC.convertFiatToToken(
  //   accounts[1],
  //   web3.utils.toWei(amountOfDTXFor(100))
  // );
  // balanceResult = await dDXC.balanceOf(accounts[1]);
  // expect(balanceResult[0]).to.be.bignumber.equal(
  //   web3.utils.toWei(amountOfDTXFor(100))
  // );
});
