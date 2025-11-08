import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useRouter } from 'next/router';
import { useUserProfile } from '@/src/api/hooks';
import { sliceAddress, getChainSymbol } from '@/src/utils';
import { ethers } from 'ethers';

export default function UserPage() {
  const { address } = useAccount();
  const router = useRouter();
  const chainId = useChainId();
  const { totalCollections, totalNFTs, collections, isLoading } = useUserProfile(chainId, address as string);

  const handleCardClick = (collectionAddress: string) => {
    router.push(`/collection/${collectionAddress}`);
  };

  const formatFloorPrice = (price: string) => {
    if (!price || price === '0') return '0';
    return `${Number(ethers.formatEther(BigInt(price))).toFixed(4).replace(/\.?0+$/, '')} ${getChainSymbol(chainId)}`;
  }

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 pb-8 sm:pb-16 pt-8 sm:pt-20">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Portfolio</h1>
          <p className="text-gray-400 text-lg">Manage your NFT collections and track your holdings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg px-6 py-6 hover:border-neutral-700 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">📚</div>
              <div className="text-gray-300 font-medium">Collections</div>
            </div>
            <div className="text-3xl font-bold text-white">{totalCollections || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Total collections you own</div>
          </div>
          
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg px-6 py-6 hover:border-neutral-700 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🖼️</div>
              <div className="text-gray-300 font-medium">NFTs</div>
            </div>
            <div className="text-3xl font-bold text-white">{totalNFTs || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Total NFTs in your wallet</div>
          </div>
        </div>

        {/* Collections Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Collections</h2>
        </div>

        {/* Collections List */}
        {isLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading your collections...</span>
            </div>
          </div>
        ) : !collections || collections.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">📦</div>
              <span className="text-gray-400">No collections found</span>
              <p className="text-gray-500 text-sm">Start collecting NFTs to see them here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collections.map((col) => (
              <div
                key={col.address}
                onClick={() => handleCardClick(col.address)}
                className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg px-6 py-6 text-gray-200 cursor-pointer hover:border-neutral-700 hover:bg-neutral-800/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="font-bold text-xl mb-2 text-white group-hover:text-green-400 transition-colors">
                      {col.name}
                    </div>
                    <div className="text-sm text-gray-400 font-mono bg-neutral-800 px-3 py-1.5 rounded-lg inline-block">
                      {sliceAddress(col.address)}
                    </div>
                  </div>
                  <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-800/50 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-400 mb-1">Holding NFTs</div>
                    <div className="text-xl font-bold text-white">{col.nftCount}</div>
                  </div>
                  
                  <div className="bg-neutral-800/50 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-400 mb-1">Floor Price</div>
                    <div className="text-xl font-bold text-white">{formatFloorPrice(col.floorPrice)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
