import { Collection } from "@/src/api"
import { getChainSymbol } from "@/src/utils"
import { formatEther } from "ethers"
import { useChainId } from "wagmi"
import Image from "next/image"
import { FaGlobe, FaTwitter, FaDiscord, FaCopy, FaInfoCircle } from 'react-icons/fa'
import { useEffect, useState } from "react"
import { Toast } from "@/components/ui/toast"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { fetchCollectionImage } from "@/lib/utils"

export default function CollectionInfo({ collection }: { collection?: Collection }) {

  const chainId = useChainId();
  const [showToast, setShowToast] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
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

  const calculateListedPercentage = () => {
    if (!collection || collection.current_supply === 0) return "0%"
    const percentage = (1 - (collection.current_supply / collection.total_supply)) * 100
    return `${percentage.toFixed(0)}%`
  }

  const calculateListedCount = () => {
    if (!collection || collection.current_supply === 0) return "0"
    return (collection.total_supply - collection.current_supply).toString()
  }

  // If collection data is not loaded, show loading state
  if (!collection) {
    return (
      <div className="text-white p-4 rounded-lg border border-gray-800 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 animate-pulse"></div>
            <div className="flex flex-col items-center md:items-start">
              <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="flex gap-2 mt-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 text-sm w-full md:w-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white p-4 rounded-lg border border-gray-800 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-4 mb-4 md:mb-0">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={collectionImage || '/flip.svg'}
              alt={collection?.name}
              className="object-cover w-full h-full"
              width={64}
              height={64}
            />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{collection.name}</h1>
            </div>
            <div className="flex gap-2 mt-1">
              <div className="relative">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(collection.address);
                    setShowToast(true);
                  }}
                  className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
                <Toast
                  message="Address copied"
                  isVisible={showToast}
                  onClose={() => setShowToast(false)}
                />
              </div>
              {collection?.meta_data?.website ? (
                <a href={collection.meta_data.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                  <FaGlobe className="w-4 h-4" />
                </a>
              ) : (
                <div className="text-gray-400 flex items-center justify-center">
                  <FaGlobe className="w-4 h-4" />
                </div>
              )}
              {collection?.meta_data?.twitter ? (
                <a href={collection.meta_data.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                  <FaTwitter className="w-4 h-4" />
                </a>
              ) : (
                <div className="text-gray-400 flex items-center justify-center">
                  <FaTwitter className="w-4 h-4" />
                </div>
              )}
              {collection?.meta_data?.discord ? (
                <a href={collection.meta_data.discord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                  <FaDiscord className="w-4 h-4" />
                </a>
              ) : (
                <div className="text-gray-400 flex items-center justify-center">
                  <FaDiscord className="w-4 h-4" />
                </div>
              )}
              <button
                onClick={() => setShowInfoDialog(true)}
                className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              >
                <FaInfoCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 text-sm w-full md:w-auto">
        <StatItem label="Floor Price" value={`${Number(formatEther(collection?.floor_price?.toString() || '0')).toFixed(4)} ${getChainSymbol(chainId)}`} />
          <StatItem label="Creator Fee" value={`${(Number(formatEther(collection?.creator_fee?.toString() || '0')) * 100).toFixed(2)}%`} />
          <StatItem label="1D Volume" value={`${Number(formatEther(BigInt(collection?.volume_1d?.toString() || '0'))).toFixed(2)} ${getChainSymbol(chainId)}`} />
          <StatItem label="All Volume" value={`${Number(formatEther(BigInt(collection?.total_volume?.toString() || '0'))).toFixed(2)} ${getChainSymbol(chainId)}`} />
          <StatItem label="1D Sales" value={`${collection?.sales_1d || 0}`} />
          <StatItem label="Owners" value={`${collection.owners}`} />
          <StatItem label="Listed" value={`${calculateListedCount()} (${calculateListedPercentage()})`} />
          <StatItem label="Minted" value={`${collection.total_supply} / ${collection.max_supply}`} />
        </div>
      </div>
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent className="bg-black border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Collection Info</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap text-white/70">
              {collection?.meta_data?.description || "No description available"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
              onClick={() => setShowInfoDialog(false)}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface StatItemProps {
  label: string
  value: string
}

function StatItem({ label, value, }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-gray-400">{label}</p>
      <p className=" font-bold flex items-center justify-center">
        {value}
      </p>
    </div>
  )
}