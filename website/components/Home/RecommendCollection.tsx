import { Collection } from '@/src/api/types';
import { getChainSymbol, sliceAddress } from '@/src/utils';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';

interface RecommendCollectionProps {
  collections: Collection[];
}

export const RecommendCollection = ({ collections }: RecommendCollectionProps) => {
  const chainId = useChainId();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | undefined>(collections[0]);
  const handleViewCollection = () => {
    router.push(`/collection/${collection?.address}`);
  };

  useEffect(() => {
    setCollection(collections[0]);
  }, [collections]);

  return (
    <div className="p-1 sm:p-4 md:p-6 flex justify-center items-center relative -z-0">
      <div className="relative rounded-xl sm:rounded-3xl shadow-lg w-full h-auto sm:h-[320px] md:h-[420px] overflow-hidden group">
        {/* Background image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/20 z-10" />
        <img
          src="/Drug-banner.png"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={collection?.name || 'Featured Collection'}
        />

        {/* Content area */}
        <div className="relative h-full flex flex-col z-20">
          {/* Top white area */}
          <div className="flex-1" />

          {/* Information card */}
          <div className="bg-gradient-to-t from-black/80 to-transparent p-1 sm:p-6 md:p-8 pb-0">
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 pl-1 sm:pl-4">
              {/* Top part: name + data */}
              <div className="w-full max-w-xl">
                {/* Collection Name */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{collection?.name}</span>
                    {/* Blue certification icon */}
                    {/* <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="#3B82F6">
                      <circle cx="12" cy="12" r="12"/>
                      <path d="M10.5 14.5l-2-2 1-1 1 1 3-3 1 1-4 4z" fill="#fff"/>
                    </svg> */}
                  </div>
                  {/* <div className="text-white/70 text-sm sm:text-base mt-1">{collection?.creator}</div> */}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div
                    className="
                      px-2 sm:px-4 py-2
                      rounded-xl border border-white/20
                      bg-white/10
                      flex flex-row flex-wrap sm:flex-nowrap items-start gap-2 sm:gap-x-4
                      w-full sm:w-max
                      shadow
                      backdrop-blur-md
                      "
                    style={{WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)'}}
                  >
                    {/* Floor Price */}
                    <div className="flex flex-col items-start px-1 w-[calc(50%-4px)] sm:w-auto">
                      <span className="text-xs text-white/60 tracking-widest mb-0.5 whitespace-nowrap">FLOOR PRICE</span>
                      <span className="text-base font-semibold text-white whitespace-nowrap">
                        {collection?.floor_price
                          ? `${Number(ethers.formatEther(collection.floor_price)).toFixed(4)} ${getChainSymbol(chainId)}`
                          : '0'}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-7 bg-white/15 mx-1"></div>
                    {/* Items */}
                    <div className="flex flex-col items-start px-1 w-[calc(50%-4px)] sm:w-auto">
                      <span className="text-xs text-white/60 tracking-widest mb-0.5 whitespace-nowrap">VOLUME</span>
                      <span className="text-base font-semibold text-white whitespace-nowrap">
                        {collection?.total_volume ? `${Number(ethers.formatEther(BigInt(collection.total_volume.toString()))).toFixed(4).replace(/\.?0+$/, '')} ${getChainSymbol(chainId)}` : '0'}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-7 bg-white/15 mx-1"></div>
                    {/* Total Volume */}
                    <div className="flex flex-col items-start px-1 w-[calc(50%-4px)] sm:w-auto">
                      <span className="text-xs text-white/60 tracking-widest mb-0.5 whitespace-nowrap">OWNERS</span>
                      <span className="text-base font-semibold text-white whitespace-nowrap">
                        {collection?.owners  || '0'}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-7 bg-white/15 mx-1"></div>
                    {/* Listed */}
                    <div className="flex flex-col items-start px-1 w-[calc(50%-4px)] sm:w-auto">
                      <span className="text-xs text-white/60 tracking-widest mb-0.5 whitespace-nowrap">MINTED</span>
                      <span className="text-base font-semibold text-white whitespace-nowrap">
                        {collection?.total_supply || '0'} / {collection?.max_supply || '0'}
                      </span>
                    </div>
                  </div>
                  <button
                    className="
                      w-full sm:w-auto
                      bg-white/10 border border-white/20
                      text-white
                      px-2 sm:px-6 py-2
                      rounded-lg font-medium
                      transition-all duration-300
                      flex items-center justify-center gap-2
                      shadow-md hover:bg-white/20
                      backdrop-blur-md
                      h-[52px]
                    "
                    style={{WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)'}}
                    onClick={handleViewCollection}
                  >
                    <span>View Collection</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-5 gap-4 p-4">
              {/* TODO: Since there are not enough recommended collections, so temporarily not displayed */}
              {/* {collections.slice(0, 5).map(c => (
                <img
                  onClick={() => setCollection(c)}
                  key={c.address}
                  src={'/flip-banner.svg'}
                  alt={c.name}
                  className={`w-full border ${c.address === collection?.address
                    ? 'border-[#3AF73E] border-2'
                    : 'border-[#fff] border'
                    } h-8 sm:h-32 object-cover cursor-pointer rounded-lg hover:scale-101 transition-transform duration-300`
                  }
                />
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};