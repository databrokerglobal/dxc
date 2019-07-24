/// <reference types="truffle-typings" />

contract('DXC', (accounts: string[]) => {
  before(async () => {
    // handle one time setup
  });

  beforeEach(async () => {
    // handle setup before each test
  });

  describe('a grouping of tests', async () => {
    beforeEach(async () => {
      // handle setup before each test in this group
    });

    it('describe your test here', async () => {
      // test here
    });

    it('this is a test for a failure', async () => {
      try {
        // here you call a contract function
        const fakeError = new Error('fake error');
        (fakeError as any).reason =
          'here you define the revert message you expect';
        throw fakeError;
        assert(false, 'Test succeeded when it should have failed');
      } catch (error) {
        assert(
          error.reason === 'here you define the revert message you expect',
          error.reason
        );
      }
    });
  });
});
