"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Line } from 'react-chartjs-2';

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
import { Collection } from "@/src/api/types";
import { getChainSymbol, PrimaryColor } from "@/src/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  collection: {
    max_supply?: number;
    initial_price?: string;
    current_supply?: number;
    floor_price?: string;
  };
  chainId: number;
}

export default function PriceChart({ collection, chainId }: PriceChartProps) {
  const [priceChartData, setPriceChartData] = useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (!collection ||
      collection.max_supply === undefined ||
      collection.initial_price === undefined) {
      return;
    }

    const points = 50;
    const labels: string[] = [];
    const prices: string[] = [];

    for (let i = 0; i <= points; i++) {
      const supply = Math.floor((Number(collection.max_supply) * i) / points);
      labels.push(supply.toString());

      let price;
      if (supply === 0) {
        price = BigInt(collection.initial_price);
      } else {
        const sqrt1 = Math.sqrt(100 * supply / Number(collection.max_supply));
        const sqrt2 = Math.sqrt(10000 * supply * supply / (Number(collection.max_supply) * Number(collection.max_supply)));
        const multiplier = Math.floor(sqrt1 * sqrt2);
        price = BigInt(collection.initial_price) +
          (BigInt(collection.initial_price) * BigInt(2) * BigInt(multiplier));
      }
      prices.push(ethers.formatEther(price.toString()));
    }

    setPriceChartData({
      labels,
      datasets: [
        {
          label: 'Mint Price',
          data: prices,
          borderColor: '#fff',
          tension: 0.1,
          borderWidth: 2,
          fill: false,
          pointRadius: 1,
          pointBorderWidth: 1,
        },
        {
          label: 'Current Position',
          data: Array(points + 1).fill(null).map((_, i) => {
            if (collection.current_supply === undefined || collection.floor_price === undefined) {
              return null;
            }
            const supplyAtPoint = (Number(collection.max_supply) * i) / points;
            const currentSupplyPoint = Math.floor((Number(collection.current_supply) * points) / Number(collection.max_supply)) * Number(collection.max_supply) / points;

            return Math.abs(currentSupplyPoint - supplyAtPoint) < 0.1
              ? Number(ethers.formatEther(collection.floor_price.toString()))
              : null;
          }),
          pointBackgroundColor: '#fff',
          pointRadius: 6,
          showLine: false,
          pointStyle: 'circle',
          borderWidth: 2,
          borderColor: PrimaryColor,
        }
      ]
    });
  }, [collection]);

  return (
    <div className="w-full mt-4 h-[260px] sm:h-[500px]">
      <h2 className="text-white text-base sm:text-xl font-medium mb-2 sm:mb-4 text-center w-full">Mint Price Curve</h2>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex flex-row flex-wrap items-center justify-center w-full gap-2 sm:gap-6 mb-2 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-1 bg-white"></div>
            <span className="text-[rgba(255,255,255,0.65)] text-xs sm:text-sm">Mint Price</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-1 bg-[#3af73e]"></div>
            <span className="text-[rgba(255,255,255,0.65)] text-xs sm:text-sm">Current Position</span>
          </div>
        </div>
      </div>
      <Line
        data={priceChartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 0.96,
          plugins: {
            legend: {
              display: false
            },
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              min: 0,
              title: {
                display: true,
                text: `Price (${getChainSymbol(chainId)})`,
                color: 'white',
              },
              ticks: {
                callback: function (value) {
                  return Number(value).toFixed(2);
                }
              },
              grid: {
                display: true,
                drawOnChartArea: true,
                drawTicks: true,
                color: 'rgba(76, 175, 80, 0.2)'
              }
            },
            x: {
              title: {
                display: true,
                color: 'white',
                text: 'Current Supply'
              }
            }
          }
        }}
      />
    </div>
  );
}