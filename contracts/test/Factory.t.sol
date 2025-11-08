// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Factory} from "../src/Factory.sol";
import {Registry} from "../src/Registry.sol";
import {Flip} from "../src/Flip.sol";
import {EVMFlipCrossChain} from "../src/extensions/crosschain/evm/EVMFlipCrossChain.sol";
import {FeeVault} from "../src/core/FeeVault.sol";
import {Price} from "../src/core/Price.sol";
import {IPrice} from "../src/interfaces/core/IPrice.sol";
import {IFactory} from "../src/interfaces/IFactory.sol";
import {Validator} from "../src/libs/Validator.sol";

contract FactoryTest is Test {
    Factory public factory;
    Registry public registry;
    FeeVault public feeVault;
    Price public priceContract;
    Flip public flipImplementation;
    EVMFlipCrossChain public flipCrossChainImplementation;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public mockGateway = address(0x3);
    address public mockUniversal = address(0x4);
    uint256 public mockGasLimit = 500000;
    
    receive() external payable {}
        
    function setUp() public {
        registry = new Registry();
        feeVault = new FeeVault();
        priceContract = new Price();
        flipImplementation = new Flip();
        flipCrossChainImplementation = new EVMFlipCrossChain();
        factory = new Factory(
            address(registry), 
            address(feeVault), 
            address(priceContract), 
            address(flipImplementation),
            address(flipCrossChainImplementation)
        );
        
        // Give test accounts some ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function test_createFLIP() public {
        address contractAddress = factory.createFLIP(
            "Flip", 
            "FLIP", 
            0.001 ether, 
            10000, 
            0,
            0.05 ether, 
            "https://flip.com/image.png"
            );
        Flip flip = Flip(contractAddress);
        
        address expectedAddress = factory.calculateFLIPAddress(
            "Flip", 
            "FLIP", 
            0.001 ether, 
            10000, 
            0,
            0.05 ether,
            "https://flip.com/image.png"
            );
        console.log("Deployed address:", address(flip));
        console.log("Expected address:", expectedAddress);
        assertEq(address(flip), expectedAddress);

        address[] memory creatorContracts = registry.getCreatorContracts(address(this));
        assertEq(creatorContracts.length, 1);
        assertEq(creatorContracts[0], expectedAddress);

        address creator = registry.getContractCreator(expectedAddress);
        assertEq(creator, address(this));

        uint256 buyPrice = IPrice(flip.priceContract()).getBuyPriceAfterFee(address(flip));
        vm.prank(alice);
        flip.mint{value: buyPrice}();
        assertEq(flip.balanceOf(alice), 1);
    }

    function test_createFLIPCrossChain() public {
        address payable contractAddress = payable(factory.createFLIPCrossChain(
            "FlipTest1", 
            "FLIPTEST1", 
            1000000000000000, 
            10000, 
            1000000000000000000,
            50000000000000000, 
            "https://flipcrosschain.com/image.png",
            address(0x0c487a766110c85d301D96E33579C5B317Fa4995),
            12000000,
            true
        ));
        EVMFlipCrossChain flipCrossChain = EVMFlipCrossChain(contractAddress);
        
        address expectedAddress = factory.calculateFLIPCrossChainAddress(
            "FlipTest1", 
            "FLIPTEST1", 
            1000000000000000, 
            10000, 
            1000000000000000000,
            50000000000000000, 
            "https://flipcrosschain.com/image.png",
            address(0x0c487a766110c85d301D96E33579C5B317Fa4995),
            12000000,
            true
        );
        console.log("CrossChain Deployed address:", address(flipCrossChain));
        console.log("CrossChain Expected address:", expectedAddress);
        assertEq(address(flipCrossChain), expectedAddress);

        address[] memory creatorContracts = registry.getCreatorContracts(address(this));
        assertEq(creatorContracts.length, 1);
        assertEq(creatorContracts[0], expectedAddress);

        address creator = registry.getContractCreator(expectedAddress);
        assertEq(creator, address(this));

        // Test basic properties
        // assertEq(flipCrossChain.name(), "FlipCrossChain");
        // assertEq(flipCrossChain.symbol(), "FLICC");
        // assertEq(flipCrossChain.initialPrice(), 0.001 ether);
        // assertEq(flipCrossChain.maxSupply(), 10000);
        // assertEq(flipCrossChain.creatorFeePercent(), 0.05 ether);
        // assertEq(flipCrossChain.creator(), address(this));
        // assertEq(flipCrossChain.feeVault(), address(feeVault));
        // assertEq(flipCrossChain.priceContract(), address(priceContract));
        // assertEq(flipCrossChain.isSupportMint(), true);
        
        // Test cross-chain specific properties
        // assertEq(flipCrossChain.gateway(), mockGateway);
        // assertEq(flipCrossChain.gasLimit(), mockGasLimit);
    }

    function test_factoryState() public {
        assertEq(factory.registry(), address(registry));
        assertEq(factory.feeVault(), address(feeVault));
        assertEq(factory.priceContract(), address(priceContract));
        assertEq(factory.FLIP_IMPLEMENTATION(), address(flipImplementation));
        assertEq(factory.FLIP_CROSS_CHAIN_IMPLEMENTATION(), address(flipCrossChainImplementation));
    }

    function test_calculateFLIPAddress() public {
        address calculatedAddress = factory.calculateFLIPAddress(
            "Test", 
            "TEST", 
            0.001 ether, 
            1000, 
            0,
            0.1 ether,
            "https://test.com"
        );
        
        address actualAddress = factory.createFLIP(
            "Test", 
            "TEST", 
            0.001 ether, 
            1000, 
            0,
            0.1 ether, 
            "https://test.com"
        );
        
        assertEq(calculatedAddress, actualAddress);
    }

    function test_calculateFLIPCrossChainAddress() public {
        address calculatedAddress = factory.calculateFLIPCrossChainAddress(
            "TestCrossChain", 
            "TESTCC", 
            0.001 ether, 
            1000, 
            0,
            0.1 ether,
            "https://testcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        address actualAddress = factory.createFLIPCrossChain(
            "TestCrossChain", 
            "TESTCC", 
            0.001 ether, 
            1000, 
            0,
            0.1 ether, 
            "https://testcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        assertEq(calculatedAddress, actualAddress);
    }

    function test_createMultipleFLIPs() public {
        // Create first FLIP
        address flip1 = factory.createFLIP(
            "Flip1", 
            "FLIP1", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip1.com"
        );
        
        // Create second FLIP
        address flip2 = factory.createFLIP(
            "Flip2", 
            "FLIP2", 
            0.002 ether, 
            2000, 
            0,
            0.1 ether, 
            "https://flip2.com"
        );
        
        // Verify both are registered
        address[] memory creatorContracts = registry.getCreatorContracts(address(this));
        assertEq(creatorContracts.length, 2);
        assertTrue(creatorContracts[0] == flip1 || creatorContracts[1] == flip1);
        assertTrue(creatorContracts[0] == flip2 || creatorContracts[1] == flip2);
        
        // Verify different addresses
        assertFalse(flip1 == flip2);
    }

    function test_createMultipleFLIPCrossChains() public {
        // Create first FLIP CrossChain
        address flipCc1 = factory.createFLIPCrossChain(
            "FlipCC1", 
            "FLIPCC1", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flipcc1.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        // Create second FLIP CrossChain with different parameters
        address flipCc2 = factory.createFLIPCrossChain(
            "FlipCC2", 
            "FLIPCC2", 
            0.002 ether, 
            2000, 
            0,
            0.1 ether, 
            "https://flipcc2.com",
            mockGateway,
            mockGasLimit + 100000, // Different gas limit
            true
        );
        
        // Verify both are registered
        address[] memory creatorContracts = registry.getCreatorContracts(address(this));
        assertEq(creatorContracts.length, 2);
        assertTrue(creatorContracts[0] == flipCc1 || creatorContracts[1] == flipCc1);
        assertTrue(creatorContracts[0] == flipCc2 || creatorContracts[1] == flipCc2);
        
        // Verify different addresses
        assertFalse(flipCc1 == flipCc2);
    }

    function test_createMixedFLIPs() public {
        // Create regular FLIP
        address flip = factory.createFLIP(
            "RegularFlip", 
            "RFLIP", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://regular.com"
        );
        
        // Create CrossChain FLIP
        address flipCc = factory.createFLIPCrossChain(
            "CrossChainFlip", 
            "CCFLIP", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://crosschain.com",
            mockGateway,    
            mockGasLimit,
            true
        );
        
        // Verify both are registered
        address[] memory creatorContracts = registry.getCreatorContracts(address(this));
        assertEq(creatorContracts.length, 2);
        assertTrue(creatorContracts[0] == flip || creatorContracts[1] == flip);
        assertTrue(creatorContracts[0] == flipCc || creatorContracts[1] == flipCc);
        
        // Verify different addresses
        assertFalse(flip == flipCc);
    }

    function test_createFLIPByDifferentCreators() public {
        // Create FLIP by this contract
        address flip1 = factory.createFLIP(
            "Flip1", 
            "FLIP1", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip1.com"
        );
        
        // Create FLIP by alice
        vm.prank(alice);
        address flip2 = factory.createFLIP(
            "Flip2", 
            "FLIP2", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip2.com"
        );
        
        // Verify registry entries
        address[] memory thisContracts = registry.getCreatorContracts(address(this));
        address[] memory aliceContracts = registry.getCreatorContracts(alice);
        
        assertEq(thisContracts.length, 1);
        assertEq(aliceContracts.length, 1);
        assertEq(thisContracts[0], flip1);
        assertEq(aliceContracts[0], flip2);
        
        assertEq(registry.getContractCreator(flip1), address(this));
        assertEq(registry.getContractCreator(flip2), alice);
    }

    function test_createFLIPCrossChainByDifferentCreators() public {
        // Create FLIP CrossChain by this contract
        address flipCc1 = factory.createFLIPCrossChain(
            "FlipCC1", 
            "FLIPCC1", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flipcc1.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        // Create FLIP CrossChain by alice
        vm.prank(alice);
        address flipCc2 = factory.createFLIPCrossChain(
            "FlipCC2", 
            "FLIPCC2", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flipcc2.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        // Verify registry entries
        address[] memory thisContracts = registry.getCreatorContracts(address(this));
        address[] memory aliceContracts = registry.getCreatorContracts(alice);
        
        assertEq(thisContracts.length, 1);
        assertEq(aliceContracts.length, 1);
        assertEq(thisContracts[0], flipCc1);
        assertEq(aliceContracts[0], flipCc2);
        
        assertEq(registry.getContractCreator(flipCc1), address(this));
        assertEq(registry.getContractCreator(flipCc2), alice);
    }

    function test_flipContractProperties() public {
        address flipAddress = factory.createFLIP(
            "TestFlip", 
            "TFLIP", 
            0.001 ether, 
            5000, 
            0,
            0.03 ether, 
            "https://testflip.com"
        );
        
        Flip flip = Flip(flipAddress);
        
        // Test basic properties
        assertEq(flip.name(), "TestFlip");
        assertEq(flip.symbol(), "TFLIP");
        assertEq(flip.initialPrice(), 0.001 ether);
        assertEq(flip.maxSupply(), 5000);
        assertEq(flip.creatorFeePercent(), 0.03 ether);
        assertEq(flip.creator(), address(this));
        assertEq(flip.feeVault(), address(feeVault));
        assertEq(flip.priceContract(), address(priceContract));
        assertEq(flip.totalSupply(), 0);
        assertEq(flip.currentSupply(), 0);
    }

    function test_flipCrossChainContractProperties() public {
        address payable flipCcAddress = payable(factory.createFLIPCrossChain(
            "TestFlipCC", 
            "TFLICC", 
            0.001 ether, 
            5000, 
            0,
            0.03 ether, 
            "https://testflipcc.com",
            mockGateway,
            mockGasLimit,
            true
        ));
        
        EVMFlipCrossChain flipCc = EVMFlipCrossChain(flipCcAddress);
        
        // Test basic properties
        assertEq(flipCc.name(), "TestFlipCC");
        assertEq(flipCc.symbol(), "TFLICC");
        assertEq(flipCc.initialPrice(), 0.001 ether);
        assertEq(flipCc.maxSupply(), 5000);
        assertEq(flipCc.creatorFeePercent(), 0.03 ether);
        assertEq(flipCc.creator(), address(this));
        assertEq(flipCc.feeVault(), address(feeVault));
        assertEq(flipCc.priceContract(), address(priceContract));
        assertEq(flipCc.totalSupply(), 0);
        assertEq(flipCc.currentSupply(), 0);
        
        // Test cross-chain specific properties
        assertEq(flipCc.gateway(), mockGateway);
        assertEq(flipCc.gasLimit(), mockGasLimit);
    }

    function test_priceCalculation() public {
        address flipAddress = factory.createFLIP(
            "PriceTest", 
            "PRICE", 
            0.001 ether, 
            1000, 
            0,
            0.1 ether, 
            "https://price.com"
        );
        
        Flip flip = Flip(flipAddress);
        
        // Test initial price
        uint256 initialBuyPrice = IPrice(flip.priceContract()).getBuyPriceAfterFee(address(flip));
        assertGt(initialBuyPrice, 0.001 ether); // Should be initial price + fee
        
        // Mint one NFT and check price increase
        vm.prank(alice);
        flip.mint{value: initialBuyPrice}();
        
        uint256 secondBuyPrice = IPrice(flip.priceContract()).getBuyPriceAfterFee(address(flip));
        assertGt(secondBuyPrice, initialBuyPrice); // Price should increase
        
        assertEq(flip.totalSupply(), 1);
        assertEq(flip.currentSupply(), 1);
    }

    function test_invalidParametersShouldRevert() public {
        // Test empty name
        vm.expectRevert(abi.encodeWithSelector(Validator.EmptyString.selector, "name"));
        factory.createFLIP(
            "", 
            "FLIP", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip.com"
        );
        
        // Test empty symbol
        vm.expectRevert(abi.encodeWithSelector(Validator.EmptyString.selector, "symbol"));
        factory.createFLIP(
            "Flip", 
            "", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip.com"
        );
        
        // Test invalid initial price (too low)
        vm.expectRevert(abi.encodeWithSelector(Validator.InvalidPrice.selector, 0.00001 ether));
        factory.createFLIP(
            "Flip", 
            "FLIP", 
            0.00001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip.com"
        );
        
        // Test invalid initial price (too high)
        vm.expectRevert(abi.encodeWithSelector(Validator.InvalidPrice.selector, 2 ether));
        factory.createFLIP(
            "Flip", 
            "FLIP", 
            2 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flip.com"
        );
        
        // Test invalid supply (too low)
        vm.expectRevert(abi.encodeWithSelector(Validator.InvalidSupply.selector, 50));
        factory.createFLIP(
            "Flip", 
            "FLIP", 
            0.001 ether, 
            50, 
            0,
            0.05 ether, 
            "https://flip.com"
        );
        
        // Test invalid supply (too high)
        vm.expectRevert(abi.encodeWithSelector(Validator.InvalidSupply.selector, 2000000));
        factory.createFLIP(
            "Flip", 
            "FLIP", 
            0.001 ether, 
            2000000, 
            0,
            0.05 ether, 
            "https://flip.com"
        );
        
        // Test invalid creator fee percent (too low)
        vm.expectRevert(abi.encodeWithSelector(Validator.InvalidFeePercent.selector, 0.005 ether));
        factory.createFLIP(
            "Flip", 
            "FLIP", 
            0.001 ether, 
            1000, 
            0,
            0.005 ether, 
            "https://flip.com"
        );
        
        // Test invalid creator fee percent (too high)
        vm.expectRevert(abi.encodeWithSelector(Validator.InvalidFeePercent.selector, 1.1 ether));
        factory.createFLIP(
            "Flip", 
            "FLIP", 
            0.001 ether, 
            1000, 
            0,
            1.1 ether, 
            "https://flip.com"
        );
    }

    function test_invalidCrossChainParametersShouldRevert() public {
        // Test same invalid parameters as regular FLIP - should still apply to CrossChain
        vm.expectRevert(abi.encodeWithSelector(Validator.EmptyString.selector, "name"));
        factory.createFLIPCrossChain(
            "", 
            "FLIPCC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flipcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        // Test invalid gateway address (zero address)
        vm.expectRevert(abi.encodeWithSelector(IFactory.InvalidGatewayAddress.selector));
        factory.createFLIPCrossChain(
            "FlipCC", 
            "FLIPCC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flipcc.com",
            address(0), 
            mockGasLimit,
            true
        );
        
        // Test invalid gas limit (zero)
        vm.expectRevert(abi.encodeWithSelector(IFactory.InvalidGasLimit.selector));
        factory.createFLIPCrossChain(
            "FlipCC", 
            "FLIPCC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://flipcc.com",
            mockGateway,
            0,
            true
        );
    }

    function test_eventEmission() public {
        // Calculate the expected address first
        address expectedAddress = factory.calculateFLIPAddress(
            "EventTest", 
            "EVENT", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://event.com"
        );
        
        // Test FLIPCreated event
        vm.expectEmit(true, true, false, false);
        emit IFactory.FLIPCreated(
            address(this),
            expectedAddress,
            address(priceContract),
            "EventTest",
            "EVENT",
            0.001 ether,
            1000,
            0,
            0.05 ether,
            "https://event.com"
        );
        
        factory.createFLIP(
            "EventTest", 
            "EVENT", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://event.com"
        );
    }

    function test_crossChainEventEmission() public {
        // Calculate the expected address first
        address expectedAddress = factory.calculateFLIPCrossChainAddress(
            "EventTestCC", 
            "EVENTCC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://eventcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        // Test FLIPCrossChainCreated event
        vm.expectEmit(true, true, false, false);
        emit IFactory.FLIPCrossChainCreated(
            address(this),
            expectedAddress,
            address(priceContract),
            "EventTestCC",
            "EVENTCC",
            0.001 ether,
            1000,
            0,
            0.05 ether,
            "https://eventcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        factory.createFLIPCrossChain(
            "EventTestCC", 
            "EVENTCC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether, 
            "https://eventcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
    }

    function test_deterministic_addresses() public {
        // Same parameters should produce same calculated address
        address calc1 = factory.calculateFLIPAddress(
            "Same", 
            "SAME", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://same.com"
        );
        
        address calc2 = factory.calculateFLIPAddress(
            "Same", 
            "SAME", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://same.com"
        );
        
        assertEq(calc1, calc2);
        
        // Different parameters should produce different addresses
        address calc3 = factory.calculateFLIPAddress(
            "Different", 
            "DIFF", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://different.com"
        );
        
        assertFalse(calc1 == calc3);
    }

    function test_deterministic_crosschain_addresses() public {
        // Same parameters should produce same calculated address
        address calc1 = factory.calculateFLIPCrossChainAddress(
            "SameCC", 
            "SAMECC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://samecc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        address calc2 = factory.calculateFLIPCrossChainAddress(
            "SameCC", 
            "SAMECC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://samecc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        assertEq(calc1, calc2);
        
        // Different CrossChain parameters should produce different addresses
        address calc3 = factory.calculateFLIPCrossChainAddress(
            "DifferentCC", 
            "DIFFCC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://differentcc.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        assertFalse(calc1 == calc3);
        
        // Same basic params but different crosschain params should produce different addresses
        address calc4 = factory.calculateFLIPCrossChainAddress(
            "SameCC", 
            "SAMECC", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://samecc.com",
            address(0x5), // Different gateway
            mockGasLimit,
            true
        );
        
        assertFalse(calc1 == calc4);
    }

    function test_crosschain_vs_regular_addresses_different() public {
        // Regular FLIP and CrossChain FLIP with same basic params should have different addresses
        address regularAddress = factory.calculateFLIPAddress(
            "Test", 
            "TEST", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://test.com"
        );
        
        address crossChainAddress = factory.calculateFLIPCrossChainAddress(
            "Test", 
            "TEST", 
            0.001 ether, 
            1000, 
            0,
            0.05 ether,
            "https://test.com",
            mockGateway,
            mockGasLimit,
            true
        );
        
        assertFalse(regularAddress == crossChainAddress);
    }
}
