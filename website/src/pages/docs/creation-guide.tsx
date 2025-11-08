import Header from '@/components/Header';
import Head from 'next/head';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

const content = {
  en: {
    title: "# 🎨 How to Launch an NFT Collection",
    intro: "The Flip platform provides creators with a simple and efficient solution for NFT minting. In the launch interface, you need to fill in the following key information:",
    formFields: `| Field | Type | Description |
|--------|------|-------------|
| Name | String | Name of the NFT collection, recommend using a distinctive name |
| Symbol | String | Trading symbol for the NFT collection, typically in uppercase letters, e.g., "FLIP" |
| Initial Price | Float | Base price for NFT minting, serves as the baseline for dynamic pricing |
| Max Supply | Integer | Maximum number of NFTs that can be minted, immutable after deployment |
| Creator Fee | Integer | Royalty percentage (%) deducted from each transaction |
| Base URI | String | Base address for NFT metadata access |`,
    keyParams: "Below, we'll detail two crucial parameters: Initial Price and Base URI.",
    initialPrice: `## 💰 Initial Price

Initial Price serves as the base pricing for NFTs. Flip implements an innovative dynamic pricing mechanism (Bonding Curve) where NFT prices adjust automatically based on the minting volume. The specific pricing formula is:

$$
\\begin{aligned}
price = & \\ initialPrice + initialPrice \\times 2 \\times \\\\
& \\sqrt{\\frac{100 \\times supply}{maxSupply}} \\times \\\\
& \\sqrt{\\frac{10000 \\times supply^2}{maxSupply^2}}
\\end{aligned}
$$

Parameter definitions:

- initialPrice: Your set base price for the NFT
- supply: Current number of minted NFTs
- maxSupply: Maximum total supply of NFTs

Price curve characteristics:

- Follows a parabolic trajectory
- Early minting phase: Lower prices with rapid growth rate
- Later minting phase: Higher prices with diminishing growth rate

Example: With initialPrice = 0.001 ETH and maxSupply = 10000, the price ceiling approaches 2 ETH

![Bonding Curve Price Chart](/docs/price-curve.png)`,
    baseURI: `## 🔗 Base URI
Base URI defines the root path for NFT metadata access, determining how to retrieve information for each NFT. Flip is fully compatible with [OpenSea's metadata standards](https://docs.opensea.io/docs/metadata-standards) and supports [contract-level metadata](https://docs.opensea.io/docs/contract-level-metadata). You can view an example [here](https://ipfs.io/ipfs/bafybeicjxnmmtaqdyrepfz2vct2ftz2xpaguceqd4pfryyme4sstoevqb4).`,
    smartContract: `### 📝 Smart Contract Implementation

The smart contract is implemented using the [ERC-721](https://eips.ethereum.org/EIPS/eip-721) and [ERC-7572](https://eips.ethereum.org/EIPS/eip-7572) standards. The contract includes the following key features:

\`\`\`solidity
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    // Get the metadata URL for a single NFT
    // Use the baseURI as the base path and append the tokenId and file name
    function tokenURI(uint256 tokenId) public view override virtual returns (string memory) {
        _requireOwned(tokenId);
        return bytes(baseURI).length > 0 ? string.concat(baseURI, "/", tokenId.toString(), ".json") : "";
    }

    // Get the metadata URL for the collection
    // Use the baseURI as the base path and append the collection metadata file name
    function contractURI() public view returns (string memory) {
        return bytes(baseURI).length > 0 ? string.concat(baseURI, "/collection.json") : "";
    }
\`\`\`
`,

    metadataRules: `### 📝 Metadata Access Rules
1. Individual NFT metadata URL format:
\`\`\`plaintext
https://baseURI/1.json
https://baseURI/2.json
...
https://baseURI/10000.json
\`\`\`
The last number is the NFT ID, starting from 1 and incrementing by 1.

2. Collection metadata URL:
\`\`\`plaintext
https://baseURI/collection.json
\`\`\`
The last file name is the collection metadata file name.`,
    metadataFormat: `### 📋 Metadata Format Specifications
1. Individual NFT metadata example (ERC-721 compliant):
\`\`\`json
{  
  "name": "FLIP #1",  // NFT name, recommended to include token ID
  "description": "FLIP NFT is an NFT standard constructed using the Bonding Curve algorithm", 
  "image": "https://ipfs.io/ipfs/bafkreicxcqiu6xur2sqp5vnpbaq5ksy43pbe3i3ymldkqogmtg5erq4nje"
}
\`\`\`
The individual NFT metadata is used to describe the properties of a single NFT, such as name, description, and image.

2. Collection metadata example (ERC-7572 compliant):
\`\`\`json
{
  "name": "FLIP TEST",
  "symbol": "FLIP",
  "description": "FLIP NFT is an NFT standard constructed using the Bonding Curve algorithm",
  "image": "https://ipfs.io/ipfs/bafkreicxcqiu6xur2sqp5vnpbaq5ksy43pbe3i3ymldkqogmtg5erq4nje",
  "banner_image": "https://ipfs.io/ipfs/bafkreigqflltl7xwqv6wmp2yxgnosdlmlr2d5y36ne2zm2vtmiapgozawa"
}
\`\`\` 
The collection metadata is used to describe the properties of the collection, such as name, symbol, description, image, and banner image.`,
    deployment: `## 🚀 File Organization and Deployment
Recommended metadata project structure:
\`\`\`plaintext
Project/
├── Metadata/
│ ├── collection.json # Collection metadata
│ ├── 1.json         # NFT #1 metadata
│ ├── 2.json         # NFT #2 metadata
│ └── ...            # Additional NFT metadata
└── Images/
  ├── 1.png          # NFT #1 image
  ├── 2.png          # NFT #2 image
  └── ...            # Additional NFT images
\`\`\`
⚠️Note: We need to upload the Images folder to IPFS first, then use the image CID to replace the image URL in the metadata before uploading the Metadata folder to IPFS.

Metadata deployment options:
1. IPFS Deployment:
   - Use IPFS CLI tools for manual deployment
   - Pros: Fully decentralized, permanent storage
   - Cons: More complex deployment process

2. Pinata Deployment (Recommended):
   - Visit [Pinata](https://www.pinata.cloud/)
   - Register and upload folders
   - Pros: User-friendly, provides stable IPFS gateway
   - Cons: May require paid subscription

Important: Ensure all files are uploaded to IPFS before deploying the smart contract, as the Base URI cannot be modified after contract deployment.`
  },
  zh: {
    title: "# 🎨 如何发布NFT合集",
    intro: "Flip平台为创作者提供了一个简单高效的NFT铸造解决方案。在发布界面中，您需要填写以下关键信息：",
    formFields: `| 字段 | 类型 | 描述 |
|--------|------|-------------|
| Name | 字符串 | NFT合集名称，建议使用具有特色的名称 |
| Symbol | 字符串 | NFT合集的交易符号，通常使用大写字母，如"FLIP" |
| Initial Price | 浮点数 | NFT铸造的基础价格，作为动态定价的基准线 |
| Max Supply | 整数 | 可以铸造的NFT最大数量，部署后不可更改 |
| Creator Fee | 整数 | 每笔交易中扣除的版税百分比(%) |
| Base URI | 字符串 | NFT元数据访问的基础地址 |`,
    keyParams: "下面，我们将详细介绍两个关键参数：初始价格和Base URI。",
    initialPrice: `## 💰 初始价格

初始价格作为NFT的基础定价。Flip实现了一个创新的动态定价机制（债券曲线），NFT价格会根据铸造量自动调整。具体定价公式为：

$$
\\begin{aligned}
price = & \\ initialPrice + initialPrice \\times 2 \\times \\\\
& \\sqrt{\\frac{100 \\times supply}{maxSupply}} \\times \\\\
& \\sqrt{\\frac{10000 \\times supply^2}{maxSupply^2}}
\\end{aligned}
$$

参数定义：

- initialPrice：您设置的NFT基础价格
- supply：当前已铸造的NFT数量
- maxSupply：NFT的最大总供应量

价格曲线特征：

- 遵循抛物线轨迹
- 早期铸造阶段：价格较低，增长率快
- 后期铸造阶段：价格较高，增长率减缓

示例：当initialPrice = 0.001 ETH且maxSupply = 10000时，价格上限接近2 ETH

![Bonding Curve Price Chart](/docs/price-curve.png)`,
    baseURI: `## 🔗 Base URI
基础URI定义了NFT元数据访问的根路径，决定了如何获取每个NFT的信息。Flip完全兼容[OpenSea的元数据标准](https://docs.opensea.io/docs/metadata-standards)并支持[合约级元数据](https://docs.opensea.io/docs/contract-level-metadata)。你可以从[这里](https://ipfs.io/ipfs/bafybeicjxnmmtaqdyrepfz2vct2ftz2xpaguceqd4pfryyme4sstoevqb4)查看一个示例`,
    smartContract: `### 📝 智能合约实现

智能合约使用[ERC-721](https://eips.ethereum.org/EIPS/eip-721) 和 [ERC-7572](https://eips.ethereum.org/EIPS/eip-7572) 标准实现。合约包括以下关键功能：

\`\`\`solidity
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    // 获取单个NFT的元数据URL
    // 使用baseURI作为基础路径，并在末尾拼接tokenId和文件名
    function tokenURI(uint256 tokenId) public view override virtual returns (string memory) {
        _requireOwned(tokenId);
        return bytes(baseURI).length > 0 ? string.concat(baseURI, "/", tokenId.toString(), ".json") : "";
    }

    // 获取合集信息的元数据URL
    // 使用baseURI作为基础路径，并在末尾拼接合集的元数据文件名
    function contractURI() public view returns (string memory) {
        return bytes(baseURI).length > 0 ? string.concat(baseURI, "/collection.json") : "";
    }
\`\`\`
`,
    metadataRules: `### 📝 元数据访问规则
1. 单个NFT元数据URL格式：
\`\`\`plaintext
https://baseURI/1.json
https://baseURI/2.json
...
https://baseURI/10000.json
\`\`\`
最后面拼接的数字是NFT的ID，从1开始，依次递增。

2. 合集元数据URL：
\`\`\`plaintext
https://baseURI/collection.json
\`\`\`
最后面拼接的文件名是合集的元数据文件名。`,
    metadataFormat: `### 📋 元数据格式规范
1. 单个NFT元数据示例（符合ERC-721标准）：
\`\`\`json
{  
  "name": "FLIP #1",  // NFT名称，建议包含代币ID
  "description": "FLIP NFT is an NFT standard constructed using the Bonding Curve algorithm", 
  "image": "https://ipfs.io/ipfs/bafkreicxcqiu6xur2sqp5vnpbaq5ksy43pbe3i3ymldkqogmtg5erq4nje"
}
\`\`\`
单个NFT的元数据用来描述单个NFT的属性，比如名称、描述、图片等。

2. 合集元数据示例（符合ERC-7572标准）：
\`\`\`json
{
  "name": "FLIP TEST",
  "symbol": "FLIP",
  "description": "FLIP NFT is an NFT standard constructed using the Bonding Curve algorithm",
  "image": "https://ipfs.io/ipfs/bafkreicxcqiu6xur2sqp5vnpbaq5ksy43pbe3i3ymldkqogmtg5erq4nje",
  "banner_image": "https://ipfs.io/ipfs/bafkreigqflltl7xwqv6wmp2yxgnosdlmlr2d5y36ne2zm2vtmiapgozawa"
}
\`\`\`
合集的元数据用来描述合集的属性，比如名称、符号、描述、图片、横幅图片等。`,
    deployment: `## 🚀 文件组织和部署
推荐的元数据项目结构：
\`\`\`plaintext
Project/
├── Metadata/
│ ├── collection.json # 合集元数据
│ ├── 1.json # NFT #1元数据
│ ├── 2.json # NFT #2元数据
│ └── ... # 其他NFT元数据
└── Images/
  ├── 1.png # NFT #1图片
  ├── 2.png # NFT #2图片
  └── ... # 其他NFT图片
\`\`\`
⚠️注意：我们需要先上传Images文件夹中的图片到IPFS，然后使用图片的CID来替换元数据中的图片URL后再上传Metadata文件夹到IPFS。

部署元数据选项：
1. IPFS部署：
   - 使用IPFS CLI工具手动部署
   - 优点：完全去中心化，永久存储
   - 缺点：部署过程较复杂

2. Pinata部署（推荐）：
   - 访问[Pinata](https://www.pinata.cloud/)
   - 注册并上传文件夹
   - 优点：用户友好，提供稳定的IPFS网关
   - 缺点：可能需要付费订阅

重要提示：确保在部署智能合约之前将所有文件上传到IPFS，因为基础URI在合约部署后无法修改。`
  }
};

export default function CreationGuide() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');

  return (
    <>
      <Head>
        <title>How to Launch an NFT Collection</title>
        <meta
          content="How to Launch an NFT Collection"
          name="How to Launch an NFT Collection"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link href="/flip.svg" rel="icon" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
          integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/github-dark.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <main className="flex justify-center w-full max-w-[100vw] overflow-x-auto px-2 sm:px-6 lg:px-8 py-8 pt-20 bg-black">
        <div className="max-w-4xl w-full mx-auto">
          <div className="p-2 sm:p-8 w-full max-w-full">
            <div className="flex justify-center mb-12">
              <div className="flex items-center gap-3 text-[#4CAF50]">
                <span
                  onClick={() => setLanguage('en')}
                  className={`cursor-pointer hover:text-[#45a049] transition-colors text-lg font-medium ${language === 'en' ? 'underline underline-offset-4' : ''}`}
                >
                  EN
                </span>
                <span className="text-gray-400 text-lg">|</span>
                <span
                  onClick={() => setLanguage('zh')}
                  className={`cursor-pointer hover:text-[#45a049] transition-colors text-lg font-medium ${language === 'zh' ? 'underline underline-offset-4' : ''}`}
                >
                  中文
                </span>
              </div>
            </div>
            <div
              className="
                flip-typo space-y-10 text-[#4CAF50] leading-relaxed prose prose-green max-w-full w-full
                prose-h1:!text-[#4CAF50] prose-h2:!text-[#4CAF50] prose-h3:!text-[#4CAF50] 
                prose-p:text-white prose-li:text-white
                prose-h1:text-3xl sm:prose-h1:text-5xl prose-h1:font-bold prose-h1:tracking-tight
                prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-semibold prose-h2:tracking-wide
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:font-medium
                prose-p:text-base sm:prose-p:text-lg prose-p:font-light prose-p:leading-8
                prose-li:text-base sm:prose-li:text-lg prose-li:font-light prose-li:leading-7
                prose-strong:font-semibold prose-strong:text-[#4CAF50]
                prose-th:text-base sm:prose-th:text-lg prose-td:text-base sm:prose-td:text-lg
                prose-th:text-[#4CAF50] prose-td:text-white prose-th:font-medium
                [--tw-prose-borders:#4CAF50/30]
                prose-pre:bg-gray-900 prose-pre:text-[#4CAF50] prose-code:text-[#4CAF50]
                prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              "
              style={{ wordBreak: 'break-all' }}
            >
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown>
                  {content[language].title}
                </ReactMarkdown>
              </div>
              <ReactMarkdown>
                {content[language].intro}
              </ReactMarkdown>
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                >
                  {content[language].formFields}
                </ReactMarkdown>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
              >
                {content[language].keyParams}
              </ReactMarkdown>
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                >
                  {content[language].initialPrice}
                </ReactMarkdown>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
              >
                {content[language].baseURI}
              </ReactMarkdown>
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                >
                  {content[language].smartContract}
                </ReactMarkdown>
              </div>
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                >
                  {content[language].metadataRules}
                </ReactMarkdown>
              </div>
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                >
                  {content[language].metadataFormat}
                </ReactMarkdown>
              </div>
              <div className="overflow-x-auto min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                >
                  {content[language].deployment}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .flip-typo { font-family: 'Sora', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
        .flip-typo h1, .flip-typo h2, .flip-typo h3 {
          font-family: 'Space Grotesk', 'Sora', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .flip-typo p, .flip-typo li, .flip-typo td, .flip-typo th, .flip-typo span {
          font-family: 'Sora', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-weight: 300;
          letter-spacing: 0.01em;
        }
        .flip-typo strong { font-weight: 600; }
        .flip-typo code, .flip-typo pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      `}</style>
    </>
  );
}
