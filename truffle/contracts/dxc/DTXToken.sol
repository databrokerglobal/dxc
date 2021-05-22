pragma solidity ^0.6.0;

import "../token/MiniMeToken.sol";


contract DTXToken is MiniMeToken {
  constructor(address _tokenFactory)
    public
    MiniMeToken(
      _tokenFactory,
      address(0), // no parent token
      0, // no snapshot block number from parent
      "DaTa eXchange Token", // Token name
      18, // Decimals
      "DTX", // Symbol
      true // Enable transfers
    )
  {}
}
