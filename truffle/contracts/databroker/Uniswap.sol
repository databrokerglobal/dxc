pragma solidity ^0.5.7;
import "../ownership/Ownable.sol";
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import './IUniswapV2Router01.sol';
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



contract Uniswap is Ownable {
    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; // Mainnet

    IUniswapV2Router01 public uniswapRouter;

    constructor() public {
        uniswapRouter = IUniswapV2Router01(UNISWAP_ROUTER_ADDRESS);
    }

    // Swap function
    function swapEthForTokenWithUniswap(uint ethAmount, address tokenAddress, address buyerAddress) public onlyOwner {
        // Verify we have enough funds
        require(ethAmount <= buyerAddress.balance, "Not enough Eth in contract to perform swap.");

        // Build arguments for uniswap router call
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenAddress;

        // Make the call and give it 15 seconds
        // Set amountOutMin to 0 but no success with larger amounts either
        uniswapRouter.swapExactETHForTokens(ethAmount, path,  buyerAddress, now + 15);
    }

    // Swap function
    function swapTokenForETHWithUniswap(uint tokenAmount, address tokenAddress, address winnerAddress) public onlyOwner {
        // Verify we have enough funds
        require(tokenAmount <= winnerAddress.balance, "Not enough DTX in contract to perform swap.");

        // Build arguments for uniswap router call
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenAddress;

        // Make the call and give it 15 seconds
        // Set amountOutMin to 0 but no success with larger amounts either
        uniswapRouter.swapExactTokensForETH(tokenAmount, tokenAmount, path,  winnerAddress, now + 15);
    }

    // calculate price based on pair reserves
    function getTokenPrice(address pairAddress) public view returns(uint)
    {
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        (uint Res0, uint Res1,) = pair.getReserves();

        return(Res0/Res1); 
   }

}