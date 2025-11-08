export const FACTORY_ABI = [
  'function createFLIP(string memory name, string memory symbol, uint256 initialPrice, uint256 maxSupply, uint256 creatorFeePercentage, string memory baseURI) public returns (address)',
  'function calculateFLIPAddress(string memory name, string memory symbol, uint256 initialPrice, uint256 maxSupply, uint256 creatorFeePercentage) public view returns (address)',
  'event FLIPCreated(address indexed creator, address indexed flipAddress, address priceContract, string name, string symbol, uint256 initialPrice, uint256 maxSupply, uint256 creatorFeePercentage)',
];

export const REGISTRY_ABI = [
  'function register(address creator, address contractAddress) public',
  'event ContractRegistered(address creator, address contractAddress)',
];

export const TRADE_ABI = [
  'event Minted(address indexed flipContract, address indexed to, uint256 indexed tokenId, uint256 price)',
  'event Bought(address indexed flipContract, address indexed buyer, uint256 indexed tokenId, uint256 price)',
  'event Sold(address indexed flipContract, address indexed seller, uint256 indexed tokenId, uint256 price)',
  'event BulkBuyExecuted(address indexed flipContract, address indexed buyer, uint256[] tokenIds, uint256 totalPrice)',
  'event BulkSellExecuted(address indexed flipContract, address indexed seller, uint256[] tokenIds, uint256 totalPrice)',
  'event BulkMintExecuted(address indexed flipContract, address indexed buyer, uint256 quantity, uint256 totalPrice)',
  'event BulkQuickBuyExecuted(address indexed flipContract, address indexed buyer, uint256 quantity, uint256 totalPrice)',
  'event QuickBuyExecuted(address indexed flipContract, address indexed buyer, uint256 indexed tokenId, uint256 price)',
];
