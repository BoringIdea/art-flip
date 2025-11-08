"use client";
import { useEffect, useMemo, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchBlockNumber,
  useChainId
} from "wagmi";
import { ethers } from "ethers";
import { Button } from "./ui/button";
import { Progress } from "@/components/ui/progress"
import { PRICE_ABI, TRADE_ABI, getTradeContractAddress } from "@/src/contract";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { SupportedChainId } from "@/src/alchemy";
import { Collection } from "@/src/api/types";
import TransactionDialog from "@/components/shared/TransactionDialog"
import PriceChart from "@/components/Collection/PriceChart";
import { useTransactionDialog } from "@/src/hooks/useTransactionDialog";
import { getBatchBuyPrice } from "@/lib/price";
import { getChainSymbol, formatNumberWithMaxDecimalsAndRounding } from "@/src/utils";
import { fetchCollectionImage } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MintProps {
  contractAddress: string;
  collection: Collection | undefined;
}

export default function Mint({ contractAddress, collection }: MintProps) {
  const chainId = useChainId();

  let alchemy: any;
  // if (chainId !== monadTestnet.id) {
  //   alchemy = getAlchemy(chainId as SupportedChainId);
  // }

  const [mintAmount, setMintAmount] = useState<number>(1);
  const { data: hash, writeContract, isError: isWriteContractError, error: writeContractError, isPending } = useWriteContract();

  const [collectionImage, setCollectionImage] = useState<string | null>(null);
  useEffect(() => {
    if (collection) {
      fetchCollectionImage(collection).then((image) => {
        setCollectionImage(image);
      }).catch((error) => {
        console.error('Error fetching collection image:', error);
        setCollectionImage(null);
      });
    }
  }, [collection]);

  // Read contract mintPrice
  const { data: mintPrice, refetch: refetchMintPrice } = useReadContract({
    // @ts-ignore
    address: collection?.price_contract,
    abi: PRICE_ABI,
    functionName: 'getBuyPriceAfterFee',
    args: [
      collection?.address,
    ],
    scopeKey: `mintPrice:${collection?.address}`,
    query: {
      enabled: !!collection?.price_contract && !!collection?.address,
      staleTime: 30000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: 'always',
    }
  });

  const fallbackMintPrice = useMemo(() => {
    if (!collection?.max_supply || !collection?.current_supply || !collection?.initial_price) return null;
    return getBatchBuyPrice(
      collection?.max_supply?.toString() || '0',
      collection?.current_supply?.toString() || '0',
      collection?.initial_price?.toString() || '0',
      1,
      collection?.creator_fee?.toString() || '0'
    );
  }, [collection?.max_supply, collection?.current_supply, collection?.initial_price, collection?.creator_fee]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [progress, setProgress] = useState(0);

  // Calculate mint progress
  useEffect(() => {
    if (collection?.current_supply !== undefined) {
      const supply = Number(collection?.current_supply);
      if (!isNaN(supply)) {
        const newProgress = (supply / 10000) * 100;
        setProgress(newProgress);
      }
    }
  }, [collection]);

  // Mint NFT function
  async function mint() {
    console.log('mintPrice', mintPrice);
    if (mintPrice && mintAmount == 1) {
      writeContract({
        // @ts-ignore
        address: getTradeContractAddress(chainId as SupportedChainId),
        abi: TRADE_ABI,
        functionName: 'mint',
        args: [
          contractAddress,
        ],
        value: BigInt(mintPrice.toString()),
      });
    } else if (mintAmount > 1) {
      const mintCost = getBatchBuyPrice(
        collection?.max_supply?.toString() || '0',
        collection?.current_supply?.toString() || '0',
        collection?.initial_price?.toString() || '0',
        mintAmount,
        collection?.creator_fee?.toString() || '0'
      )
      console.log('bulkMint cost', mintCost);
      writeContract({
        // @ts-ignore
        address: getTradeContractAddress(chainId as SupportedChainId),
        abi: TRADE_ABI,
        functionName: 'bulkMint',
        args: [
          contractAddress,
          mintAmount,
        ],
        value: mintCost,
      })
    }
  }

  const { dialogState, onOpenChange } = useTransactionDialog({
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isWriteContractError,
    writeContractError,
  });


  // Add a state to handle hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row w-full">
      {/* Left Section: Image + Mint Controls */}
      <div className="flex flex-col lg:w-1/2 p-4 sm:p-8 pb-20 sm:pb-24">
        {/* Collection Image */}
        <div className="flex justify-center mb-4 lg:mb-6">
          {collectionImage && (
            <div className="w-[250px] h-[250px] lg:w-[320px] lg:h-[320px] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={collectionImage}
                alt={collection?.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Mint Controls */}
        <div className="bg-neutral-900 rounded-xl p-6 flex flex-col gap-4 shadow-lg border border-neutral-800">
          {/* Mint Price & Fee */}
          <div>
            <div className="flex items-end gap-2">
              <span className="text-lg font-semibold text-white">Mint Price:</span>
              <span className="text-2xl font-bold text-green-400">{formatNumberWithMaxDecimalsAndRounding(ethers.formatEther((mintPrice ?? fallbackMintPrice ?? 0).toString()))} {getChainSymbol(chainId)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              (Include Fee: {collection?.creator_fee ? (Number(ethers.formatEther(collection?.creator_fee.toString())) * 100).toFixed(2) : '0'}%)
            </div>
          </div>

          {/* Mint 按钮 */}
          <button className="w-full bg-green-400 hover:bg-green-300 text-black font-bold py-3 rounded-lg text-lg transition" onClick={() => mint()}>
            Mint
          </button>

          {/* 数量选择 & 预计花费 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center bg-neutral-800 rounded-lg px-2 py-1">
                <button className="px-2 text-xl" onClick={() => setMintAmount(prev => Math.max(1, prev - 1))}>-</button>
                <span className="mx-2 text-lg">{mintAmount}</span>
                <button className="px-2 text-xl" onClick={() => setMintAmount(prev => Math.min(20, prev + 1))}>+</button>
              </div>
              <div className="bg-neutral-800/50 rounded-lg px-4 py-2 w-full sm:w-auto">
                <div className="text-sm text-gray-300">
                  Expected Cost: <span className="font-semibold text-green-400">
                    {mintAmount > 1 ?
                      formatNumberWithMaxDecimalsAndRounding(Number(getBatchBuyPrice(
                        collection?.max_supply?.toString() || '0',
                        collection?.current_supply?.toString() || '0',
                        collection?.initial_price?.toString() || '0',
                        mintAmount,
                        collection?.creator_fee?.toString() || '0'
                      )) / 1e18, 2) :
                      formatNumberWithMaxDecimalsAndRounding(Number((mintPrice ?? fallbackMintPrice ?? 0).toString()) / 1e18, 2)
                    }
                  </span> {getChainSymbol(chainId)}
                </div>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={mintAmount}
              onChange={(e) => setMintAmount(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-400"
            />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress 
            value={progress} 
            className="w-full h-3 bg-neutral-800" 
            indicatorClassName="bg-green-400"
          />
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Minted: {collection?.total_supply?.toString()} / {collection?.max_supply?.toString()}
            <span className="ml-2 text-gray-400">
              (
              {collection?.max_supply && Number(collection?.max_supply) > 0
                ? (
                    (Number(collection?.total_supply || 0) / Number(collection?.max_supply)) * 100
                  ).toFixed(2).replace(/\.?0+$/, "")
                : "0"
              }
              %
              )
            </span>
          </p>
        </div>
      </div>

      {/* Right Section: Bonding Curve Chart (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 border-l border-[rgba(255,255,255,0.2)] p-4 sm:p-8 pb-20 sm:pb-24">
        <div className="w-full">
          <PriceChart collection={{
            max_supply: collection?.max_supply,
            initial_price: collection?.initial_price,
            current_supply: collection?.current_supply,
            floor_price: collection?.floor_price,
          }} chainId={chainId} />
        </div>
      </div>

      {/* Mobile Chart Section */}
      <div className="lg:hidden">
        <div className="my-6 sm:my-8 h-px bg-white/30"></div>
        <div className="p-4 sm:p-8 pb-32 sm:pb-40">
          <PriceChart collection={{
            max_supply: collection?.max_supply,
            initial_price: collection?.initial_price,
            current_supply: collection?.current_supply,
            floor_price: collection?.floor_price,
          }} chainId={chainId} />
        </div>
      </div>

      <TransactionDialog
        isOpen={dialogState.isOpen}
        onOpenChange={onOpenChange}
        status={dialogState.status}
        hash={dialogState.hash}
        error={dialogState.error}
        title="Mint NFT success"
        chainId={chainId}
      />
    </div>
  );
}
