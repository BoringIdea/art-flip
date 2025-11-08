// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Validator} from "./libs/Validator.sol";
import {ZetaChainFlipCrossChainOptimized} from "./extensions/crosschain/zetachain/ZetaChainFlipCrossChainOptimized.sol";
import {IRegistry} from "./interfaces/IRegistry.sol";
import {IZetaChainFactory} from "./interfaces/IZetaChainFactory.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title ZetaChainFactory
 * @author @lukema95
 * @notice Factory contract for creating FLIP contracts on ZetaChain
 */
contract ZetaChainFactory is IZetaChainFactory {
    address public registry;
    address public feeVault;
    address public priceContract;
    address public uniswapRouter;
    address public immutable UNIVERSAL_CONTRACT;


    constructor(
        address _registry,
        address _feeVault,
        address _priceContract,
        address _uniswapRouter,
        address _universalContract
    ) {
        if (_registry == address(0) || 
            _feeVault == address(0) || 
            _priceContract == address(0) || 
            _uniswapRouter == address(0) || 
            _universalContract == address(0)) 
        {
            revert ZeroAddress();
        }

        registry = _registry;
        feeVault = _feeVault;
        priceContract = _priceContract;
        uniswapRouter = _uniswapRouter;
        UNIVERSAL_CONTRACT = _universalContract;
    }

    function universalContract() external view returns (address) {
        return UNIVERSAL_CONTRACT;
    }

    /// @dev Modifier to validate the parameters for factory to create a FLIP contract
    modifier validateParams(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent
    ) {
        Validator.validateFLIPParams(
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent
        );
        _;
    }

    /// @dev Modifier to validate the cross chain parameters for factory to create a FLIP contract
    modifier validateCrossChainParams(address gatewayAddress, uint256 gasLimit) {
        _validateCrossChainParams(gatewayAddress, gasLimit);
        _;
    }

    function _validateCrossChainParams(address gatewayAddress, uint256 gasLimit) internal pure {
        if (gatewayAddress == address(0)) {
            revert InvalidGatewayAddress();
        }
        if (gasLimit == 0) {
            revert InvalidGasLimit();
        }
    }

    /// @dev Modifier to validate the creator of the FLIP contract
    modifier onlyCreator(address payable flip) {
        _onlyCreator(flip);
        _;
    }

    function _onlyCreator(address payable flip) internal view {
        if (msg.sender != ZetaChainFlipCrossChainOptimized(flip).creator()) {
            revert Unauthorized();
        }
    }

    function createFLIPZetaChainCrossChain(
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
    ) 
        external 
        validateParams(
          name, 
          symbol, 
          initialPrice, 
          maxSupply, 
          maxPrice, 
          creatorFeePercent)
        validateCrossChainParams(gatewayAddress, gasLimit)
        returns (address) 
    {
        address creator = msg.sender;
        bytes32 salt = getSalt(
          name, 
          symbol, 
          initialPrice, 
          maxSupply, 
          maxPrice, 
          creatorFeePercent, 
          gatewayAddress, 
          gasLimit, 
          supportMint);

        bytes memory initData = abi.encodeWithSelector(
            ZetaChainFlipCrossChainOptimized.initialize.selector,
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent,
            feeVault,
            priceContract,
            creator,
            baseUri,
            gatewayAddress,
            uniswapRouter,
            gasLimit,
            supportMint
        );

        ERC1967Proxy proxy = new ERC1967Proxy{
            salt: salt
        }(UNIVERSAL_CONTRACT, initData);

        address universalContractAddress = address(proxy);
        IRegistry(registry).register(creator, universalContractAddress);

        emit FLIPCreated(
            creator,
            universalContractAddress,
            priceContract,
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent,
            baseUri
        );
        
        return universalContractAddress;
    }

    function setConnected(address payable flip, address zrc20, address connected) external onlyCreator(flip) {
        ZetaChainFlipCrossChainOptimized(flip).setConnected(zrc20, connected);
        emit SetConnected(flip, zrc20, connected);
    }

    function setGateway(address payable flip, address gateway) external onlyCreator(flip) {
        ZetaChainFlipCrossChainOptimized(flip).setGateway(gateway);
        emit SetGateway(flip, gateway);
    }

    function setGasLimit(address payable flip, uint256 gasLimit) external onlyCreator(flip) {
        ZetaChainFlipCrossChainOptimized(flip).setGasLimit(gasLimit);
        emit SetGasLimit(flip, gasLimit);
    }

    function getSalt(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        address gatewayAddress,
        uint256 gasLimit,
        bool supportMint
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                name,
                symbol,
                initialPrice,
                maxSupply,
                maxPrice,
                creatorFeePercent,
                gatewayAddress,
                gasLimit,
                supportMint
            )
        );
    }
}