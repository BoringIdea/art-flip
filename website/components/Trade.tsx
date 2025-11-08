import { useState } from 'react';
import Buy from './Buy';
import Sell from './Sell';
import Activity from './Activity';
import Holders from './Holders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradeProps {
  contractAddress: string;
  collection?: any;
}

export default function Trade({ contractAddress, collection }: TradeProps) {
  const [activeTradeTab, setActiveTradeTab] = useState<'buy' | 'sell' | 'activity' | 'holders'>('buy');

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-b border-[#444] gap-2">
        <h1 className="text-base sm:text-lg text-[#aaa]">Trade Collection</h1>
        <div className="text-sm text-gray-400">
          Trade, view activity, and explore holders
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-[#444]">
        <Tabs value={activeTradeTab} onValueChange={(value) => setActiveTradeTab(value as 'buy' | 'sell' | 'activity' | 'holders')}>
          <TabsList className="border-b border-[#444] bg-transparent w-full justify-start">
            <TabsTrigger
              value="buy"
              className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
            >
              Sell
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="holders"
              className="text-lg px-6 py-3 data-[state=active]:text-[#3af73e] data-[state=active]:border-b-2 data-[state=active]:border-[#3af73e] data-[state=active]:shadow-none data-[state=active]:bg-transparent rounded-none"
            >
              Holders
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="m-0">
            <div className="p-4">
              <Buy contractAddress={contractAddress} collection={collection} />
            </div>
          </TabsContent>
          <TabsContent value="sell" className="m-0">
            <div className="p-4">
              <Sell contractAddress={contractAddress} collection={collection} />
            </div>
          </TabsContent>
          <TabsContent value="activity" className="m-0">
            <Activity collectionAddress={contractAddress} />
          </TabsContent>
          <TabsContent value="holders" className="m-0">
            <Holders collectionAddress={contractAddress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
