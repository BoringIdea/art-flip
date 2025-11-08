'use client'
import React, { useState, useEffect, useMemo } from "react";
import useSWR from 'swr';
import { 
  useAccount, 
  useChainId, 
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain 
} from "wagmi";
import { parseEther } from "viem";
import { Button } from "./ui/button";
import TransactionDialog from "@/components/shared/TransactionDialog";
import { useTransactionDialog } from "@/src/hooks/useTransactionDialog";
import { Collection } from "@/src/api/types";
import { useCrossChainStatus } from "@/src/api";
import { getNFTsByOwnerForCollection } from "@/src/api";
import Loading from './ui/Loading';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CrosschainHistory from './CrosschainHistory';
import { defaultCCTXTracker, CCTXRecord } from '@/lib/cctxTracker';
import { getChainName } from '@/lib/chains';
import { FLIP_EVM_CROSS_CHAIN_ABI, TRADE_ABI, getTradeContractAddress, FACTORY_CONTRACT_ABI, getFactoryContractAddress } from '@/src/contract';
import { SupportedChainId } from '@/src/alchemy';
import { buildSetApprovalForAllTx, buildTransferCrossChainTx } from '@/src/onchain/tradeTx';
import { useContractAddress } from '@/hooks/useContractAddress';

interface CrossChainProps {
  contractAddress: string;
  collection?: Collection;
}

interface ChainInfo {
  id: number;
  name: string;
  symbol: string;
  icon: string;
}

const CHAINS: Record<string, ChainInfo> = {
  'base-sepolia': {
    id: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    icon: '🔵'
  },
  'bsc-testnet': {
    id: 97,
    name: 'BSC Testnet',
    symbol: 'BNB',
    icon: '🟡'
  }
};

const mockTxHash = '0xf11ffae73c222fd259bf5cf8518eb4a14a827bb898b48ae7046d5b67a679cdb5';

// ZRC20 destination address
const DESTINATION_ADDRESS_BSC = '0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891';
const DESTINATION_ADDRESS_BASE = '0x236b0DE675cC8F46AE186897fCCeFe3370C9eDeD';

const DEFAULT_CROSS_CHAIN_GAS_FEE = parseEther("0.001"); // 0.001 ETH
const DEFAULT_GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995";
const DEFAULT_GAS_LIMIT = BigInt(12000000);

const getDestinationAddress = (chainId: number) => {
  if (chainId === 97) {
    // cross to base
    return DESTINATION_ADDRESS_BASE;
  } else if (chainId === 84532) {
    // cross to bsc
    return DESTINATION_ADDRESS_BSC;
  }
  return DESTINATION_ADDRESS_BSC;
};

export default function CrossChain({ contractAddress, collection }: CrossChainProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  
  // State management
  const [activeTab, setActiveTab] = useState<'transfer' | 'history'>('transfer');
  const [sourceChain, setSourceChain] = useState<ChainInfo>(CHAINS['base-sepolia']);
  const [targetChain, setTargetChain] = useState<ChainInfo>(CHAINS['bsc-testnet']);
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [receiverAddress, setReceiverAddress] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [sourceChainDropdownOpen, setSourceChainDropdownOpen] = useState(false);
  const [targetChainDropdownOpen, setTargetChainDropdownOpen] = useState(false);
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [cctxData, setCctxData] = useState<CCTXRecord | null>(null);
  const [isTrackingCctx, setIsTrackingCctx] = useState(false);
  const [cctxHistory, setCctxHistory] = useState<CCTXRecord[]>([]);
  const [pendingApprovalTokenId, setPendingApprovalTokenId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  
  // Contract interaction hooks
  const { data: hash, writeContract, isError: isWriteContractError, error: writeContractError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError, error: contractError } = useWaitForTransactionReceipt({ hash });
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  // Cross-chain status and user tokens
  const { data: crossChainStatus, isLoading: isLoadingCrossChainStatus } = useCrossChainStatus(chainId, collection?.address || '', address as string);
  
  // Check if user has approved the contract to spend NFTs
  const { data: isApproved, refetch: refetchIsApproved } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: FLIP_EVM_CROSS_CHAIN_ABI,
    functionName: 'isApprovedForAll',
    args: [address, getTradeContractAddress(chainId as SupportedChainId)],
    query: { 
      enabled: !!address && !!contractAddress,
      retry: false 
    },
  });

  // Memoize contract params to prevent unnecessary re-renders
  const contractParams = useMemo(() => {
    if (!collection) return undefined;
    
    return {
      name: collection.name,
      symbol: collection.symbol,
      initialPrice: BigInt(collection.initial_price),
      maxSupply: BigInt(collection.max_supply),
      maxPrice: BigInt(collection.max_price),
      creatorFeePercent: BigInt(collection.creator_fee),
      imageUrl: collection.base_uri,
      gatewayAddress: DEFAULT_GATEWAY_ADDRESS,
      gasLimit: BigInt(DEFAULT_GAS_LIMIT),
      supportMint: collection.support_mint,
      creator: collection.creator, // 🎯 Add creator address from collection
    };
  }, [collection]);

  // Use custom hook to get contract addresses with ethers.js
  const { 
    data: sourceChainContractAddress, 
    error: sourceChainError, 
    isLoading: sourceChainLoading 
  } = useContractAddress(sourceChain.id, contractParams);

  const { 
    data: targetChainContractAddress, 
    error: targetChainError, 
    isLoading: targetChainLoading 
  } = useContractAddress(targetChain.id, contractParams);

  useEffect(() => {
    const hashToTrack = crossChainStatus?.data[0]?.transactionHash;
    
    if (hashToTrack && !isTrackingCctx) {
      const updateCCTXRecord = (record: CCTXRecord) => {
        // Always use blockTimestamp from crossChainStatus API
        const originalData = crossChainStatus?.data[0];
        if (originalData && originalData.blockTimestamp) {
          record = {
            ...record,
            blockTimestamp: new Date(originalData.blockTimestamp * 1000)
          };
        } else {
          console.warn('⚠️ No blockTimestamp available from crossChainStatus API');
        }
        
        setCctxData(record);
        setCctxHistory(prev => {
          const exists = prev.find(item => item.transactionHash === record.transactionHash);
          if (!exists) {
            return [record, ...prev];
          }
          return prev.map(item => item.transactionHash === record.transactionHash ? record : item);
        });
      };

      defaultCCTXTracker.trackCCTX(hashToTrack, {
        onCCTXUpdate: updateCCTXRecord,
        onTrackingStart: () => setIsTrackingCctx(true),
        onTrackingComplete: () => setIsTrackingCctx(false),
        onError: (error) => {
          console.error('CCTX tracking failed:', error);
        }
      }).catch(error => {
        console.error('CCTX tracking promise rejected:', error);
      });
    }
  }, [crossChainStatus, isTrackingCctx]);

  // Handle transaction errors
  useEffect(() => {
    if (isError) {
      handleTransactionError(contractError?.toString() || 'Unknown error');
    }
  }, [isError, contractError]);
  
  // Get user's NFTs from the selected source chain via Alchemy
  const { data: alchemyUserNFTs, isLoading: isLoadingTokens } = useSWR(
    address && sourceChainContractAddress ? ["alchemy-nfts", sourceChain.id, address, sourceChainContractAddress] : null,
    () => getNFTsByOwnerForCollection(sourceChain.id as SupportedChainId, address as string, sourceChainContractAddress as string, true, 100),
    { revalidateOnFocus: false, revalidateIfStale: true, keepPreviousData: false }
  );
  
  // Process user NFTs for dropdown
  const userNFTs = useMemo(() => {
    if (!alchemyUserNFTs?.ownedNfts) {
      return [];
    }
    return alchemyUserNFTs.ownedNfts.map((nft: any) => ({
      tokenId: nft.tokenId.toString(),
      name: `${collection?.symbol || 'NFT'} #${nft.tokenId}`,
      image: nft.image?.cachedUrl || 'https://red-naval-coyote-720.mypinata.cloud/ipfs/bafybeibczf5smgrsb5dje6z2na5xvdb5brkl6apbkoy3myjukvfusi5hmm/Drug-nft.png',
    }));
  }, [alchemyUserNFTs, collection?.symbol, chainId]);

  // When source chain contract address changes, reset selected token and close dropdown
  useEffect(() => {
    setSelectedTokenId('');
    setTokenDropdownOpen(false);
  }, [sourceChainContractAddress]);
  
  // Transaction dialog
  const { dialogState, onOpenChange, setDialogState } = useTransactionDialog({
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isWriteContractError,
    writeContractError,
    onConfirmed: () => {
      if (pendingApprovalTokenId !== null) {
        // Approval completed, now execute cross-chain transfer
        refetchIsApproved().then(() => {
          executeCrossChainTransfer(pendingApprovalTokenId);
          setPendingApprovalTokenId(null);
        });
      } else {
        // Cross-chain transfer completed
        setIsTransferring(false);
        setSelectedTokenId('');
      }
    }
  });
  
  // Handle chain selection
  const handleSourceChainSelect = (chainKey: string) => {
    const selectedChain = CHAINS[chainKey];
    setSourceChain(selectedChain);
    setSourceChainDropdownOpen(false);
    // Reset selected token when source chain changes
    setSelectedTokenId('');
    setTokenDropdownOpen(false);
  };
  
  const handleTargetChainSelect = (chainKey: string) => {
    setTargetChain(CHAINS[chainKey]);
    setTargetChainDropdownOpen(false);
  };
  
  // Handle token selection
  const handleTokenSelect = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    setTokenDropdownOpen(false);
  };
  
  // Handle receiver address input
  const handleReceiverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReceiverAddress(event.target.value);
  };
  
  // Fill receiver with user's own address
  const fillSelfAddress = () => {
    if (address) {
      setReceiverAddress(address);
    }
  };
  
  // Handle chain swap
  const handleChainSwap = () => {
    setSourceChain(targetChain);
    setTargetChain(sourceChain);
    // Reset selected token when chains are swapped
    setSelectedTokenId('');
    setTokenDropdownOpen(false);
  };
  
  // Helper function to handle transaction errors
  const handleTransactionError = (errorMessage: string) => {
    setDialogState({ isOpen: true, status: 'error', error: errorMessage });
    setPendingApprovalTokenId(null);
    setIsTransferring(false);
    setIsApproving(false);
  };

  // Execute approval operation
  const executeApproval = (tokenId: string) => {
    setPendingApprovalTokenId(tokenId);
    setIsApproving(true);
    writeContract(
      buildSetApprovalForAllTx({
        nftContractAddress: contractAddress,
        operatorAddress: getTradeContractAddress(chainId as SupportedChainId),
        approved: true,
      }) as any
    );
  };

  // Execute cross-chain transfer
  const executeCrossChainTransfer = (tokenId: string) => {
    if (!address) return;
    
    setIsTransferring(true);
    
    const finalReceiver = receiverAddress || address; // Use custom receiver or fallback to user's address
    
    writeContract(
      buildTransferCrossChainTx({
        tradeContractAddress: getTradeContractAddress(chainId as SupportedChainId),
        flipContractAddress: contractAddress,
        tokenId: Number(tokenId),
        receiver: finalReceiver,
        destination: getDestinationAddress(chainId as SupportedChainId),
        gasFee: DEFAULT_CROSS_CHAIN_GAS_FEE,
      }) as any
    );
  };

  // Main cross-chain transfer function
  const handleCrossChainTransfer = async () => {
    try {
      if (!selectedTokenId || !address) return;
      
      // Check if user is on the correct network
      if (chainId !== sourceChain?.id) {
        try {
          // Show wallet network switch dialog
          if (sourceChain?.id && switchChain) {
            await switchChain({ chainId: sourceChain.id });
          }
          // After successful switch, the component will re-render with new chainId
          return;
        } catch (switchError) {
          console.error('User rejected network switch or switch failed:', switchError);
          return;
        }
      }
      
      const finalReceiver = receiverAddress || address;
      
      console.log('Cross-chain transfer:', {
        tokenId: selectedTokenId,
        sourceChain: sourceChain.name,
        targetChain: targetChain.name,
        userAddress: address,
        receiver: finalReceiver,
        destination: getDestinationAddress(chainId as SupportedChainId),
        isApproved: isApproved
      });

      if (!isApproved) {
        executeApproval(selectedTokenId);
      } else {
        executeCrossChainTransfer(selectedTokenId);
      }
    } catch (error) {
      console.error('Error in handleCrossChainTransfer:', error);
      // Reset any loading states
      setIsTransferring(false);
      setIsApproving(false);
    }
  };
  
  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b border-[#444] gap-2">
        <h1 className="text-base sm:text-lg text-[#aaa]">Cross-Chain Transfer</h1>
        <div className="text-sm text-gray-400">
          Transfer your NFTs between chains
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-[#444]">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'transfer' | 'history')}>
          <TabsList className="border-b border-[#444] bg-transparent w-full justify-start">
            <TabsTrigger
              value="transfer"
              className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
            >
              Transfer
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
            >
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transfer" className="m-0">
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 mt-3 px-4">
              {/* Left Section: Operation Controls */}
              <div className="lg:w-1/2 w-full flex justify-center lg:justify-start">
                <div className="w-full max-w-md">
                  <div className="p-4 space-y-4 rounded-lg border border-[#444] bg-[#18191c] overflow-hidden">
        {/* Source Chain Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Source Chain</label>
            {address && sourceChain?.id && chainId !== sourceChain.id && (
              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">
                Switch network required
              </span>
            )}
          </div>
          {/* Temporarily disable source chain selection; keep UI but block interaction */}
          <Popover.Root open={false} onOpenChange={() => {}}>
            <Popover.Trigger asChild>
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#444] bg-[#18191c] transition-colors opacity-70 cursor-not-allowed"
                disabled
                aria-disabled="true"
                title="Source chain selection is temporarily disabled"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{sourceChain.icon}</span>
                  <span className="text-white font-medium">{sourceChain.name}</span>
                  {isSwitchingChain && (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content sideOffset={8} className="z-50 bg-neutral-900 rounded-xl shadow-2xl p-2 w-full max-w-sm border border-neutral-800">
                {/* Options disabled temporarily */}
                <Popover.Arrow className="fill-neutral-900" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          
          {/* Source Chain Contract Address */}
          {sourceChainLoading ? (
            <div className="mt-2 p-2 bg-[#1a1a1a] rounded border border-[#333]">
              <div className="text-xs text-gray-400 mb-1">Contract Address:</div>
              <div className="text-xs text-yellow-400">Loading...</div>
            </div>
          ) : sourceChainError ? (
            <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
              <div className="text-xs text-gray-400 mb-1">Contract Address:</div>
              <div className="text-xs text-red-400">Error: Failed to calculate address</div>
            </div>
          ) : sourceChainContractAddress ? (
            <div className="mt-2 p-2 bg-[#1a1a1a] rounded border border-[#333]">
              <div className="text-xs text-gray-400 mb-1">Contract Address:</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white font-mono break-all">
                  {sourceChainContractAddress as string}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(sourceChainContractAddress as string)}
                  className="text-xs text-green-400 hover:text-green-300 px-2 py-1 bg-green-500/10 rounded transition-colors flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Transfer Direction Arrow */}
        <div className="flex justify-center">
          {/* Temporarily disable chain swap */}
          <button 
            onClick={(e) => e.preventDefault()}
            className="w-10 h-8 rounded-lg bg-[#3af73e] border border-[#3af73e] transition-colors flex items-center justify-center opacity-60 cursor-not-allowed"
            disabled
            aria-disabled="true"
            title="Chain swap is temporarily disabled"
          >
            <span className="text-black text-sm">↓</span>
          </button>
        </div>
        
        {/* Target Chain Selection (temporarily disabled) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Target Chain</label>
          <Popover.Root open={false} onOpenChange={() => {}}>
            <Popover.Trigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#444] bg-[#18191c] transition-colors opacity-70 cursor-not-allowed" disabled aria-disabled="true" title="Target chain selection is temporarily disabled">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{targetChain.icon}</span>
                  <span className="text-white font-medium">{targetChain.name}</span>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content sideOffset={8} className="z-50 bg-neutral-900 rounded-xl shadow-2xl p-2 w-full max-w-sm border border-neutral-800">
                {/* Options disabled temporarily */}
                <Popover.Arrow className="fill-neutral-900" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          
          {/* Target Chain Contract Address */}
          {targetChainLoading ? (
            <div className="mt-2 p-2 bg-[#1a1a1a] rounded border border-[#333]">
              <div className="text-xs text-gray-400 mb-1">Contract Address:</div>
              <div className="text-xs text-yellow-400">Loading...</div>
            </div>
          ) : targetChainContractAddress ? (
            <div className="mt-2 p-2 bg-[#1a1a1a] rounded border border-[#333]">
              <div className="text-xs text-gray-400 mb-1">Contract Address:</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white font-mono break-all">
                  {targetChainContractAddress as string}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(targetChainContractAddress as string)}
                  className="text-xs text-green-400 hover:text-green-300 px-2 py-1 bg-green-500/10 rounded transition-colors flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Token ID Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Select NFT</label>
          <Popover.Root open={tokenDropdownOpen} onOpenChange={setTokenDropdownOpen}>
            <Popover.Trigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-[#444] bg-[#18191c] hover:bg-[#222] transition-colors" disabled={sourceChainLoading || isLoadingTokens}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const selected = userNFTs.find((n: any) => n.tokenId === selectedTokenId);
                    return selected?.image ? (
                      <div className="w-6 h-6 rounded overflow-hidden bg-neutral-800 flex-shrink-0">
                        <img src={selected.image} alt={`NFT #${selectedTokenId}`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-lg">🎨</span>
                    );
                  })()}
                  <span className="text-white font-medium">
                    {selectedTokenId ? `NFT #${selectedTokenId}` : 'Select NFT to transfer'}
                  </span>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content sideOffset={8} className="z-50 bg-neutral-900 rounded-xl shadow-2xl p-2 w-full max-w-md border border-neutral-800 max-h-60 overflow-y-auto">
                {sourceChainLoading || isLoadingTokens ? (
                  <div className="p-4 text-center">
                    <Loading />
                  </div>
                ) : userNFTs.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No NFTs found
                  </div>
                ) : (
                  userNFTs.map((nft: any) => (
                    <button
                      key={nft.tokenId}
                      onClick={() => handleTokenSelect(nft.tokenId)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                    >
                      {nft.image ? (
                        <div className="w-8 h-8 rounded overflow-hidden bg-neutral-800 flex-shrink-0">
                          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-lg">🎨</span>
                      )}
                      <span className="text-white font-medium">{nft.name}</span>
                    </button>
                  ))
                )}
                <Popover.Arrow className="fill-neutral-900" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        
        {/* Receiver Address Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Receiver Address</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={receiverAddress}
              onChange={handleReceiverChange}
              placeholder="Enter receiver address (0x...)"
              className="flex-1 p-3 rounded-lg border border-[#444] bg-[#18191c] text-white placeholder-gray-400 focus:border-[#3af73e] focus:outline-none transition-colors w-full"
            />
            <Button
              onClick={fillSelfAddress}
              disabled={!address}
              className="px-4 py-3 bg-[#333] text-gray-300 border border-[#444] rounded-lg hover:bg-[#444] transition-colors text-sm w-full sm:w-auto flex-shrink-0"
            >
              Use My Address
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            {receiverAddress ? (
              <span>NFT will be sent to: {receiverAddress}</span>
            ) : (
              <span>If empty, NFT will be sent to your address ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'})</span>
            )}
          </div>
        </div>
        
        {/* Transfer Summary */}
        {selectedTokenId && (
          <div className="p-3 rounded-lg border border-[#444] bg-[#18191c]">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Transfer Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">From:</span>
                <span className="text-white text-right truncate ml-2">{sourceChain.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">To:</span>
                <span className="text-white text-right truncate ml-2">{targetChain.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">NFT:</span>
                <span className="text-white text-right truncate ml-2">#{selectedTokenId}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">Receiver:</span>
                <span className="text-white text-xs text-right truncate ml-2">
                  {(() => {
                    const finalReceiver = receiverAddress || address || '';
                    return finalReceiver ? `${finalReceiver.slice(0, 6)}...${finalReceiver.slice(-4)}` : 'Not set';
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">Estimated Time:</span>
                <span className="text-white text-right truncate ml-2">2-5 minutes</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Transfer Button */}
        <Button
          onClick={handleCrossChainTransfer}
          disabled={!selectedTokenId || isTransferring || isApproving || isPending || !address || isSwitchingChain}
          className="w-full bg-[#3af73e] text-black font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSwitchingChain ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Switching Network...
            </div>
          ) : isApproving || (isPending && pendingApprovalTokenId !== null) ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Approving...
            </div>
          ) : isTransferring || (isPending && pendingApprovalTokenId === null) ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Transferring...
            </div>
          ) : address && sourceChain?.id && chainId !== sourceChain.id ? (
            `Switch to ${sourceChain.name} & Transfer`
          ) : (
            !isApproved ? 'Approve & Transfer' : 'Cross-Chain Transfer'
          )}
        </Button>
        
        {/* Connect Wallet Notice */}
        {!address && (
          <div className="text-center p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="text-sm text-yellow-400">⚠️ Connect wallet to enable transfers</div>
          </div>
        )}
                  </div>
                </div>
              </div>
              
              {/* Right Section: Latest Transaction History (Desktop only) */}
              <div className="hidden lg:block lg:w-1/2">
                <div className="w-full">
                  <div className="p-4 space-y-3 rounded-lg border border-[#444] bg-[#18191c] min-h-[600px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-300">
                        Your Cross-Chain Transaction History
                      </h3>
                      {isTrackingCctx && (
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          Tracking...
                        </div>
                      )}
                    </div>
                    
                    {/* Transaction History List */}
                    {(cctxData || cctxHistory.length > 0) ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {(cctxHistory.length > 0 ? cctxHistory : (cctxData ? [cctxData] : [])).map((transaction, index) => (
                          <div key={transaction.transactionHash || index} className={`p-3 rounded-lg border ${
                            index === 0 ? 'border-blue-500/50 bg-blue-500/5' : 'border-[#555] bg-[#1a1b1e]'
                          }`}>
                            {/* Transaction Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-400">
                                {index === 0 && 'Latest Transaction'}
                                {index > 0 && `Transaction #${index + 1}`}
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                transaction.status === 'Aborted' 
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                  : transaction.status === 'OutboundMined'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {transaction.status === 'Aborted' && '❌ '}
                                {transaction.status === 'OutboundMined' && '✅ '}
                                {transaction.status !== 'Aborted' && transaction.status !== 'OutboundMined' && '⏳ '}
                                {transaction.status}
                              </div>
                            </div>
                            
                            {/* Transaction Hash */}
                            <div className="space-y-1 mb-2">
                              <div className="text-xs text-gray-400">Transaction Hash</div>
                              <div className="font-mono text-xs text-white bg-[#2a2d30] p-2 rounded border break-all overflow-hidden">
                                {transaction.transactionHash}
                              </div>
                            </div>
                            
                            {/* Status Message */}
                            {transaction.status_message && (
                              <div className="space-y-1 mb-2">
                                <div className="text-xs text-gray-400">Message</div>
                                <div className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/30">
                                  {transaction.status_message}
                                </div>
                              </div>
                            )}
                            
                            {/* Chain Information */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <div className="space-y-1">
                                <div className="text-xs text-gray-400">From Chain</div>
                                <div className="text-xs text-white font-medium">
                                  {getChainName(transaction.sender_chain_id)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-400">To Chain</div>
                                <div className="text-xs text-white font-medium">
                                  {getChainName(transaction.receiver_chainId)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Outbound Transaction */}
                            {transaction.outbound_tx_hash && (
                              <div className="space-y-1 mb-2">
                                <div className="text-xs text-gray-400">Outbound Transaction</div>
                                <div className="font-mono text-xs text-purple-400 bg-purple-500/10 p-2 rounded border border-purple-500/30 break-all overflow-hidden">
                                  {transaction.outbound_tx_hash}
                                </div>
                              </div>
                            )}
                            
                            {/* Confirmation Status */}
                            {/* <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-400">Confirmed on Destination</div>
                              <div className={`text-xs font-medium ${
                                transaction.confirmed_on_destination ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {transaction.confirmed_on_destination ? '✅ Yes' : '❌ No'}
                              </div>
                            </div> */}
                            
                            {/* Timestamp */}
                            {transaction.blockTimestamp && (
                              <div className="pt-2 border-t border-[#444]">
                                <div className="text-xs text-gray-500">
                                  Last updated: {(() => {
                                    const date = new Date(transaction.blockTimestamp);
                                    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleTimeString();
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-4xl mb-2">🌉</div>
                        <div className="text-gray-400 text-sm">No cross-chain transactions yet</div>
                        <div className="text-gray-500 text-xs mt-2">Start a transfer to see it here</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile Transaction History */}
              <div className="lg:hidden w-full flex justify-center">
                {(cctxData || cctxHistory.length > 0) && (
                  <div className="w-full max-w-md mt-4">
                    <div className="p-4 space-y-3 rounded-lg border border-[#444] bg-[#18191c]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-300">
                          {cctxHistory.length > 1 ? 'Your Cross-Chain Transaction History' : 'Your Latest Cross-Chain Transaction'}
                        </h3>
                        {isTrackingCctx && (
                          <div className="flex items-center gap-2 text-xs text-blue-400">
                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            Tracking...
                          </div>
                        )}
                      </div>
                      
                      {/* Show only latest transaction on mobile */}
                      <div className="space-y-3">
                        {(() => {
                          const latestTransaction = cctxHistory.length > 0 ? cctxHistory[0] : cctxData;
                          if (!latestTransaction) return null;
                          
                          return (
                            <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-500/5">
                              {/* Transaction Header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-400">Latest Transaction</div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  latestTransaction.status === 'Aborted' 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                    : latestTransaction.status === 'OutboundMined'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {latestTransaction.status === 'Aborted' && '❌ '}
                                  {latestTransaction.status === 'OutboundMined' && '✅ '}
                                  {latestTransaction.status !== 'Aborted' && latestTransaction.status !== 'OutboundMined' && '⏳ '}
                                  {latestTransaction.status}
                                </div>
                              </div>
                              
                              {/* Transaction Hash */}
                              <div className="space-y-1 mb-2">
                                <div className="text-xs text-gray-400">Transaction Hash</div>
                                <div className="font-mono text-xs text-white bg-[#2a2d30] p-2 rounded border break-all overflow-hidden">
                                  {latestTransaction.transactionHash}
                                </div>
                              </div>
                              
                              {/* Status Message */}
                              {latestTransaction.status_message && (
                                <div className="space-y-1 mb-2">
                                  <div className="text-xs text-gray-400">Message</div>
                                  <div className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/30">
                                    {latestTransaction.status_message}
                                  </div>
                                </div>
                              )}
                              
                              {/* Chain Information */}
                              <div className="grid grid-cols-2 gap-3 mb-2">
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-400">From Chain</div>
                                  <div className="text-xs text-white font-medium">
                                    {getChainName(latestTransaction.sender_chain_id)}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-400">To Chain</div>
                                  <div className="text-xs text-white font-medium">
                                    {getChainName(latestTransaction.receiver_chainId)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Confirmation Status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-400">Confirmed on Destination</div>
                                <div className={`text-xs font-medium ${
                                  latestTransaction.confirmed_on_destination ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {latestTransaction.confirmed_on_destination ? '✅ Yes' : '❌ No'}
                                </div>
                              </div>
                              
                              {/* Timestamp */}
                              {latestTransaction.blockTimestamp && (
                                <div className="pt-2 border-t border-[#444]">
                                  <div className="text-xs text-gray-500">
                                    Last updated: {(() => {
                                      const date = new Date(latestTransaction.blockTimestamp);
                                      return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleTimeString();
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="m-0">
            <CrosschainHistory 
              baseContractAddress={sourceChain.id === 84532 ? (sourceChainContractAddress as string || '') : (targetChainContractAddress as string || '')}
              bscContractAddress={sourceChain.id === 97 ? (sourceChainContractAddress as string || '') : (targetChainContractAddress as string || '')}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Transaction Dialog */}
      <TransactionDialog
        isOpen={dialogState.isOpen}
        onOpenChange={onOpenChange}
        status={dialogState.status}
        hash={dialogState.hash}
        error={dialogState.error}
        title={
          pendingApprovalTokenId !== null 
            ? "Approve NFT Success" 
            : "Cross-Chain Transfer Success"
        }
        chainId={chainId}
      />
    </div>
  );
}
