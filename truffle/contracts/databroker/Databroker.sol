pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;


import "../ownership/Ownable.sol";
import "./Uniswap.sol";

contract Databoker is Ownable, Uniswap {


    ///////////////////////////////////////////////////////////////////////////////////////
    //// Transaction                                                                   ////
    ///////////////////////////////////////////////////////////////////////////////////////

    // When a client wants to buy a product on the platform, she/will do so with a credit card
    // This will trigger from the Wyre service side a transaction to receive ETH
    // Those ETH will be send to the buyer address
    // From there we need to interact with Uniswap
 
    address public tokenAddress = 0x765f0C16D1Ddc279295c1a7C24B0883F62d33F75;

    
    struct Buyer {
        address buyerAddress;
        uint256 balanceBase;
        uint256 balanceQuote;
    }

    Buyer[] internal buyersList;
    

    struct Seller {
        address sellerAddress;
        uint256 balanceBase;
        uint256 balanceQuote;
        uint256 sellerPercentage;
    }

    Seller[] internal sellersList;


    // @address of the buyer, this function should be called by the Wyre service and for a new ETH wallet
    // The buyer wallet address will be passed in the wyre request and the ETH will be deposited on their account
    // After that from this wallet we do a swap on Uniswap using the function swapEthForTokenWithUniswap

    function transferFrom(address _from, address _to, uint256 _value)
        public
        returns (bool success);

    function deposit(
        address buyerAddress, 
        address sellerAddress, 
        uint256 ethAmount, 
        bool marketplace, 
        address addressMarketplace) public {
        
        
        // In the case that the marketplace is not us but a third party
        address platformAddress = 0xfc6b0e0C50837f8A5785A3D03d4323D4cF7d1118; 
        uint256 platformPercentage = 10;
        if (marketplace) {
            platformAddress = addressMarketplace;
        }

        
        // Call to uniswap to swap ETH to token and deposit on specific address
        swapEthForTokenWithUniswap(ethAmount, tokenAddress, buyerAddress);
        uint256 price = getTokenPrice(0x55A42989BC1D4f8F3ADAB9E77593b81cCbb50a3d);
        uint256 baseAmount = ethAmount * price;
        uint256 quoteAmount = ethAmount;

        // Add a buyer and seller struct to the list
        Buyer memory newBuyer = Buyer(
            buyerAddress,
            baseAmount,
             - (quoteAmount)
            );

        buyersList.push(newBuyer);
        uint256 buyerIndex;

        uint256 sellerPercentage = 90;
        Seller memory newSeller = Seller(
            sellerAddress,
            0, 
            0,
            sellerPercentage
            );

        sellersList.push(newSeller);
        uint256 sellerIndex;

        // Trigger the createDeal function
        createDeal(
            buyerIndex,
            sellerIndex,
            platformAddress,
            platformPercentage,
            baseAmount,
            now,
            now + 30 days
        );
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    //// Escrow                                                                        ////
    ///////////////////////////////////////////////////////////////////////////////////////

    struct Escrow {
        uint256 amount;
        uint256 releaseAfter;
        uint256 buyerIndex;
        uint256 sellerIndex;
        uint256 dealIndex;
    }

    Escrow[] internal escrowsList;


    // This function will create a new escrow struct, with a release date
    // And transfer the balances between the different actors in their structs 

    function escrow(
        uint256 buyerIndex, 
        uint256 sellerIndex, 
        uint256 amount, 
        uint256 validFrom, 
        uint256 dealIndex,
        address platformAddress
    ) internal {
        Escrow memory newEscrow = Escrow(
            amount,
            validFrom,
            buyerIndex,
            sellerIndex,
            dealIndex
            );
        escrowsList.push(newEscrow);

        Buyer memory _buyer = buyersList[buyerIndex];
        _buyer.balanceBase = _buyer.balanceBase - amount;

    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //// Deals                                                                         ////
    ///////////////////////////////////////////////////////////////////////////////////////

    struct Deal {
        uint256 buyerIndex;
        uint256 sellerIndex;
        address platformAddress;
        uint256 platformPercentage;
        uint256 amount;
        uint256 validFrom; // 0 means forever, all others are a timestamp
        uint256 validUntil; // 0 means forever, all others are a timestamp
    }

    Deal[] public dealsList;

    function deal(uint256 index) external view returns (Deal memory) {
        return dealsList[index];
    }

    function createDeal(
        uint256 buyerIndex,
        uint256 sellerIndex,
        address platformAddress,
        uint256 platformPercentage,
        uint256 amount, 
        uint256 validFrom,
        uint256 validUntil
      ) public {
        Deal memory newDeal = Deal(
            buyerIndex,
            sellerIndex,    
            platformAddress,
            platformPercentage,
            amount,
            validFrom,
            validUntil
        );
        dealsList.push(newDeal);
        uint256 dealIndex;
        escrow(
            buyerIndex, 
            sellerIndex, 
            amount, 
            validFrom, 
            dealIndex,
            platformAddress
            );
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //// Payout                                                                        ////
    ///////////////////////////////////////////////////////////////////////////////////////

    // This function should be called at the end of the escrow period, 
    // By the buyer if accepted, the seller if not accepted 
    // If buyer, she/he call the uniswap functions - 
    function payout(
        uint256 dealIndex,  
        bool marketplace, 
        address addressMarketplace,
        address buyerAddress,
        address sellerAddress,
        bool accepted,
        bool staking
        ) public {

        // In the case that the marketplace is not us but a third party
        address platformAddress = 0xfc6b0e0C50837f8A5785A3D03d4323D4cF7d1118; 
        uint256 platformPercentage = 10;
        if (marketplace) {
            platformAddress = addressMarketplace;
        }

        Deal memory _deal = dealsList[dealIndex];
        require(
            now >= _deal.validFrom + 30 days,
            "Payouts can only happen 30 days after the start of the deal"
        );

        uint256 dealAmount = _deal.amount;
        uint256 buyerIndex = _deal.buyerIndex;

        if (accepted) {

            // Call uniswap to swap DTX for ETH on the right account
            swapTokenForETHWithUniswap(dealAmount, tokenAddress, sellerAddress);
            uint256 price = getTokenPrice(0x55A42989BC1D4f8F3ADAB9E77593b81cCbb50a3d);
            // Need to find right parameters to send back that to seller account with Wyre
            //transfer(_buyer.buyerAddress, SellerwyreBankAccount);

            // To check the variation between initial baseAmount and current baseAmount
            uint256 baseAmount = dealAmount;
            uint256 platformFee = (price / baseAmount) * platformPercentage;
            uint256 quoteAmount = (price / baseAmount) - platformFee;
            Buyer memory _buyer = buyersList[buyerIndex];
            _buyer.balanceBase = _buyer.balanceBase - baseAmount;
            _buyer.balanceQuote = _buyer.balanceQuote - quoteAmount;

            if (_buyer.balanceQuote > 0)
                {       
                   // transfer of additional balances between the different accounts
                    transferFrom(_buyer.buyerAddress, platformAddress, (platformFee + _buyer.balanceQuote)); 


                    if (staking) {
                        // If staking == true, we send the platform's percentage to the Staking program
                        // A wallet from which the staking program will operate
                        // PS: The platform's percentage should be a value easily changeable
                    }
                }
            else {
                // We fetch the difference in quote at the end of the proposal and we reimburse the client
                // From our wallet's funds
            }

        } else {
                
            // Call uniswap to swap DTX for ETH on the right account
            swapTokenForETHWithUniswap(dealAmount, tokenAddress, buyerAddress);
            uint256 price = getTokenPrice(0x55A42989BC1D4f8F3ADAB9E77593b81cCbb50a3d);
            // Need to find right parameters to send back that to buyer account with Wyre
            //transfer(_buyer.buyerAddress, buyerWyreBankAccount);


            // To check the variation between initial baseAmount and current baseAmount
            uint256 baseAmount = dealAmount;
            uint256 quoteAmount = (price / baseAmount);
            Buyer memory _buyer = buyersList[buyerIndex];
            _buyer.balanceBase = _buyer.balanceBase - baseAmount;
            _buyer.balanceQuote = _buyer.balanceQuote - quoteAmount;

            if (_buyer.balanceQuote > 0)
                {       
                   // transfer of additional balances between the different accounts
                    transferFrom(_buyer.buyerAddress, platformAddress, (_buyer.balanceQuote)); 
                    
                    if (staking) {
                        // If staking == true, we send the platform's percentage to the Staking program (in DTX)
                        // A wallet from which the staking program will operate
                        // PS: The platform's percentage should be a value easily changeable
                    }
                }
            else {
                // We fetch the difference in quote at the end of the proposal and we reimburse the client
                // From our wallet's funds
            }
        }
    }
}