// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**********************************************************************
 * ████████╗  ██╗       ██╗   ██████╗   ░█████╗  ░██████╗  ░████████╗ *
 * ██╔════╝   ██║       ██║   ██╔══██╗  ██╔══██╗  ██╔══██╗  ╚══██╔══╝ *
 * █████╗     ██║       ██║   ██████╔╝  ███████║  ██████╔╝     ██║    *
 * ██╔══╝     ██║       ██║   ██╔═══╝   ██╔══██║  ██╔══██╗     ██║    *
 * ██║        ███████╗  ██║   ██║       ██║  ██║  ██║  ██║     ██║    *
 * ╚═╝        ╚══════╝  ╚═╝   ╚═╝       ╚═╝  ╚═╝  ╚═╝  ╚═╝     ╚═╝    *
 *                        ⭐️ FLIP.ART ⭐️                               *
 **********************************************************************/

import {Flip} from "./Flip.sol";
import {EVMFlipCrossChain} from "./extensions/crosschain/evm/EVMFlipCrossChain.sol";
import {IRegistry} from "./interfaces/IRegistry.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {Validator} from "./libs/Validator.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title Factory Contract
 * @author @lukema95
 * @notice Factory contract for creating FLIP contracts
 */
contract Factory is IFactory {
    address public override registry;
    address public override feeVault;
    address public override priceContract;
    address public immutable FLIP_IMPLEMENTATION;
    address public immutable FLIP_CROSS_CHAIN_IMPLEMENTATION;


    constructor(
        address _registry, 
        address _feeVault, 
        address _priceContract, 
        address _flipImplementation,
        address _flipCrossChainImplementation
    ) {
        if (_registry == address(0) || 
            _feeVault == address(0) || 
            _priceContract == address(0) || 
            _flipImplementation == address(0) || 
            _flipCrossChainImplementation == address(0)) 
        {
            revert ZeroAddress();
        }

        registry = _registry;
        feeVault = _feeVault;
        priceContract = _priceContract;
        FLIP_IMPLEMENTATION = _flipImplementation;
        FLIP_CROSS_CHAIN_IMPLEMENTATION = _flipCrossChainImplementation;
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

    /// @dev Modifier to validate cross-chain specific parameters
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
    modifier onlyCreator(address flip) {
        _onlyCreator(flip);
        _;
    }

    function _onlyCreator(address flip) internal view {
        if (msg.sender != Flip(flip).creator()) {
            revert Unauthorized();
        }
    }

    /// @inheritdoc IFactory
    function createFLIP(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string memory baseUri
    )
        external
        validateParams(name, symbol, initialPrice, maxSupply, maxPrice, creatorFeePercent)
        returns (address)
    {
        address creator = msg.sender;
        bytes32 salt = getSalt(name, symbol, initialPrice, maxSupply, maxPrice);
        bytes memory initData = abi.encodeWithSelector(
            Flip.initialize.selector,
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent,
            feeVault,
            priceContract,
            creator,
            baseUri
        );

        ERC1967Proxy proxy = new ERC1967Proxy{
            salt: salt
        }(FLIP_IMPLEMENTATION, initData);
        
        address flipAddress = address(proxy);
        
        emit FLIPCreated(
            creator,
            flipAddress,
            priceContract,
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent,
            baseUri
        );

        IRegistry(registry).register(creator, flipAddress);
        return flipAddress;
    }

    /// @inheritdoc IFactory
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
    )
        external
        validateParams(name, symbol, initialPrice, maxSupply, maxPrice, creatorFeePercent)
        validateCrossChainParams(gatewayAddress, gasLimit)
        returns (address)
    {
        address creator = msg.sender;
        bytes32 salt = getCrossChainSalt(
            name, 
            symbol, 
            initialPrice, 
            maxSupply, 
            maxPrice, 
            creatorFeePercent,
            baseUri,
            gatewayAddress,
            gasLimit,
            supportMint
            );

        bytes memory initData = abi.encodeWithSelector(
            EVMFlipCrossChain.initialize.selector,
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
            gasLimit,
            supportMint
        );

        ERC1967Proxy proxy = new ERC1967Proxy{
            salt: salt
        }(FLIP_CROSS_CHAIN_IMPLEMENTATION, initData);
        
        address flipAddress = address(proxy);
        
        emit FLIPCrossChainCreated(
            creator,
            flipAddress,
            priceContract,
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent,
            baseUri,
            gatewayAddress,
            gasLimit,
            supportMint
        );

        IRegistry(registry).register(creator, flipAddress);
        return flipAddress;
    }

    /// @inheritdoc IFactory
    function calculateFLIPAddress(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice,
        uint256 creatorFeePercent,
        string memory baseUri
    ) public view returns (address flipAddress) {
        address creator = msg.sender;
        
        bytes memory initData = abi.encodeWithSelector(
            Flip.initialize.selector,
            name,
            symbol,
            initialPrice,
            maxSupply,
            maxPrice,
            creatorFeePercent,
            feeVault,
            priceContract,
            creator,
            baseUri
        );

        bytes memory proxyInitParams = abi.encode(FLIP_IMPLEMENTATION, initData);
        bytes32 salt = getSalt(name, symbol, initialPrice, maxSupply, maxPrice);
        flipAddress = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(
                                abi.encodePacked(
                                    type(ERC1967Proxy).creationCode,
                                    proxyInitParams
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    /// @inheritdoc IFactory
    function setUniversal(address payable flip, address universal) external onlyCreator(flip) {
        EVMFlipCrossChain(flip).setUniversal(universal);
        emit SetUniversal(flip, universal);
    }

    /// @inheritdoc IFactory
    function setGateway(address payable flip, address gateway) external onlyCreator(flip) {
        EVMFlipCrossChain(flip).setGateway(gateway);
        emit SetGateway(flip, gateway);
    }

    /// @inheritdoc IFactory
    function setGasLimit(address payable flip, uint256 gasLimit) external onlyCreator(flip) {
        EVMFlipCrossChain(flip).setGasLimit(gasLimit);
        emit SetGasLimit(flip, gasLimit);
    }

    /// @inheritdoc IFactory
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
    ) public view returns (address flipAddress) {
        address creator = msg.sender;
        
        bytes memory initData = abi.encodeWithSelector(
            EVMFlipCrossChain.initialize.selector,
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
            gasLimit,
            supportMint
        );

        bytes memory proxyInitParams = abi.encode(FLIP_CROSS_CHAIN_IMPLEMENTATION, initData);
        bytes32 salt = getCrossChainSalt(
            name, 
            symbol, 
            initialPrice, 
            maxSupply, 
            maxPrice, 
            creatorFeePercent,
            baseUri,
            gatewayAddress,
            gasLimit,
            supportMint);

        flipAddress = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(
                                abi.encodePacked(
                                    type(ERC1967Proxy).creationCode,
                                    proxyInitParams
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    function getSalt(
        string memory name,
        string memory symbol,
        uint256 initialPrice,
        uint256 maxSupply,
        uint256 maxPrice
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(name, symbol, initialPrice, maxSupply, maxPrice));
    }

    function getCrossChainSalt(
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
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                name, 
                symbol, 
                initialPrice, 
                maxSupply, 
                maxPrice, 
                creatorFeePercent,
                baseUri,
                gatewayAddress,
                gasLimit,
                supportMint
            )
        );
    }
}
