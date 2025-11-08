import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import Mint from '@/components/Mint';
import Trade from '@/components/Trade';
import CrossChain from '@/components/CrossChain';
import Chat from '@/components/Chat';
import { useParams } from 'next/navigation';
import { useChainId } from 'wagmi';
import { Collection, useCollection } from '@/src/api';
import CollectionInfo from '@/components/CollectionInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const chainId = useChainId();

  const { data, mutate } = useCollection(chainId, id);
  const [activeTab, setActiveTab] = useState<'mint' | 'trade' | 'crosschain' | 'chat'>('mint');
  const collection = useMemo(() => {
    if (data?.data) {
      return data.data;
    }
    return;
  }, [data])

  // useEffect(() => {
  //   const fetchMetadata = async () => {
  //     if (collection?.base_uri) {
  //       try {
  //         const response = await fetch(collection.base_uri + '/collection.json');
  //         const metadata: CollectionMetadata = await response.json();
  //         setCollectionMetadata(metadata);
  //       } catch (error) {
  //         console.error('Failed to fetch collection metadata:', error);
  //       }
  //     }
  //   };

  //   fetchMetadata();
  // }, [collection]);

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-12 py-4 sm:py-10 pb-20 sm:pb-0">
      <div className="w-full">
        <CollectionInfo collection={collection} />
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <Tabs value={activeTab}>
            {/* TabBar */}
            <TabsList className="border-b border-gray-800 bg-transparent w-full justify-start hidden sm:flex">
              <TabsTrigger
                onClick={() => setActiveTab('mint')}
                value="mint"
                className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
              >
                Mint
              </TabsTrigger>
              <TabsTrigger
                value="trade"
                onClick={() => setActiveTab('trade')}
                className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
              >
                Trade
              </TabsTrigger>
              <TabsTrigger
                value="crosschain"
                onClick={() => setActiveTab('crosschain')}
                className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
              >
                CrossChain
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                onClick={() => setActiveTab('chat')}
                className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
              >
                Chat
              </TabsTrigger>
            </TabsList>
            {/* Mobile TabBar */}
            <div className="sm:hidden">
              <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-[#171a1f]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#171a1f]/60">
                <div className="flex w-full px-1 py-1 pb-[env(safe-area-inset-bottom)]">
                  <button
                    aria-label="Mint"
                    className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs border-t-2 ${activeTab === 'mint' ? 'text-[#3af73e] border-[#3af73e] bg-[#232323]/50' : 'text-gray-200 border-transparent'}`}
                    onClick={() => setActiveTab('mint')}
                  >
                    <span className="text-lg leading-none">🎨</span>
                    <span className="leading-none">Mint</span>
                  </button>
                  <button
                    aria-label="Trade"
                    className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs border-t-2 ${activeTab === 'trade' ? 'text-[#3af73e] border-[#3af73e] bg-[#232323]/50' : 'text-gray-200 border-transparent'}`}
                    onClick={() => setActiveTab('trade')}
                  >
                    <span className="text-lg leading-none">💱</span>
                    <span className="leading-none">Trade</span>
                  </button>
                  <button
                    aria-label="CrossChain"
                    className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs border-t-2 ${activeTab === 'crosschain' ? 'text-[#3af73e] border-[#3af73e] bg-[#232323]/50' : 'text-gray-200 border-transparent'}`}
                    onClick={() => setActiveTab('crosschain')}
                  >
                    <span className="text-lg leading-none">🌉</span>
                    <span className="leading-none">CrossChain</span>
                  </button>
                  <button
                    aria-label="Chat"
                    className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs border-t-2 ${activeTab === 'chat' ? 'text-[#3af73e] border-[#3af73e] bg-[#232323]/50' : 'text-gray-200 border-transparent'}`}
                    onClick={() => setActiveTab('chat')}
                  >
                    <span className="text-lg leading-none">💬</span>
                    <span className="leading-none">Chat</span>
                  </button>
                </div>
              </div>
            </div>
            <TabsContent value="mint" className="m-0">
              <Mint contractAddress={id} collection={collection} />
            </TabsContent>
            <TabsContent value="trade">
              <Trade contractAddress={id} collection={collection} />
            </TabsContent>
            <TabsContent value="crosschain">
              <CrossChain contractAddress={id} collection={collection} />
            </TabsContent>
        <TabsContent value="chat">
          <Chat contractAddress={id} collection={collection} chainId={chainId} />
        </TabsContent>
          </Tabs>
        </div>
        {/* Bottom spacer for mobile to avoid overlap with fixed TabBar */}
        <div className="sm:hidden h-16" />
      </div>
    </div>
  );
}