pragma solidity ^0.5.7;

import "./Ownable.sol";


contract Pausable is Ownable {
  /**
   * @dev Emitted when the pause is triggered by a pauser (`account`).
   */
  event Paused(address account);

  /**
   * @dev Emitted when the pause is lifted by a pauser (`account`).
   */
  event Unpaused(address account);

  bool private _paused;
  bool private _initialized;

  /**
   * @dev Initializes the contract in unpaused state. Assigns the Pauser role
   * to the deployer.
   */
  function initPause() public {
    require(!_initialized);
    _paused = false;
    _initialized = true;
  }

  /**
   * @dev Returns true if the contract is paused, and false otherwise.
   */
  function paused() public view returns (bool) {
    return _paused;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!_paused, "Pausable: paused");
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(_paused, "Pausable: not paused");
    _;
  }

  /**
   * @dev Called by a pauser to pause, triggers stopped state.
   */
  function pause() public onlyOwner whenNotPaused {
    _paused = true;
    emit Paused(owner());
  }

  /**
   * @dev Called by a pauser to unpause, returns to normal state.
   */
  function unpause() public onlyOwner whenPaused {
    _paused = false;
    emit Unpaused(owner());
  }
}
