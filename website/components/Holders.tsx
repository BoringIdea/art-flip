import React, { useState } from "react";
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import Pagination from '@/components/ui/pagination';
import { useCollectionHolders, CollectionHolder } from '@/src/api/hooks';
import { sliceAddress } from "@/src/utils";
import { useChainId } from "wagmi";

const PAGE_SIZE = 10;

export default function Holders({ collectionAddress }: { collectionAddress: string }) {
  const [page, setPage] = useState(1);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const chainId = useChainId();
  const { data: holders = [], pagination, isLoading } = useCollectionHolders(chainId, collectionAddress, PAGE_SIZE, page);
  const totalPages = pagination ? Math.ceil(Number(pagination.total) / PAGE_SIZE) : 1;
  const pagedData = holders;

  function formatTime(iso: string) {
    if (!iso) return '-';
    const date = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  // Get holder tier based on NFT count
  function getHolderTier(count: number) {
    if (count >= 100) return { tier: "Whale", color: "text-purple-400", bgColor: "bg-purple-400/10", icon: "🐋" };
    if (count >= 10) return { tier: "Dolphin", color: "text-blue-400", bgColor: "bg-blue-400/10", icon: "🐬" };
    if (count >= 5) return { tier: "Fish", color: "text-green-400", bgColor: "bg-green-400/10", icon: "🐟" };
    return { tier: "Shrimp", color: "text-gray-400", bgColor: "bg-gray-400/10", icon: "🦐" };
  }

  // Copy address function
  const handleCopy = async (address: string, idx: number) => {
    await navigator.clipboard.writeText(address);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  return (
    <div className="w-full px-0 sm:px-4 pt-6 pb-20">
      {/* Desktop table */}
      <div className="hidden sm:block">
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-800/50 border-0">
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-left border-0">Holder</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-center border-0">Holdings</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-center border-0">Tier</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-right border-0">First Acquired</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-right border-0">Last Acquired</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-400">Loading holders...</span>
                    </div>
                  </td>
                </tr>
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">👥</div>
                      <span className="text-gray-400">No holders found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row: CollectionHolder, idx: number) => {
                  const holderTier = getHolderTier(row.nft_count);
                  return (
                    <tr
                      key={row.owner || idx}
                      className="border-t border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 font-mono text-sm">{sliceAddress(row.owner)}</span>
                            <button
                              className="p-1.5 rounded-lg hover:bg-neutral-700 transition border border-transparent hover:border-neutral-600"
                              onClick={e => { e.stopPropagation(); handleCopy(row.owner, idx); }}
                              title="Copy address"
                            >
                              {copiedIdx === idx ? 
                                <CheckIcon className="text-green-400 w-4 h-4" /> : 
                                <CopyIcon className="text-gray-400 w-4 h-4" />
                              }
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="inline-flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">{row.nft_count}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${holderTier.bgColor} ${holderTier.color}`}>
                          <span className="text-xs">{holderTier.icon}</span>
                          {holderTier.tier}
                        </div>
                      </td>
                      <td className="text-gray-300 text-sm py-4 px-4 text-right">
                        {formatTime(row.firstAcquiredAt)}
                      </td>
                      <td className="text-gray-300 text-sm py-4 px-4 text-right">
                        {formatTime(row.lastAcquiredAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3 px-2">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg py-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading holders...</span>
            </div>
          </div>
        ) : pagedData.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg py-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">👥</div>
              <span className="text-gray-400">No holders found</span>
            </div>
          </div>
        ) : (
          pagedData.map((row: CollectionHolder, idx: number) => {
            const holderTier = getHolderTier(row.nft_count);
            return (
              <div key={row.owner || idx} className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${holderTier.bgColor} ${holderTier.color}`}>
                      <span className="text-xs">{holderTier.icon}</span>
                      {holderTier.tier}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">{formatTime(row.lastAcquiredAt)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-400 mb-1">Holder</div>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-300 font-mono text-sm">{sliceAddress(row.owner)}</div>
                      <button
                        className="p-1.5 rounded-lg hover:bg-neutral-700 transition border border-transparent hover:border-neutral-600"
                        onClick={() => handleCopy(row.owner, idx)}
                        title="Copy address"
                      >
                        {copiedIdx === idx ? 
                          <CheckIcon className="text-green-400 w-4 h-4" /> : 
                          <CopyIcon className="text-gray-400 w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-400 mb-1">Holdings</div>
                    <div className="text-base font-semibold text-white">{row.nft_count}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <div>First: {formatTime(row.firstAcquiredAt)}</div>
                  <div>Last: {formatTime(row.lastAcquiredAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          totalPages={totalPages}
          offset={page - 1}
          onPageChange={p => setPage(p)}
        />
      </div>
    </div>
  );
}