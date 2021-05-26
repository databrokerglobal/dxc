// SPDX-License-Identifier: UNLICENSED
/**
 * Copyright (C) SettleMint NV - All Rights Reserved
 *
 * Use of this file is strictly prohibited without an active license agreement.
 * Distribution of this file, via any medium, is strictly prohibited.
 *
 * For license inquiries, contact hello@settlemint.com
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DTX is ERC20 {
    constructor(address _owner, uint256 initialSupply) public ERC20("DTX", "DTX") {
        _mint(msg.sender, initialSupply);
        _mint(address(this), initialSupply);
    }
}