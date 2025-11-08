// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IFlip } from "../../../interfaces/IFlip.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ZetaChainBaseNFTCrossChainOptimized } from "./ZetaChainBaseNFTCrossChainOptimized.sol";
import { ZetaChainFlipLib } from "./libraries/ZetaChainFlipLib.sol";

contract ZetaChainFlipCrossChainOptimized is ZetaChainBaseNFTCrossChainOptimized, IFlip {
    
    using ZetaChainFlipLib for *;

    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _initialPrice,
        uint256 _maxSupply,
        uint256 _maxPrice,
        uint256 _creatorFeePercent,
        address _feeVault,
        address _priceContract,
        address _creator,
        string memory _uri,
        address _gatewayAddress,
        address _uniswapRouterAddress,
        uint256 _gasLimit,
        bool _supportMint
    ) public virtual initializer {
        __BaseNFT_init(_name, _symbol, _initialPrice, _maxSupply, _maxPrice, _creatorFeePercent, _feeVault, _priceContract, _creator, _uri);
        _initCrossChainParams(_gatewayAddress, _uniswapRouterAddress, _gasLimit, _supportMint);
    }

    function mint() public virtual payable returns (uint256) {
        ZetaChainFlipLib.validateMint(isSupportMint(), totalSupply(), maxSupply());

        (uint256 price, uint256 creatorFee) = ZetaChainFlipLib.getPriceAndFee(priceContract(), address(this));
        ZetaChainFlipLib.validatePayment(price, creatorFee, msg.value);

        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);
        _incrementCurrentSupply();
        emit TokenMinted(msg.sender, tokenId, price, creatorFee);
        
        ZetaChainFlipLib.distributeFee(feeVault(), creator(), creatorFee);
        ZetaChainFlipLib.refundExcess(_msgSender(), price + creatorFee);
        
        return tokenId;
    }

    function buy(uint256 tokenId) public payable {
        ZetaChainFlipLib.validateBuy(ownerOf(tokenId), 0, 0, msg.value);
        
        (uint256 price, uint256 creatorFee) = ZetaChainFlipLib.getPriceAndFee(priceContract(), address(this));
        ZetaChainFlipLib.validatePayment(price, creatorFee, msg.value);

        _transfer(address(this), msg.sender, tokenId);
        _removeAvailableToken(tokenId);
        _incrementCurrentSupply();
        emit TokenBought(msg.sender, tokenId, price, creatorFee);
        
        ZetaChainFlipLib.distributeFee(feeVault(), creator(), creatorFee);
        ZetaChainFlipLib.refundExcess(_msgSender(), price + creatorFee);
    }

    function sell(uint256 tokenId) public {
        ZetaChainFlipLib.validateSell(ownerOf(tokenId), _msgSender());
        
        (uint256 price, uint256 creatorFee) = ZetaChainFlipLib.getSellPriceAndFee(priceContract(), address(this));
        
        _transfer(_msgSender(), address(this), tokenId);
        _addAvailableToken(tokenId);
        _decrementCurrentSupply();
        emit TokenSold(_msgSender(), tokenId, price, creatorFee);
        
        (bool sent,) = _msgSender().call{value: price - creatorFee}("");
        if (!sent) revert ZetaChainFlipLib.TransferFailed();
        
        ZetaChainFlipLib.distributeFee(feeVault(), creator(), creatorFee);
    }

    function isOnSale(uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) == address(this);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ZetaChainBaseNFTCrossChainOptimized, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId) || interfaceId == type(IFlip).interfaceId;
    }

    receive() external payable {}
}
