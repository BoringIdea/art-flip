'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import * as Checkbox from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation";

interface NFTItemCardSellProps {
  token: {
    tokenId: number;
    name?: string;
    tokenUri?: string;
    image?: {
      originalUrl: string;
    };
  };
  collectionSymbol?: string;
  contractAddress?: string;
  isPending: boolean;
  onSell: (tokenId: number) => void;
  onSelect: (tokenId: number, selected: boolean) => void;
  ref?: React.Ref<HTMLDivElement>;
  selected: boolean;
  isApproved?: boolean;
  pendingApprovalTokenId?: number | null;
  isImageLoaded?: boolean;
}

export const NFTItemCardSell = ({ token, collectionSymbol, contractAddress, isPending, onSell, onSelect, ref, selected: isSelected, isApproved, pendingApprovalTokenId, isImageLoaded }: NFTItemCardSellProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false)
  const [img, setImg] = useState('/flip-logo.png')
  
  const handleSelect = () => {
    onSelect?.(token.tokenId, !isSelected)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or sell button
    if ((e.target as HTMLElement).closest('[data-radix-checkbox-root]') || 
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (contractAddress) {
      router.push(`/nft/${contractAddress}/${token.tokenId}`);
    }
  }

  useEffect(() => {
    const fetchImage = async () => {
      // If there is a preloaded image, use it
      if (token.image?.originalUrl) {
        setImg(token.image.originalUrl);
        return;
      }

      // If there is no preloaded image, but there is a tokenUri, fetch the image
      if (token.tokenUri && !isImageLoaded) {
        try {
          const response = await fetch(token.tokenUri);
          const data = await response.json();
          setImg(data.image);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };
    fetchImage();
  }, [token, isImageLoaded])

  return (
    <Card
      className={`group flex flex-col justify-between relative transition-all duration-200 cursor-pointer ${isSelected ? 'ring-1 ring-[#3AF73E] scale-[1.02]' : ''} bg-black text-white`}
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <Checkbox.Root
        className={`absolute top-2 right-2 z-10 h-5 w-5 rounded-full border-2 flex items-center justify-center shadow-md ${
          isSelected
            ? 'bg-[#3AF73E] border-[#3AF73E]'
            : 'bg-black border-[#3AF73E]'
        }`}
        checked={isSelected}
        onCheckedChange={handleSelect}
      >
        <Checkbox.Indicator>
          <CheckIcon className={`h-4 w-4 ${isSelected ? 'text-black' : 'text-[#3AF73E]'}`} />
        </Checkbox.Indicator>
      </Checkbox.Root>

      <CardContent className="flex-grow p-1">
        <img
          src={img}
          alt={`${token.name} #${token.tokenId}`}
          className="w-full h-auto object-cover rounded-md"
          loading="lazy"
        />
      </CardContent>
      <CardFooter className="relative pt-2 pb-8 px-2">
        <CardTitle className="hidden md:block text-white px-2 font-bold pt-4">{collectionSymbol} #{token.tokenId}</CardTitle>
        <div className={`absolute inset-0 z-10 rounded-b-lg flex items-center justify-center transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto bg-black/70 backdrop-blur-sm`}>
          <Button
            disabled={isPending}
            onClick={() => onSell(token.tokenId)}
            className="w-full mx-2 bg-[#3af73e] hover:bg-emerald-600 text-black"
          >
            {isPending 
              ? (pendingApprovalTokenId === token.tokenId 
                  ? 'Approving...' 
                  : 'Selling...')
              : (isApproved ? 'Sell NFT' : 'Approve First')
            }
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}