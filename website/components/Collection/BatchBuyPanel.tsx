'use client'
import React from "react"
import * as Slider from '@radix-ui/react-slider'
import { Button } from "@/components/ui/button"
import { getBatchBuyPrice } from "@/lib/price"
import { formatNumberWithMaxDecimalsAndRounding } from "@/src/utils"

interface BatchBuyPanelProps {
  priceSymbol: string
  maxSupply: string
  currentSupply: string
  initialPrice: string
  creatorFee: string
  maxSweep: number
  batchCount: number
  selectedTokens: number[]
  onCountChange: (count: number) => void
  onBatchBuy: () => void
}

export function BatchBuyPanel({
  priceSymbol,
  maxSupply,
  currentSupply,
  initialPrice,
  creatorFee,
  maxSweep,
  batchCount,
  selectedTokens,
  onCountChange,
  onBatchBuy
}: BatchBuyPanelProps) {
  return (
    <div className="fixed bottom-[53px] left-0 right-0 bg-[#141414] backdrop-blur-md p-2 sm:p-4 shadow-xl border-t border-gray-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-10 z-50">
      {/* Slider with count display */}
      <div className="flex flex-col sm:flex-row items-center border border-[#444] pl-2 sm:pl-4 rounded-[6px] w-full sm:w-auto gap-1 sm:gap-4">
        <div className="py-1 sm:py-[14px] text-xs sm:text-base">Sweep</div>
        <Slider.Root
          className="relative flex items-center select-none touch-none flex-1 h-5 py-1 sm:py-[14px] min-w-0 w-full sm:min-w-[500px] sm:w-auto mx-0 sm:mx-4"
          value={[batchCount]}
          min={0}
          max={maxSweep}
          step={1}
          onValueChange={vals => onCountChange(vals[0])}
        >
          <Slider.Track className="bg-gray-700 relative flex-1 h-2 rounded-full">
            <Slider.Range className="absolute bg-[#3AF73E] h-full rounded-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 sm:w-5 sm:h-5 bg-[#3AF73E] rounded-full shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50" />
        </Slider.Root>
        <div className="hidden sm:block h-8 sm:h-[54px] w-px bg-[#444] mx-2 sm:mx-0"></div>
        <span className="text-xs sm:text-sm py-1 sm:py-[14px] font-medium w-10 sm:w-16 text-center text-white">
          {batchCount}
        </span>
      </div>
      {/* Batch buy button */}
      <Button
        onClick={onBatchBuy}
        disabled={selectedTokens.length === 0}
        className="w-full sm:w-auto mt-1 sm:mt-0 bg-[#3AF73E] hover:bg-emerald-600 text-black text-xs sm:text-base"
      >
        Buy {batchCount} Items ({formatNumberWithMaxDecimalsAndRounding(Number(getBatchBuyPrice(maxSupply, currentSupply, initialPrice, batchCount, creatorFee)) / 1e18, 2)} {priceSymbol})
      </Button>
    </div>
  )
}