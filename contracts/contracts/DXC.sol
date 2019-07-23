pragma solidity ^0.5.7;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract DXC is Ownable {

  using SafeMath for uint256;

  struct Deal {
    address seller;
    address buyer;
    uint256 percentageSeller;
    uint256 percentageDataBrokerDAO;
    string did; // the did of the share
    uint256 price; // in DTX wei
    uint256 validUntil; // 0 means forever, all others are a timestamp
    uint256 dtxDeposited; // in DTX wei
    uint256 allowWithdrawAfter; // timestamp 30 days after start
    bool claim; // if true, no withdrawal
    bool claimArbitraged; // if true, allow buyer to withdraw
  }

  address public dataBrokerDAOWallet = 0xB682943Fa0408f74e87c53f405d394d9A8b715AE;


// create deal

// isValid

// canWithdraw

// openClaim

// arbitrageClaim

// withdraw


}
