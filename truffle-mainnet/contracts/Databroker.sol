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

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IUniswap.sol";
import "./access/Ownable.sol";

contract Databroker is Ownable {
    IUniswap internal _uniswap;
    IERC20 internal _usdtToken;
    IERC20 internal _dtxToken;

    address private _wyreWalletAddress;
    address private _dtxStakingAddress;
    bool private _initialized;

    event SwapTokens(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOut,
        address receiverAddress
    );
    event StakingTransfer(address stakingAddress, uint256 amount);

    function initialize(
        address uniswap,
        address usdtToken,
        address dtxToken,
        address wyreWalletAddress,
        address dtxStakingAddress
    ) public {
        require(!_initialized, "Databroker: Already initialized");

        require(
            wyreWalletAddress != address(0),
            "Databroker: Zero address for wyre wallet"
        );
        require(
            dtxStakingAddress != address(0),
            "Databroker: Zero address for dtx staking"
        );

        initializeOwner();

        _uniswap = IUniswap(uniswap);
        _usdtToken = IERC20(usdtToken);
        _dtxToken = IERC20(dtxToken);
        _wyreWalletAddress = wyreWalletAddress;
        _dtxStakingAddress = dtxStakingAddress;
        _initialized = true;
    }

    function swapTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path,
        address receiverAddress,
        uint256 deadline
    ) public onlyOwner returns (uint256) {
        // Give approval for the uniswap to swap the USDT token from this contract address
        IERC20(path[0]).approve(address(_uniswap), amountIn);

        uint256[] memory amounts =
            _uniswap.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                receiverAddress,
                deadline
            );

        emit SwapTokens(
            path[0],
            path[1],
            amountIn,
            amounts[1],
            receiverAddress
        );

        return amounts[1];
    }

    function payout(
        uint256 sellerAmountInDTX,
        uint256 sellerAmountOutMin,
        uint256 platformAmountInDTX,
        address[] memory DTXToUSDTPath,
        uint256 deadline
    ) public onlyOwner {
        // Seller USDT to wyre wallet address
        swapTokens(
            sellerAmountInDTX,
            sellerAmountOutMin,
            DTXToUSDTPath,
            _wyreWalletAddress,
            deadline
        );

        // Platform commission in DTX to staking contract
        _dtxToken.transfer(_dtxStakingAddress, platformAmountInDTX);

        emit StakingTransfer(_dtxStakingAddress, platformAmountInDTX);
    }

    function updateWyreWalletAddress(address wyreWalletAddress)
        public
        onlyOwner
    {
        require(
            wyreWalletAddress != address(0),
            "Databroker: Zero address for wyre wallet"
        );
        _wyreWalletAddress = wyreWalletAddress;
    }

    function updateStakingAddress(address dtxStakingAddress) public onlyOwner {
        require(
            dtxStakingAddress != address(0),
            "Databroker: Zero address for dtx staking"
        );
        _dtxStakingAddress = dtxStakingAddress;
    }

    function withdrawDTX(address toAddress, uint256 dtxAmount)
        public
        onlyOwner
    {
        _dtxToken.transfer(toAddress, dtxAmount);
    }
}
