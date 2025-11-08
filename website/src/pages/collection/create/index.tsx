import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId
} from "wagmi";
import { FACTORY_CONTRACT_ABI, getFactoryContractAddress } from '@/src/contract';
import { parseEther } from 'ethers';
import { getChainSymbol, isHideHomeAndLaunchPage } from "@/src/utils";
import TransactionDialog from '@/components/shared/TransactionDialog';
import { useTransactionDialog } from '@/src/hooks/useTransactionDialog';
import ComingSoon from '@/components/CommingSoon';
import PriceChart from '@/components/Collection/PriceChart';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(1, 'Enter the name'),
  symbol: z.string().min(1, 'Enter the symbol'),
  maxSupply: z.string().min(1, 'Enter the max supply'),
  initialPrice: z.string().min(1, 'Enter the initial price'),
  maxPrice: z.string().default('0'),
  creatorFee: z.number()
    .min(1, 'Creator fee must be at least 1')
    .max(100, 'Creator fee cannot exceed 100')
    .multipleOf(0.1, 'Creator fee must be a multiple of 0.1'),
  uri: z.string().min(1, 'Enter the URI'),
  supportCrossChain: z.boolean().default(false),
});

// Set input style
const inputClassName = "mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-14 text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors";

// Set label style
const labelClassName = "block text-sm font-medium text-white mb-1";

// Cross-chain default values (hardcoded as requested)
const DEFAULT_GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995";
const DEFAULT_GAS_LIMIT = BigInt(12000000);
const DEFAULT_SUPPORT_MINT = true;

export default function CreateCollection() {
  const chainId = useChainId();
  const factoryContractAddress = getFactoryContractAddress(chainId as any);

  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [showContractAddress, setShowContractAddress] = useState<boolean>(false);
  const { data: hash, writeContract, isError: isWriteContractError, error: writeContractError, isPending } = useWriteContract();
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [maxSupply, setMaxSupply] = useState<string>('0');
  const [initialPrice, setInitialPrice] = useState<string>('0');
  const [creatorFee, setCreatorFee] = useState<string>('0');
  const [uri, setUri] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      symbol: '',
      maxSupply: '',
      initialPrice: '',
      maxPrice: '0',
      creatorFee: 0,
      uri: '',
      supportCrossChain: false,
    },
  });
  const { watch } = form;
  const watchedValues = watch();
  
  // Calculate expected address based on cross-chain support
  const { data: expectAddress, refetch: refetchExpectAddress } = useReadContract({
    // @ts-ignore
    address: factoryContractAddress,
    abi: FACTORY_CONTRACT_ABI,
    functionName: watchedValues.supportCrossChain ? 'calculateFLIPCrossChainAddress' : 'calculateFLIPAddress',
    args: isCompleted ? (
      watchedValues.supportCrossChain ? [
        name,
        symbol,
        initialPrice,
        maxSupply,
        parseEther(watchedValues.maxPrice || "0"), // maxPrice from form
        creatorFee,
        uri,
        DEFAULT_GATEWAY_ADDRESS,
        DEFAULT_GAS_LIMIT.toString(),
        DEFAULT_SUPPORT_MINT
      ] : [
        name,
        symbol,
        initialPrice,
        maxSupply,
        parseEther(watchedValues.maxPrice || "0"), // maxPrice from form
        creatorFee,
        uri
      ]
    ) : undefined,
  });

  useEffect(() => {
    if (expectAddress && isCompleted) {
      setContractAddress(expectAddress as string);
      setShowContractAddress(true);
    }
  }, [expectAddress, isCompleted]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!factoryContractAddress) {
      console.error('Factory contract address is not set');
      return;
    }

    // Convert all parameters to the same format
    const params = {
      name: values.name,
      symbol: values.symbol,
      initialPrice: parseEther(values.initialPrice.toString()),
      maxSupply: BigInt(values.maxSupply),
      maxPrice: parseEther(values.maxPrice || "0"), // Using user input or 0 as default
      creatorFee: parseEther((Number(values.creatorFee) / 100).toString()),
      uri: values.uri,
      supportCrossChain: values.supportCrossChain,
    };

    console.log('Submit params:', {
      raw: values,
      processed: {
        name: params.name,
        symbol: params.symbol,
        initialPrice: params.initialPrice.toString(),
        maxSupply: params.maxSupply.toString(),
        maxPrice: params.maxPrice.toString(),
        creatorFee: params.creatorFee.toString(),
        uri: params.uri,
        supportCrossChain: params.supportCrossChain,
      }
    });

    setName(params.name);
    setSymbol(params.symbol);
    setMaxSupply(params.maxSupply.toString());
    setInitialPrice(params.initialPrice.toString());
    setCreatorFee(params.creatorFee.toString());
    setUri(params.uri);

    // Call different functions based on cross-chain support
    if (params.supportCrossChain) {
      writeContract({
        // @ts-ignore
        address: factoryContractAddress,
        abi: FACTORY_CONTRACT_ABI,
        functionName: 'createFLIPCrossChain',
        args: [
          params.name,
          params.symbol,
          params.initialPrice.toString(),
          params.maxSupply.toString(),
          params.maxPrice.toString(),
          params.creatorFee.toString(),
          params.uri,
          DEFAULT_GATEWAY_ADDRESS,
          DEFAULT_GAS_LIMIT.toString(),
          DEFAULT_SUPPORT_MINT
        ],
      });
    } else {
      writeContract({
        // @ts-ignore
        address: factoryContractAddress,
        abi: FACTORY_CONTRACT_ABI,
        functionName: 'createFLIP',
        args: [
          params.name,
          params.symbol,
          params.initialPrice.toString(),
          params.maxSupply.toString(),
          params.maxPrice.toString(),
          params.creatorFee.toString(),
          params.uri
        ],
      });
    }

    // Update state immediately and refetch address
    setIsCompleted(true);
    refetchExpectAddress();
  };

  // Dialog state
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const { dialogState, onOpenChange } = useTransactionDialog({
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isWriteContractError,
    writeContractError,
    onConfirmed: () => setShowContractAddress(true),
  });
  const s = watch('maxSupply');
  const i = watch('initialPrice');
  console.log('maxSupply---', s, i);
  return (
    isHideHomeAndLaunchPage ? (
      <ComingSoon />
    ) : (
      <div className="bg-[#171a1f] min-h-screen w-full">
        {/* 标题区域，放在方框外部 */}
        <div className="flex flex-row items-center justify-between px-4 sm:px-[80px] pt-20 mb-12 max-w-[1400px] mx-auto">
          <div className="flex flex-col">
            <h1 className="font-bold text-2xl sm:text-3xl text-white">Create Collection</h1>
          </div>
          <Link href={'/docs/creation-guide'}>
          <button className="flex items-center flex-nowrap gap-2 rounded-lg bg-[#11491a] hover:bg-green-700 text-green-400 font-semibold px-3 sm:px-5 h-8 sm:h-10 text-xs sm:text-base ml-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.1328 15.5918H12.9199L10.6289 18.0488C10.2793 18.3984 9.71484 18.4004 9.36328 18.0508L9.36133 18.0488L7.06055 15.5918H2.85156C2.11328 15.5918 1.51367 15.1582 1.51367 14.4199V3.09375C1.51367 2.35547 2.11133 1.75781 2.84961 1.75586H17.1348C17.873 1.75586 18.4727 2.35547 18.4727 3.09375V14.4199C18.4707 15.1602 17.873 15.5918 17.1328 15.5918ZM12.2832 14.7148L12.5801 14.4355H16.7285C16.9629 14.4355 17.1504 14.4043 17.1504 14.1738V3.48633C17.1504 3.25391 16.9609 3.06641 16.7285 3.06641H3.25586C3.02148 3.06641 2.83398 3.25391 2.83398 3.48633V14.1719C2.83398 14.4023 3.02344 14.4336 3.25586 14.4336H7.41016L7.70703 14.7129C7.70703 14.7129 9.99414 17 9.99609 16.998L12.2832 14.7148ZM9.42188 12.4707C9.42188 12.1562 9.67383 11.9023 9.98828 11.9004H9.99219C10.0669 11.9001 10.1409 11.9147 10.21 11.9431C10.2791 11.9716 10.3418 12.0135 10.3947 12.0663C10.4475 12.1191 10.4893 12.1819 10.5178 12.2509C10.5463 12.32 10.5608 12.394 10.5605 12.4688V13.0391C10.5605 13.3535 10.3066 13.6074 9.99414 13.6074H9.99219C9.91748 13.6077 9.84345 13.5932 9.77438 13.5647C9.70531 13.5362 9.64255 13.4944 9.58972 13.4415C9.53689 13.3887 9.49504 13.3259 9.46657 13.2569C9.4381 13.1878 9.42357 13.1138 9.42383 13.0391V12.4707H9.42188ZM11.0059 10.2891C10.9121 10.3242 10.8184 10.3652 10.7285 10.4102C10.5625 10.4863 10.457 10.6504 10.459 10.834C10.457 10.916 10.459 11 10.4414 11.0781C10.3906 11.3066 10.1719 11.4629 9.94922 11.4395C9.70703 11.4199 9.51953 11.2207 9.51367 10.9766C9.48828 10.3086 9.76562 9.82227 10.373 9.53125C10.4551 9.49023 10.5391 9.45508 10.623 9.42383C11.4453 9.12695 11.959 8.31445 11.8691 7.45312C11.7773 6.58789 11.0957 5.88477 10.2402 5.77148C9.20117 5.63281 8.24609 6.36328 8.10742 7.40234C8.09961 7.4668 8.09375 7.5332 8.0918 7.59766C8.08984 7.66016 8.08789 7.72266 8.07031 7.7832C8.00586 8.00586 7.78906 8.15039 7.56055 8.12109C7.31836 8.0918 7.13867 7.88281 7.14648 7.63867C7.1543 6.94141 7.37305 6.31445 7.83984 5.79492C8.60547 4.94141 9.56641 4.61914 10.6758 4.89844C11.7949 5.18164 12.4902 5.92969 12.7598 7.05859C12.8066 7.25195 12.8145 7.45313 12.8398 7.65039C12.8145 8.83398 12.1055 9.86133 11.0059 10.2891Z" fill="#3AF73E" />
              </svg>
              <span className='text-nowrap sm:hidden'>Guide</span>
              <span className='text-nowrap hidden sm:inline'>Creation Guide</span>
            </button>
          </Link>
        </div>
        {/* 方框内容 */}
        <div className="w-full flex justify-center items-start px-0 sm:px-[80px]">
          <div className="w-full max-w-[1400px] bg-[#171a1f] rounded-lg shadow-lg border border-[#222] overflow-hidden pb-12">
            <div className="flex flex-col md:flex-row w-full border-b border-[#444]">
              {/* 左侧表单区域 */}
              <div className="w-full md:w-1/2 bg-[#171a1f] px-2 sm:px-8 py-6 sm:py-9 
                  md:border-r border-b md:border-b-0 border-[#444]">
                <Card className="bg-transparent border border-none shadow-none">
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-6">
                          {contractAddress && showContractAddress && (
                            <div className="p-2 sm:p-4 bg-[#1a1a1a] rounded-lg border border-[#3a404a]">
                              <div className="flex items-center justify-between">
                                <p className="text-xs sm:text-sm text-[rgba(255,255,255,0.65)]">Contract Address:</p>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(contractAddress);
                                  }}
                                  type="button"
                                  className="px-2 sm:px-3 py-1 text-xs bg-[rgba(58,47,62,0.2)] text-[#3af73e] rounded transition-colors flex items-center gap-1"
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                  Copy
                                </button>
                              </div>
                              <p className="text-white text-xs sm:text-sm break-all">{contractAddress}</p>
                            </div>
                          )}

                          {/* Name and Symbol */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className={labelClassName}>
                                Name
                              </label>
                              <input
                                {...form.register('name')}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="Collection Name"
                              />
                            </div>
                            <div>
                              <label className={labelClassName}>
                                Symbol
                              </label>
                              <input
                                {...form.register('symbol')}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="e.g. FLIP"
                              />
                            </div>
                          </div>

                          {/* Price and Max Supply */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className={labelClassName}>
                                Initial Price ({getChainSymbol(chainId)})
                              </label>
                              <input
                                type="number"
                                step="0.001"
                                {...form.register('initialPrice')}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="0.001"
                              />
                            </div>
                            <div>
                              <label className={labelClassName}>
                                Max Supply
                              </label>
                              <input
                                type="number"
                                {...form.register('maxSupply')}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="10000"
                              />
                            </div>
                          </div>

                          {/* Creator Fee and Max Price */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <label className={labelClassName}>
                                Creator Fee (%)
                              </label>
                              <input
                                type="number"
                                {...form.register('creatorFee', {
                                  min: 1,
                                  max: 100,
                                  valueAsNumber: true
                                })}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="10"
                                step="0.1"
                                min="1"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className={labelClassName}>
                                Max Price ({getChainSymbol(chainId)}) <span className="text-gray-400 text-xs">(Optional)</span>
                              </label>
                              <input
                                type="number"
                                step="0.001"
                                {...form.register('maxPrice')}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Base URI */}
                          <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div>
                              <label className={labelClassName}>
                                Base URI
                              </label>
                              <input
                                {...form.register('uri')}
                                className="mt-1 block w-full rounded-md border border-[#3a404a] bg-[#2f343e] px-3 h-10 sm:h-14 text-xs sm:text-base text-white shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 hover:border-[#4a505a] transition-colors"
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          {/* Cross-Chain Support Toggle */}
                          <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#3a404a]">
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-white">
                                  Cross-Chain Support
                                </label>
                                <p className="text-xs text-gray-400 mt-1">
                                  Enable cross-chain functionality for your NFT collection
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...form.register('supportCrossChain')}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                              </label>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="border border-green-400 bg-green-50 text-green-700 rounded-md px-4 py-3 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                              </svg>
                              Please make sure your BaseURI is correct and accessible, otherwise your collection will not be displayed on the homepage.
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <button
                              type="submit"
                              disabled={isPending || !form.formState.isValid}
                              className={`w-full px-6 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium text-lg shadow-sm flex items-center justify-center gap-2 ${isPending || !form.formState.isValid ? 'bg-[#3AF73E]/60 cursor-not-allowed text-black' : 'bg-[#3AF73E] hover:bg-green-600 text-black'}`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              {isPending ? 'Creating...' : 'Create Collection'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </Form>
                    <TransactionDialog
                      isOpen={dialogState.isOpen}
                      onOpenChange={onOpenChange}
                      status={dialogState.status}
                      hash={dialogState.hash}
                      error={dialogState.error}
                      title="NFT Collection Created Successfully"
                      chainId={chainId}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* TODO: Add price curve preview */}
              <div className="w-full md:w-1/2 bg-[#171a1f] px-6 py-8 md:rounded-lg">
              <div className="mb-6 bg-[#1a1a1a] rounded-lg p-4 border border-[#3a404a]">
                  <h2 className="text-lg font-semibold text-white">Price Curve Preview</h2>
                  <p className="text-sm text-gray-400 mt-2">Based on the set price and supply, the generated price curve</p>
                </div>
                
                <div className="h-[400px] flex flex-col items-center sm:mb-40">
                  {Number(s) > 0 && Number(i) > 0 ? (
                    <PriceChart
                      collection={{
                        max_supply: Number(s),
                        initial_price: parseEther(i).toString(),
                        current_supply: 0,
                        floor_price: parseEther(i).toString(),
                      }}
                      chainId={chainId}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-400 text-sm">[Please fill in the left form to view the price curve]</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}