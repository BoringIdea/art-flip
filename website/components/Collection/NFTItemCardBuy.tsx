'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as Checkbox from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"
import { PrimaryColor } from "@/src/utils";
import { useRouter } from "next/navigation";

interface NFTItemCardProps {
  token: {
    tokenId: number;
    name?: string;
    image: {
      originalUrl: string;
    };
  };
  collectionSymbol?: string;
  contractAddress?: string;
  isPending: boolean;
  onBuy: (tokenId: number) => void;
  onSelect: (tokenId: number, selected: boolean) => void;
  ref?: React.Ref<HTMLDivElement>;
  selected: boolean;
}

export const NFTItemCardBuy = ({ token, collectionSymbol, contractAddress, isPending, onBuy, onSelect, ref, selected: isSelected }: NFTItemCardProps) => {
  const router = useRouter();

  const handleSelect = () => {
    onSelect?.(token.tokenId, !isSelected)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or buy button
    if ((e.target as HTMLElement).closest('[data-radix-checkbox-root]') || 
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (contractAddress) {
      router.push(`/nft/${contractAddress}/${token.tokenId}`);
    }
  }

  console.log({ token, collectionSymbol })
  return (
    <Card
      className={`group flex flex-col justify-between relative transition-all duration-200 cursor-pointer ${isSelected ? 'ring-1 ring-[#3AF73E] scale-[1.02]' : '#3AF73E'} bg-black text-white`}
      ref={ref}
      onClick={handleCardClick}
    >
      <Checkbox.Root
        className={`absolute top-2 right-2 z-10 h-5 w-5 rounded-full border-2 flex items-center justify-center shadow-md ${isSelected
          ? 'bg-[#3AF73E] border-[#3AF73E]'
          : 'bg-black border-[#3AF73E]'
          }`}
        checked={isSelected}
        onCheckedChange={handleSelect}
      >
        <Checkbox.Indicator>
          <CheckIcon className={`h-4 w-4 ${isSelected ? 'text-black' : `text-[${PrimaryColor}]`
            }`} />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <CardContent className="flex-grow p-1">
        <img
          src={token.image.originalUrl}
          alt={`${token.name} #${token.tokenId}`}
          className="w-full h-auto object-cover rounded-md"
        />
      </CardContent>
      <CardFooter className="relative pt-2 pb-8 px-2">
        <CardTitle className="hidden md:block text-white px-2 font-bold pt-4">{collectionSymbol} #{token.tokenId}</CardTitle>
        <div className={`absolute inset-0 z-10 rounded-b-lg flex items-center justify-center transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto bg-black/70 backdrop-blur-sm`}>
          <Button
            disabled={isPending}
            onClick={() => onBuy(token.tokenId)}
            className="w-full mx-2 bg-[#3af73e] hover:bg-emerald-600 text-black"
          >
            Buy NFT
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}