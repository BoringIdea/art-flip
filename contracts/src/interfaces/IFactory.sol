// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Factory Interface
/// @notice This interface is used to create FLIP contracts
interface IFactory {
    /// @notice Error thrown when an invalid gateway address is provided
    error InvalidGatewayAddress();

    /// @notice Error thrown when an invalid gas limit is provided
    error InvalidGasLimit();

    /// @notice Error thrown when a zero address is provided
    error ZeroAddress();

    /// @notice Error thrown when an unauthorized action is attempted
    error Unauthorized();
    
    /// @notice The address of the registry contract
    function registry() external view returns (address);

    /// @notice The address of the fee vault contract
    function feeVault() external view returns (address);

    /// @notice The address of the price contract
    function priceContract() external view returns (address);

    /// @notice Event emitted when a FLIP contract is created
    /// @param creator The creator of the FLIP
    /// @param flipAddress The address of the FLIP
    /// @param priceAddress The address of the price contract
    /// @param name The name of the FLIP
    /// @param symbol The symbol of the FLIP
    /// @param initialPrice The initial price of the FLIP
    /// @param maxSupply The maximum supply of the FLIP
    /// @param maxPrice The maximum price of the FLIP
    /// @param creatorFeePercent The creator fee percent of the FLIP
    /// @param baseUri The base URI of the FLIP
    event FLIPCreated(
        address indexed creator,
        address indexed flipAddress,
        address priceAddress,
        string name,
        string symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string baseUri
    );

    /// @notice Event emitted when the universal contract is set for a FLIP
    /// @param flip The address of the FLIP contract
    /// @param universal The address of the universal contract
    event SetUniversal(address indexed flip, address universal);

    /// @notice Event emitted when the gateway is set for a FLIP
    /// @param flip The address of the FLIP contract
    /// @param gateway The address of the gateway
    event SetGateway(address indexed flip, address gateway);

    /// @notice Event emitted when the gas limit is set for a FLIP
    /// @param flip The address of the FLIP contract
    /// @param gasLimit The gas limit value
    event SetGasLimit(address indexed flip, uint256 gasLimit);

    /// @notice Event emitted when a FLIP CrossChain contract is created
    /// @param creator The creator of the FLIP CrossChain
    /// @param flipAddress The address of the FLIP CrossChain
    /// @param priceAddress The address of the price contract
    /// @param name The name of the FLIP CrossChain
    /// @param symbol The symbol of the FLIP CrossChain
    /// @param initialPrice The initial price of the FLIP CrossChain
    /// @param maxSupply The maximum supply of the FLIP CrossChain
    /// @param maxPrice The maximum price of the FLIP CrossChain
    /// @param creatorFeePercent The creator fee percent of the FLIP CrossChain
    /// @param baseUri The base URI of the FLIP CrossChain
    /// @param gatewayAddress The address of the gateway contract
    /// @param gasLimit The gas limit for cross-chain operations
    /// @param supportMint Whether the contract supports minting
    event FLIPCrossChainCreated(
        address indexed creator,
        address indexed flipAddress,
        address priceAddress,
        string name,
        string symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string baseUri,
        address gatewayAddress,
        uint256 gasLimit,
        bool supportMint
    );

    /// @notice Create a FLIP contract
    /// @param name The name of the FLIP
    /// @param symbol The symbol of the FLIP
    /// @param initialPrice The initial price of the FLIP
    /// @param maxSupply The maximum supply of the FLIP
    /// @param maxPrice The maximum price of the FLIP
    /// @param creatorFeePercent The creator fee percent of the FLIP
    /// @param baseUri The base URI of the FLIP
    function createFLIP(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string memory baseUri
    ) external returns (address);

    /// @notice Create a FLIP CrossChain contract
    /// @param name The name of the FLIP CrossChain
    /// @param symbol The symbol of the FLIP CrossChain
    /// @param initialPrice The initial price of the FLIP CrossChain
    /// @param maxSupply The maximum supply of the FLIP CrossChain
    /// @param maxPrice The maximum price of the FLIP CrossChain
    /// @param creatorFeePercent The creator fee percent of the FLIP CrossChain
    /// @param baseUri The base URI of the FLIP CrossChain
    /// @param gatewayAddress The address of the gateway contract
    /// @param gasLimit The gas limit for cross-chain operations
    /// @param supportMint Whether the contract supports minting
    function createFLIPCrossChain(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string memory baseUri,
        address gatewayAddress,
        uint256 gasLimit,
        bool supportMint
    ) external returns (address);

    /// @notice Calculate the address of a FLIP contract
    /// @param name The name of the FLIP
    /// @param symbol The symbol of the FLIP
    /// @param initialPrice The initial price of the FLIP
    /// @param maxSupply The maximum supply of the FLIP
    /// @param maxPrice The maximum price of the FLIP
    /// @param creatorFeePercent The creator fee percent of the FLIP
    /// @param baseUri The base URI of the FLIP
    /// @return The address of the FLIP contract
    function calculateFLIPAddress(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string memory baseUri
    ) external view returns (address);

    /// @notice Calculate the address of a FLIP CrossChain contract
    /// @param name The name of the FLIP CrossChain
    /// @param symbol The symbol of the FLIP CrossChain
    /// @param initialPrice The initial price of the FLIP CrossChain
    /// @param maxSupply The maximum supply of the FLIP CrossChain
    /// @param maxPrice The maximum price of the FLIP CrossChain
    /// @param creatorFeePercent The creator fee percent of the FLIP CrossChain
    /// @param baseUri The base URI of the FLIP CrossChain
    /// @param gatewayAddress The address of the gateway contract
    /// @param gasLimit The gas limit for cross-chain operations
    /// @return The address of the FLIP CrossChain contract
    /// @param supportMint Whether the contract supports minting
    function calculateFLIPCrossChainAddress(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string memory baseUri,
        address gatewayAddress,
        uint256 gasLimit,
        bool supportMint
    ) external view returns (address);

    /// @notice Set the universal contract address for a FLIP CrossChain contract
    /// @param flip The address of the FLIP CrossChain contract
    /// @param universal The address of the universal contract
    function setUniversal(address payable flip, address universal) external;

    /// @notice Set the gateway contract address for a FLIP CrossChain contract
    /// @param flip The address of the FLIP CrossChain contract
    /// @param gateway The address of the gateway contract
    function setGateway(address payable flip, address gateway) external;

    /// @notice Set the gas limit for a FLIP CrossChain contract
    /// @param flip The address of the FLIP CrossChain contract
    /// @param gasLimit The gas limit for the contract
    function setGasLimit(address payable flip, uint256 gasLimit) external;
}