import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCollection } from '@/src/api/hooks';
import { getNFTMetadataByTokenId } from '@/src/api/alchemy';
import NFTTraits from '@/components/NFT/NFTTraits';
import NFTActivity from '@/components/NFT/NFTActivity';
import { PRICE_ABI, getTradeContractAddress } from '@/src/contract';
import { buildBuyTx } from '@/src/onchain/tradeTx';
import { SupportedChainId } from '@/src/alchemy';
import TransactionDialog from '@/components/shared/TransactionDialog';
import { getChainSymbol } from '@/src/utils';

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const address = params?.address as string;
  const tokenIdParam = params?.tokenId as string;
  const tokenId = Number(tokenIdParam);
  const chainId = useChainId();

  const { data: collectionResp } = useCollection(chainId, address);
  const collection = collectionResp?.data;

  const [imageUrl, setImageUrl] = useState<string>('');
  const [traits, setTraits] = useState<any[]>([]);
  const [name, setName] = useState<string>('');

  // load metadata
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        const meta = await getNFTMetadataByTokenId(chainId as SupportedChainId, address, tokenId);
        if (ignore) return;
        const img = meta?.image?.originalUrl || meta?.image?.pngUrl || '';
        if (img) setImageUrl(img);
        setTraits((meta?.raw?.metadata as any)?.attributes || []);
        setName(meta?.name || `${collection?.symbol || 'Token'} #${tokenId}`);
      } catch {
        // fallback: keep empty traits
      }
    };
    if (address && tokenIdParam) run();
    return () => { ignore = true; };
  }, [address, tokenIdParam, chainId, collection?.symbol]);

  // floor/buy price
  const { data: buyPrice } = useReadContract({
    address: collection?.price_contract as any,
    abi: PRICE_ABI,
    functionName: 'getBuyPriceAfterFee',
    args: [collection?.address],
    query: { enabled: !!collection?.price_contract && !!collection?.address }
  });

  const { data: hash, writeContract, isPending, isError: isWriteContractError, error: writeContractError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleBuyNow = async () => {
    if (!buyPrice) return;
    await writeContract(
      buildBuyTx({
        tradeContractAddress: getTradeContractAddress(chainId as SupportedChainId),
        collectionAddress: address,
        tokenId,
        buyPriceWei: BigInt(buyPrice.toString()),
      }) as any
    );
  };

  const floorText = useMemo(() => {
    if (!buyPrice) return '0';
    const n = Number(buyPrice) / 1e18;
    return `${n.toFixed(4).replace(/\.?0+$/, '')} ${getChainSymbol(chainId)}`;
  }, [buyPrice, chainId]);

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="container w-full max-w-full px-2 sm:px-6 lg:px-8 pb-12 pt-6 sm:pt-10">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <span className="text-lg">&lt;</span>
          Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* left: image and buy */}
          <div className="md:col-span-1">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-600">No Image</div>
                )}
              </div>
              <div className="w-full mt-4">
                <div className="text-white text-lg font-semibold">{name || `${collection?.symbol || ''} #${tokenId}`}</div>
                <div className="text-gray-400 text-sm mt-1">Floor Price: {floorText}</div>
                <button
                  className="mt-4 w-full bg-[#3af73e] text-black font-medium px-4 py-2 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  onClick={handleBuyNow}
                  disabled={!buyPrice || isPending}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* right: traits and activity */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <NFTTraits traits={traits as any[]} />
            <NFTActivity collectionAddress={address} tokenId={tokenId} />
          </div>
        </div>
      </div>

      <TransactionDialog
        isOpen={false}
        onOpenChange={() => {}}
        status={isPending ? 'pending' : isConfirmed ? 'success' : 'idle'}
        hash={hash}
        error={isWriteContractError ? writeContractError?.toString() : undefined}
        title="Buy NFT success"
        chainId={chainId}
      />
    </div>
  );
}


