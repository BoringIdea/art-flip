// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IFlip Interface
 * @author @lukema95
 * @notice Interface for the Flip contract, every FLIP contract should implement this interface
 */
interface IFlip is IERC165 {
    /// @notice The already initialized error
    error AlreadyInitialized();

    /// @notice The not owner error
    error NotOwner();

    /// @notice The not on sale error
    error NotOnSale();

    /// @notice The insufficient payment error
    error InsufficientPayment();

    /// @notice The over max supply error
    error OverMaxSupply();

    /// @notice The transfer failed error
    error TransferFailed();

    /// @notice The refund failed error
    error RefundFailed();

    /// @notice Event emitted when a token is minted
    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 price, uint256 creatorFee);
    
    /// @notice Event emitted when a token is bought
    event TokenBought(address indexed buyer, uint256 indexed tokenId, uint256 price, uint256 creatorFee);
    
    /// @notice Event emitted when a token is sold
    event TokenSold(address indexed seller, uint256 indexed tokenId, uint256 price, uint256 creatorFee);

    /// @notice Function to mint a token
    /// @return The token ID
    function mint() external payable returns (uint256);

    /// @notice Function to buy a token
    function buy(uint256 tokenId) external payable;

    /// @notice Function to sell a token
    function sell(uint256 tokenId) external;

    /// @notice Function to check if a token is on sale
    /// @param tokenId The token ID
    /// @return True if the token is on sale, false otherwise
    function isOnSale(uint256 tokenId) external view returns (bool);

    /// @notice Initialize the Flip contract
    /// @param _name The name of the NFT
    /// @param _symbol The symbol of the NFT
    /// @param _initialPrice The initial price of the NFT
    /// @param _maxSupply The maximum supply of the NFT
    /// @param _creatorFeePercent The creator fee percent
    /// @param _feeVault The address of the fee vault
    /// @param _priceContract The address of the price contract
    /// @param _creator The creator address
    /// @param _baseURI The base URI for the NFT
    // function initialize(
    //     string memory _name,
    //     string memory _symbol,
    //     uint256 _initialPrice,
    //     uint256 _maxSupply,
    //     uint256 _creatorFeePercent,
    //     address _feeVault,
    //     address _priceContract,
    //     address _creator,
    //     string memory _baseURI
    // ) external;
}
