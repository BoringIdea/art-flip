import React, { useState } from "react";
import * as Popover from '@radix-ui/react-popover';
import { MixerHorizontalIcon, CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import Pagination from '@/components/ui/pagination';
import { useCollectionTxs, CollectionTx } from '@/src/api/hooks';
import { sliceAddress, formatNumberWithMaxDecimals, getChainSymbol } from "@/src/utils";
import { useChainId } from "wagmi";

const actionOptions = ["All", "Sell", "Buy", "Mint"];
const PAGE_SIZE = 10;

// Action type mapping with styling
function getActionDisplay(type: number) {
  switch (type) {
    case 1: 
      return { text: "Mint", color: "text-blue-400", bgColor: "bg-blue-400/10", icon: "🎨" };
    case 2: 
      return { text: "Buy", color: "text-green-400", bgColor: "bg-green-400/10", icon: "🛒" };
    case 3: 
      return { text: "Sell", color: "text-red-400", bgColor: "bg-red-400/10", icon: "💰" };
    case 4: 
      return { text: "Bulk Buy", color: "text-green-400", bgColor: "bg-green-400/10", icon: "📦" };
    case 5: 
      return { text: "Bulk Sell", color: "text-red-400", bgColor: "bg-red-400/10", icon: "📦" };
    case 6: 
      return { text: "Bulk Mint", color: "text-blue-400", bgColor: "bg-blue-400/10", icon: "🎨" };
    default: 
      return { text: "Other", color: "text-gray-400", bgColor: "bg-gray-400/10", icon: "❓" };
  }
}

// Enhanced price formatting
function formatPrice(price: string, chainId: number) {
  if (!price) return '-';
  const ethValue = (Number(price) / 1e18).toString();
  const formatted = formatNumberWithMaxDecimals(ethValue);
  const symbol = getChainSymbol(chainId);
  return `${formatted} ${symbol}`;
}

// Format time
function formatTime(iso: string) {
  if (!iso) return '-';
  const date = new Date(Number(iso) * 1000);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export default function Activity({ collectionAddress }: { collectionAddress: string }) {
  const chainId = useChainId();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [checkedActions, setCheckedActions] = useState<string[]>(["All"]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Get backend data
  const { data: txs = [], pagination, isLoading } = useCollectionTxs(chainId, collectionAddress, PAGE_SIZE, page);

  // Filter
  let filteredData = txs;
  if (filter === "multi" && checkedActions.length > 0) {
    filteredData = txs.filter((d: CollectionTx) => checkedActions.includes(getActionDisplay(d.txType).text));
  } else if (filter !== "All" && filter !== "multi") {
    filteredData = txs.filter((d: CollectionTx) => getActionDisplay(d.txType).text === filter);
  }

  // Paged data (backend has already paged, here only for display)
  const totalPages = pagination ? Math.ceil(Number(pagination.total) / PAGE_SIZE) : 1;
  const pagedData = filteredData; // Directly use the current page data returned by the interface

  const handleCheck = (action: string) => {
    if (action === "All") {
      setCheckedActions(["All"]);
    } else {
      setCheckedActions(prev => {
        const newChecked = prev.includes(action)
          ? prev.filter(a => a !== action)
          : [...prev.filter(a => a !== "All"), action];
        return newChecked.length === 0 ? ["All"] : newChecked;
      });
    }
  };

  const handleConfirm = () => {
    if (checkedActions.includes("All") || checkedActions.length === 0) {
      setFilter("All");
    } else if (checkedActions.length === 1) {
      setFilter(checkedActions[0]);
    } else {
      setFilter("multi");
    }
    setPopoverOpen(false);
    setPage(1); 
  };

  const handleReset = () => {
    setCheckedActions(["All"]);
    setFilter("All");
    setPopoverOpen(false);
    setPage(1);
  };

  // Copy address
  const handleCopy = async (address: string, idx: number) => {
    await navigator.clipboard.writeText(address);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  return (
    <div className="w-full px-0 sm:px-4 pt-6 pb-20">
      {/* Mobile filter header */}
      <div className="sm:hidden flex items-center justify-between mb-3 px-2">
        <div className="text-gray-300 font-medium">Activity</div>
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              className={`p-1.5 rounded-lg hover:bg-neutral-700 transition border ${filter !== "All" ? "text-green-400 border-green-400/30 bg-green-400/5" : "text-gray-400 border-transparent"}`}
              aria-label="Filter actions"
            >
              <MixerHorizontalIcon width={16} height={16} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content sideOffset={8} align="end" className="z-50 bg-neutral-900 rounded-xl shadow-2xl p-5 w-64 border border-neutral-800">
              <div className="mb-4 text-lg font-semibold text-white">Filter Actions</div>
              <div className="flex flex-col gap-3 mb-5">
                {actionOptions.map(option => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer select-none text-gray-200 px-3 py-2 rounded-lg hover:bg-neutral-800 transition">
                    <input
                      type="checkbox"
                      checked={checkedActions.includes(option)}
                      onChange={() => handleCheck(option)}
                      className="accent-green-500 w-4 h-4 rounded border-gray-600 bg-gray-800"
                    />
                    <span className="font-medium">{option}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="text-gray-400 px-3 py-2 rounded-lg hover:text-white hover:bg-neutral-800 text-sm font-medium transition"
                  onClick={handleReset}
                >Reset</button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold transition shadow-lg"
                  onClick={handleConfirm}
                >Apply</button>
              </div>
              <Popover.Arrow className="fill-neutral-900" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-800/50 border-0">
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-left border-0">
                  <div className="flex items-center gap-2">
                    Action
                    <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <Popover.Trigger asChild>
                        <button
                          className={`p-1.5 rounded-lg hover:bg-neutral-700 transition border ${filter !== "All" ? "text-green-400 border-green-400/30 bg-green-400/5" : "text-gray-400 border-transparent"}`}
                          aria-label="Filter actions"
                        >
                          <MixerHorizontalIcon width={16} height={16} />
                        </button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content sideOffset={8} align="end" className="z-50 bg-neutral-900 rounded-xl shadow-2xl p-5 w-64 border border-neutral-800">
                          <div className="mb-4 text-lg font-semibold text-white">Filter Actions</div>
                          <div className="flex flex-col gap-3 mb-5">
                            {actionOptions.map(option => (
                              <label key={option} className="flex items-center gap-3 cursor-pointer select-none text-gray-200 px-3 py-2 rounded-lg hover:bg-neutral-800 transition">
                                <input
                                  type="checkbox"
                                  checked={checkedActions.includes(option)}
                                  onChange={() => handleCheck(option)}
                                  className="accent-green-500 w-4 h-4 rounded border-gray-600 bg-gray-800"
                                />
                                <span className="font-medium">{option}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              className="text-gray-400 px-3 py-2 rounded-lg hover:text-white hover:bg-neutral-800 text-sm font-medium transition"
                              onClick={handleReset}
                            >Reset</button>
                            <button
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold transition shadow-lg"
                              onClick={handleConfirm}
                            >Apply</button>
                          </div>
                          <Popover.Arrow className="fill-neutral-900" />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                </th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-center border-0">Items</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-right border-0">Price</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-center border-0">Wallet</th>
                <th className="text-gray-300 font-medium text-sm sm:text-base py-4 px-4 text-right border-0">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-400">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-4xl">📊</div>
                      <span className="text-gray-400">No transactions found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row: CollectionTx, idx: number) => {
                  const actionDisplay = getActionDisplay(row.txType);
                  return (
                    <tr
                      key={row.txHash || idx}
                      className="border-t border-neutral-800 hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${actionDisplay.bgColor} ${actionDisplay.color}`}>
                          <span className="text-xs">{actionDisplay.icon}</span>
                          {actionDisplay.text}
                        </div>
                      </td>
                      <td className="text-gray-300 text-sm sm:text-base py-4 px-4 text-center font-mono">
                        <span className="bg-neutral-800 px-2 py-1 rounded text-xs font-medium">
                          {Array.isArray(row.tokenIds) ? row.tokenIds.join(', ') : row.tokenIds}
                        </span>
                      </td>
                      <td className="text-white text-sm sm:text-base py-4 px-4 text-right font-semibold">
                        {formatPrice(row.price, chainId)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-300 font-mono text-sm">{sliceAddress(row.sender)}</span>
                          <button
                            className="p-1.5 rounded-lg hover:bg-neutral-700 transition border border-transparent hover:border-neutral-600"
                            onClick={e => { e.stopPropagation(); handleCopy(row.sender, idx); }}
                            title="Copy address"
                          >
                            {copiedIdx === idx ? 
                              <CheckIcon className="text-green-400 w-4 h-4" /> : 
                              <CopyIcon className="text-gray-400 w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="text-gray-300 text-sm py-4 px-4 text-right">
                        {formatTime(row.createdAt.toString())}
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
              <span className="text-gray-400">Loading transactions...</span>
            </div>
          </div>
        ) : pagedData.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg py-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">📊</div>
              <span className="text-gray-400">No transactions found</span>
            </div>
          </div>
        ) : (
          pagedData.map((row: CollectionTx, idx: number) => {
            const actionDisplay = getActionDisplay(row.txType);
            return (
              <div key={row.txHash || idx} className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${actionDisplay.bgColor} ${actionDisplay.color}`}>
                    <span className="text-xs">{actionDisplay.icon}</span>
                    {actionDisplay.text}
                  </div>
                  <div className="text-gray-400 text-xs">{formatTime(row.createdAt.toString())}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-400 mb-1">Items</div>
                    <div className="text-sm text-gray-200 font-mono truncate">
                      {Array.isArray(row.tokenIds) ? row.tokenIds.join(', ') : row.tokenIds}
                    </div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-400 mb-1">Price</div>
                    <div className="text-base font-semibold text-white">{formatPrice(row.price, chainId)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-gray-300 font-mono text-sm">{sliceAddress(row.sender)}</div>
                  <button
                    className="p-1.5 rounded-lg hover:bg-neutral-700 transition border border-transparent hover:border-neutral-600"
                    onClick={() => handleCopy(row.sender, idx)}
                    title="Copy address"
                  >
                    {copiedIdx === idx ? 
                      <CheckIcon className="text-green-400 w-4 h-4" /> : 
                      <CopyIcon className="text-gray-400 w-4 h-4" />
                    }
                  </button>
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