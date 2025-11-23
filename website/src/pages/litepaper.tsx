import Header from '@/components/Header';
import Head from 'next/head';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const content = {
  en: {
    title: "# 🚀 Introducing FLIP: A Revolutionary NFT Liquidity Solution",
    intro: "Since the inception of NFTs, blockchain-based digital art issuance has garnered unprecedented attention. While NFTs once triggered an investment boom, the market now faces significant liquidity challenges.",
    challengeIntro: "The NFT liquidity shortage manifests in three key areas:",
    challenges: [
      "- 🌐 ***Cross-chain Limitations*** - EVM ecosystem lacks mature ERC-721 cross-chain solutions, limiting NFT circulation and use cases in rapidly growing L2 ecosystems",
      "- 💸 ***Trading Inefficiency*** - Under traditional orderbook models, low-liquidity NFTs struggle with timely transactions, forcing holders to continuously lower prices, severely impacting asset value",
      "- 🌱 ***Ecosystem Sustainability*** - Projects lack maintenance incentives after profiting from reserved NFTs, leading to quality decline and frequent rug pulls. Royalty disputes further affect ecosystem health."
    ].join('\n'),
    previousExploration: "Despite industry innovations like NFTX for NFT fractionalization, BendDAO for NFT lending, and Blur for NFT trading, these attempts haven't fundamentally solved the liquidity problem.",
    introduce: "**Against this backdrop, Flip emerges—a revolutionary NFT liquidity solution.**",
    bondingCurve: "## 📈 Bonding Curve\nFLIP adopts an innovative ERC721-based standard, introducing the Bonding Curve algorithm for smart pricing. NFT minting prices start from a baseline, dynamically adjusting with mint volume until reaching preset limits. Project teams have no reserved rights and must participate in purchases equally with regular users. This ensures market-driven pricing while incentivizing creators to continuously add value through royalty mechanisms.",
    liquidityMechanism: "## 💦 Liquidity Mechanism\nFLIP's other innovation lies in its instant liquidity mechanism. Users can trade NFTs directly through smart contracts anytime, with all sold NFTs entering a trading pool, eliminating traditional order placement processes. Buy and sell prices are intelligently determined by the Bonding Curve algorithm, significantly improving trading efficiency.",
    smartContract: "## 📖 Smart Contract\nThrough smart contract-based direct interactions, users need not rely on centralized trading platforms, enhancing liquidity while eliminating platform risks.",
    crossChain: "## 🌉 Cross Chain\nAdditionally, FLIP is integrating ZetaChain's cross-chain solution, currently supporting NFT cross-chain interactions between BSC, Base, and Polygon networks, with future expansion to more EVM-compatible chains planned. We are also advancing the Superchain ERC721 standard, and FLIP NFTs will support cross-chain interactions between Superchain networks in the future.",
    conclusion: "## 💻 Conclusion\nIn conclusion, FLIP addresses core NFT market pain points through three innovative mechanisms:",
    solutions: [
      "- 🔗 ***Cross-chain Interoperability*** - Breaking ecosystem silos, expanding use cases",
      "- 💰 ***Smart Pricing*** - Bonding Curve mechanism ensures liquidity and price stability",
      "- 🌱 ***Sustainable Incentives*** - Innovative mint and royalty mechanisms promote healthy ecosystem development "
    ].join('\n'),
    whyFlip: [
      "## 🤔 Why FLIP?",
      "**For Creators:**",
      "- *Quick Launch*：Launch an NFT project quickly through our platform",
      "- *Low Cost*：The cost of starting a project is comparable to creating a pool on Uniswap",
      "- *No Delisting Risk*：No need to worry about being delisted by centralized markets \n",
      "**For Traders:**",
      "- *Fair Launch*：Purchase at a low price during the project's early stage",
      "- *Buy/Sell Anytime*：No worries about being unable to sell your NFT until it hits zero",
      "- *Fast Transactions*：No need to wait for order matching",
    ].join('\n'),
    roadmap: [
      "## 📜 Roadmap",
      "- *Phase 1* ✅ - Implement Bonding Curve NFT",
      "- *Phase 2* ✅ - Implement on-chain order book trading for NFTs",
      "- *Phase 3* ✅ - Implement self-custodial NFT DEX",
      "- *Phase 4* ✅- Implement NFT with cross-chain functionality"
    ].join('\n'),
  },
  zh: {
    title: "# 🚀 FLIP简介：革命性的NFT流动性解决方案",
    intro: "自NFT概念诞生以来，基于区块链的数字艺术发行获得了前所未有的关注。虽然NFT曾经引发投资热潮，但市场现在面临着重大的流动性挑战。",
    challengeIntro: "NFT流动性短缺主要体现在三个关键领域：",
    challenges: [
      "- 🌐 ***跨链限制*** - EVM生态系统缺乏成熟的ERC-721跨链解决方案，限制了NFT在快速发展的L2生态系统中的流通和使用场景",
      "- 💸 ***交易效率低下*** - 在传统订单簿模型下，低流动性NFT难以及时成交，迫使持有者不断降价，严重影响资产价值",
      "- 🌱 ***生态系统可持续性*** - 项目方在通过预留NFT获利后缺乏维护激励，导致质量下降和频繁跑路。版税争议进一步影响生态健康。"
    ].join('\n'),
    previousExploration: "尽管行业也有过一些创新的尝试，如NFT碎片化NFTX、NFT借贷BendDAO和NFT交易平台Blur等，但这些尝试并未从根本上解决流动性问题。",
    introduce: "**FLIP应运而生，成为NFT流动性解决方案的革命性创新。**",
    bondingCurve: "## 📈 债券曲线(Bonding Curve)\nFLIP采用创新的基于ERC721的标准，引入债券曲线算法进行智能定价。NFT铸造价格从基准价开始，随铸造量动态调整直至达到预设限制。项目团队没有预留权益，必须与普通用户平等参与购买。这确保了市场驱动的定价，同时通过版税机制激励创作者持续创造价值。",
    liquidityMechanism: "## 💦 流动性机制(Liquidity Mechanism)\nFLIP的另一创新在于即时流动性机制。用户可以随时通过智能合约直接交易NFT，所有售出的NFT进入交易池，省去了传统下单流程。买卖价格由债券曲线算法智能决定，大幅提高交易效率。",
    smartContract: "## 📖 智能合约(Smart Contract)\n通过基于智能合约的直接交互，用户无需依赖中心化交易平台，在提升流动性的同时消除平台风险。",
    crossChain: "## 🌉 跨链功能(Cross Chain)\n此外，FLIP正在集成ZetaChain的跨链解决方案，ZetaChain 目前支持BSC、Base和Polygon网络间的NFT跨链交互，其未来计划扩展到更多EVM兼容链。同时我们也正在推进Superchain ERC721标准，未来FLIP NFT将支持Superchain网络间的跨链交互。",
    conclusion: "## 💻 总结\n总的来说，FLIP通过三个创新机制解决NFT市场核心痛点：",
    solutions: [
      "- 🚀 ***跨链互操作性*** - 打破生态孤岛，扩展使用场景",
      "- 💰 ***智能定价*** - 债券曲线机制确保流动性和价格稳定",
      "- 🌱 ***可持续激励*** - 创新的铸造和版税机制促进生态健康发展"
    ].join('\n'),
    whyFlip: [
      "## 🤔 为什么选择FLIP？",
      "**对于创作者：**",
      "- *快速启动*：通过我们的平台快速启动NFT项目",
      "- *低成本*：项目启动成本与在Uniswap上创建池子相当",
      "- *无下架风险*：无需担心被中心化市场下架 \n",
      "**对于交易者：**",
      "- *公平启动*：在项目早期以较低价格购买",
      "- *随时买卖*：无需担心NFT无法出售直到归零",
      "- *快速交易*：无需等待订单匹配",
    ].join('\n'),
    roadmap: [
      "## 📜 路线图",
      "- *第一阶段* ✅ - 实现债券曲线 NFT",
      "- *第二阶段* ✅ - 实现链上订单簿 NFT 交易",
      "- *第三阶段* ✅ - 实现自托管 NFT DEX",
      "- *第四阶段* ✅ - 实现 NFT 跨链功能"
    ].join('\n'),
  }
};

export default function Litepaper() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <main className="flex justify-center px-2 sm:px-6 lg:px-8 py-8 pt-20 bg-black">
        <div className="max-w-5xl w-full">
          <div className="border border-border bg-bg-card/70 rounded-3xl p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3 text-secondary">
                <span
                  onClick={() => setLanguage('en')}
                  className={`cursor-pointer text-sm sm:text-base font-semibold tracking-[0.4em] ${language === 'en' ? 'text-white underline underline-offset-4 decoration-flip-primary/70' : 'text-secondary hover:text-white/80'}`}
                >
                  EN
                </span>
                <span className="text-secondary text-sm sm:text-base">|</span>
                <span
                  onClick={() => setLanguage('zh')}
                  className={`cursor-pointer text-sm sm:text-base font-semibold tracking-[0.4em] ${language === 'zh' ? 'text-white underline underline-offset-4 decoration-flip-primary/70' : 'text-secondary hover:text-white/80'}`}
                >
                  中文
                </span>
              </div>
              <a
                href="https://www.docs.flipnft.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-sm sm:text-base font-semibold uppercase tracking-[0.3em] border border-border px-3 py-2 rounded hover:border-flip-primary/60"
              >
                {language === 'en' ? 'More Details' : '查看详情'}
              </a>
            </div>

            <div className="flip-typo space-y-12 leading-relaxed prose max-w-full text-white
              prose-h1:text-white prose-h2:text-white prose-h3:text-white
              prose-p:text-white/90 prose-li:text-white/80
              prose-strong:text-white
              prose-h1:text-3xl sm:prose-h1:text-5xl prose-h1:font-bold prose-h1:tracking-tight
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-semibold prose-h2:tracking-wide
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:font-medium
              prose-p:text-base sm:prose-p:text-lg prose-p:font-light prose-p:leading-8
              prose-li:text-base sm:prose-li:text-lg prose-li:font-light prose-li:leading-7
              [--tw-prose-borders:rgba(255,255,255,0.15)]
              prose-code:text-white/80 prose-code:bg-[#141414]
              prose-pre:bg-[#0d0d0d] prose-pre:text-white/80">
            <ReactMarkdown>
              {content[language].title}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].intro}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].challengeIntro}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].challenges}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].previousExploration}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].introduce}
            </ReactMarkdown>

            <div className="flex justify-center items-center overflow-hidden">
              <img
                src="/flip-flow.png"
                alt="FLIP"
                className="w-[100%] object-contain"
              />
            </div>

            <ReactMarkdown>
              {content[language].bondingCurve}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].liquidityMechanism}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].smartContract}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].crossChain}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].conclusion}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].solutions}
            </ReactMarkdown>

            <ReactMarkdown>
              {content[language].whyFlip}
            </ReactMarkdown>

            <div className="my-16 border-t border-[#4CAF50]/30" />

            <ReactMarkdown>
              {content[language].roadmap}
            </ReactMarkdown>
          </div>

        </div>
      </div>
    </main>
    <style jsx global>{`
      /* Base font for the article area */
      .flip-typo {
        font-family: 'Sora', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      /* Headings: stronger display font */
      .flip-typo h1, .flip-typo h2, .flip-typo h3 {
        font-family: 'Space Grotesk', 'Sora', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      /* Paragraphs and lists */
      .flip-typo p, .flip-typo li, .flip-typo td, .flip-typo th, .flip-typo span {
        font-family: 'Sora', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        font-weight: 300;
        letter-spacing: 0.01em;
      }
      .flip-typo strong { font-weight: 600; }
      /* Code blocks keep monospace but align with theme */
      .flip-typo code, .flip-typo pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    `}</style>
    </>
  );
};
