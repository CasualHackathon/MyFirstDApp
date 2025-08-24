/**
 * IPFS 存储服务
 * 使用 nft.storage v1 API 进行去中心化存储
 * nft.storage 是专门为 NFT 优化的免费 IPFS 存储服务
 * 提供持久化存储和 Filecoin 备份
 *
 * API 文档: https://app.nft.storage/v1/docs/client/http-api
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

export interface UploadResult {
  imageUrl: string;
  metadataUrl: string;
  imageCid: string;
  metadataCid: string;
}

export interface NFTCollection {
  collectionID: string;
  collectionName: string;
  contractAddress: string;
  chainID: string;
  network: string;
}

export interface NFTToken {
  tokenID: string;
  cid: string;
}

/**
 * 将图片上传到IPFS
 */
export async function uploadImageToIPFS(imageDataUrl: string, filename: string): Promise<string> {
  try {
    // 从环境变量获取 nft.storage API token
    const nftStorageToken = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;

    if (!nftStorageToken) {
      console.warn("NEXT_PUBLIC_NFT_STORAGE_TOKEN not configured, using fallback storage");
      return await uploadToFallbackIPFS(imageDataUrl, filename);
    }

    return await uploadToNFTStorage(imageDataUrl, filename, nftStorageToken);
  } catch (error) {
    // TODO 需要修改上传失败后的错误处理，目前是使用fallback
    console.error("IPFS upload failed:", error);
    // 失败时使用fallback
    console.warn("NFT.Storage upload failed, using fallback storage");
    return await uploadToFallbackIPFS(imageDataUrl, filename);
  }
}

/**
 * 上传metadata到IPFS
 * TODO 貌似元数据不能上传到nft.storage，需要使用其他方式
 */
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  try {
    // 从环境变量获取 nft.storage API token
    const nftStorageToken = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;

    if (!nftStorageToken) {
      console.warn("NEXT_PUBLIC_NFT_STORAGE_TOKEN not configured, using fallback storage");
      return await uploadJSONToFallbackIPFS(metadata);
    }

    return await uploadJSONToNFTStorage(metadata, nftStorageToken);
  } catch (error) {
    console.error("Metadata upload failed:", error);
    // 失败时使用fallback
    console.warn("NFT.Storage metadata upload failed, using fallback storage");
    return await uploadJSONToFallbackIPFS(metadata);
  }
}

/**
 * 完整的NFT上传流程（使用新的 nft.storage v1 API）
 */
export async function uploadCompleteNFT(
  imageDataUrl: string,
  metadata: Omit<NFTMetadata, "image">,
  contractAddress?: string,
  tokenID?: string,
): Promise<UploadResult> {
  try {
    // 1. 上传图片
    const imageUrl = await uploadImageToIPFS(imageDataUrl, `nft-${Date.now()}.png`);

    // 2. 创建完整的metadata
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageUrl,
    };

    // 3. 上传metadata
    const metadataUrl = await uploadMetadataToIPFS(completeMetadata);

    const result = {
      imageUrl,
      metadataUrl,
      imageCid: extractCidFromUrl(imageUrl),
      metadataCid: extractCidFromUrl(metadataUrl),
    };

    // 4. 如果提供了合约地址和tokenID，尝试添加到集合（可选）
    if (contractAddress && tokenID) {
      try {
        const nftStorageToken = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;
        if (nftStorageToken) {
          const collectionID = await getOrCreateWeatherNFTCollection(contractAddress, nftStorageToken);
          await addTokenToCollection(collectionID, tokenID, result.metadataCid, nftStorageToken);
          console.log(`Token ${tokenID} added to collection ${collectionID}`);
        }
      } catch (collectionError) {
        console.warn("Failed to add token to collection:", collectionError);
        // 不影响主要上传流程
      }
    }

    return result;
  } catch (error) {
    console.error("Complete NFT upload failed:", error);
    throw error;
  }
}

/**
 * 创建 NFT 集合
 */
async function createNFTCollection(
  collectionName: string,
  contractAddress: string,
  chainID: string,
  network: string,
  token: string,
): Promise<string> {
  const response = await fetch("https://preserve.nft.storage/api/v1/collection/create_collection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      collectionName,
      contractAddress,
      chainID,
      network,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NFT.Storage collection creation failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.collectionID || "collection_created";
}

/**
 * 使用 nft.storage 上传单个文件（通用方法）
 */
async function uploadFileToNFTStorage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`NFT.Storage upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  const result = await uploadResponse.json();
  return result.value?.cid || result.cid;
}

/**
 * 使用 nft.storage 上传图片
 */
async function uploadToNFTStorage(imageDataUrl: string, filename: string, token: string): Promise<string> {
  // 将data URL转换为File对象
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  const file = new File([blob], filename, { type: blob.type });

  const cid = await uploadFileToNFTStorage(file, token);
  return `ipfs://${cid}`;
}

/**
 * 使用 nft.storage 上传JSON
 */
async function uploadJSONToNFTStorage(data: any, token: string): Promise<string> {
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const file = new File([jsonBlob], "metadata.json", { type: "application/json" });

  const cid = await uploadFileToNFTStorage(file, token);
  return `ipfs://${cid}`;
}

/**
 * 获取或创建 WeatherNFT 集合
 */
export async function getOrCreateWeatherNFTCollection(contractAddress: string, token: string): Promise<string> {
  try {
    // 首先尝试列出现有集合
    const collections = await listNFTCollections(token);

    // 查找是否已存在 WeatherNFT 集合
    const existingCollection = collections.find(
      (col: any) => col.contractAddress === contractAddress && col.collectionName === "AI Weather Moment NFT",
    );

    if (existingCollection) {
      return existingCollection.collectionID;
    }

    // 如果不存在，创建新集合
    return await createNFTCollection(
      "AI Weather Moment NFT",
      contractAddress,
      "31337", // 本地开发链ID，生产环境需要更改
      "Ethereum",
      token,
    );
  } catch (error) {
    console.error("Failed to get or create collection:", error);
    throw error;
  }
}

/**
 * 列出所有 NFT 集合
 */
async function listNFTCollections(token: string): Promise<any[]> {
  const response = await fetch("https://preserve.nft.storage/api/v1/collection/list_collections", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NFT.Storage list collections failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.collections || [];
}

/**
 * 将 token 添加到集合（根据文档需要 CSV 格式）
 */
export async function addTokenToCollection(
  collectionID: string,
  tokenID: string,
  cid: string,
  token: string,
): Promise<void> {
  // 创建 CSV 内容
  const csvContent = `tokenID,cid\n${tokenID},${cid}`;
  const csvBlob = new Blob([csvContent], { type: "text/csv" });
  const csvFile = new File([csvBlob], "tokens.csv", { type: "text/csv" });

  const formData = new FormData();
  formData.append("collectionID", collectionID);
  formData.append("file", csvFile);

  const response = await fetch("https://preserve.nft.storage/api/v1/collection/add_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NFT.Storage add tokens failed: ${response.status} - ${errorText}`);
  }
}

/**
 * Fallback IPFS上传（演示用模拟存储）
 */
async function uploadToFallbackIPFS(imageDataUrl: string, filename: string): Promise<string> {
  // 为了演示，创建一个模拟的CID
  const mockCid = generateMockCID(imageDataUrl + filename);
  console.log(`Fallback IPFS upload: ${filename} -> ${mockCid}`);
  return `ipfs://${mockCid}`;
}

/**
 * TODO Fallback JSON上传（演示用模拟存储）
 */
async function uploadJSONToFallbackIPFS(data: any): Promise<string> {
  const jsonString = JSON.stringify(data, null, 2);
  const mockCid = generateMockCID(jsonString);
  console.log(`Fallback metadata upload -> ${mockCid}`);
  return `ipfs://${mockCid}`;
}

/**
 * TODO 生成模拟的CID（用于演示）
 */
function generateMockCID(content: string): string {
  // 使用简单的哈希生成模拟CID
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const positiveHash = Math.abs(hash);
  const mockCid = `Qm${positiveHash.toString(36).padStart(44, "0")}`;

  return mockCid;
}

/**
 * 从IPFS URL中提取CID
 */
function extractCidFromUrl(ipfsUrl: string): string {
  return ipfsUrl.replace("ipfs://", "");
}

/**
 * 将IPFS URL转换为HTTP网关URL
 */
export function ipfsToHttp(ipfsUrl: string, gateway = "https://ipfs.io/ipfs/"): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", gateway);
  }
  return ipfsUrl;
}

/**
 * 根据天气数据创建NFT metadata
 */
export function createWeatherNFTMetadata(weatherData: any, description?: string): NFTMetadata {
  /**
   * 临时使用时间戳作为ID，后续需要修改
   * TODO 需要讨论是否使用其他ID生成方式
   */
  const tokenId = Date.now(); // 临时使用时间戳作为ID

  return {
    name: `Weather Moment #${tokenId} - ${weatherData.city}`,
    description:
      description ||
      `A unique AI-generated poster capturing the weather moment in ${weatherData.city} on ${weatherData.date}. Temperature: ${weatherData.temperature}°C, Conditions: ${weatherData.weather}`,
    /**
     * TODO 需要修改external_url
     * 临时使用域名作为外部URL，后续需要修改
     * TODO 需要讨论是否使用其他URL生成方式
     */
    image: `ipfs://${weatherData.imageCid}`,
    external_url: weatherData.external_url,
    attributes: [
      {
        trait_type: "City",
        value: weatherData.city,
      },
      {
        trait_type: "Country",
        value: weatherData.country,
      },
      {
        trait_type: "Date",
        value: weatherData.date,
      },
      {
        trait_type: "Weather",
        value: weatherData.weather,
      },
      {
        trait_type: "Temperature",
        value: weatherData.temperature,
        display_type: "number",
      },
      {
        trait_type: "Time of Day",
        value: weatherData.timeOfDay,
      },
      {
        trait_type: "Humidity",
        value: weatherData.humidity,
        display_type: "number",
      },
      {
        trait_type: "Wind Speed",
        value: weatherData.windSpeed,
        display_type: "number",
      },
      {
        trait_type: "Latitude",
        value: weatherData.latitude.toFixed(4),
      },
      {
        trait_type: "Longitude",
        value: weatherData.longitude.toFixed(4),
      },
      {
        trait_type: "Weather Code",
        value: weatherData.weatherCode,
        display_type: "number",
      },
    ],
  };
}
