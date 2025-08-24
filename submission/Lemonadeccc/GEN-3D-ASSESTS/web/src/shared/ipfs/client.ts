import { PinataSDK } from 'pinata';

// 初始化 Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway:
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
});

// IPFS 相关类型定义
export interface IPFSUploadResult {
  ipfsHash: string;
  pinataUrl: string;
  gatewayUrl: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // 3D 模型特定属性
  animation_url?: string; // 3D模型文件URL
  model_url?: string; // 主要模型文件
  texture_urls?: string[]; // 纹理文件URLs
  thumbnail_url?: string; // 缩略图URL
  video_url?: string; // 预览视频URL
  // Meshy AI 相关
  meshy_task_id: string;
  art_style: string;
  mode: 'preview' | 'refine';
  polycount?: number;
  created_at: string;
}

/**
 * 使用Pinata V1 API上传JSON到IPFS
 */
async function uploadJSONWithV1API(jsonData: any): Promise<IPFSUploadResult> {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!jwt) {
    throw new Error('Pinata JWT not configured');
  }

  console.log('Uploading to Pinata V1 API...');
  console.log('JWT configured:', !!jwt);
  console.log('Data size:', JSON.stringify(jsonData).length, 'characters');

  const requestBody = {
    pinataContent: jsonData,
    pinataMetadata: {
      name: `nft-metadata-${Date.now()}`,
      keyvalues: {
        type: 'nft-metadata',
        created: new Date().toISOString(),
      },
    },
  };

  console.log('Request body prepared, making API call...');

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Pinata API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      throw new Error(`Pinata API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const result = await response.json();
    console.log('Upload successful, IPFS hash:', result.IpfsHash);
    
    return {
      ipfsHash: result.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error('V1 API upload failed:', error);
    throw error;
  }
}

/**
 * 上传文件到 IPFS
 */
export async function uploadFileToIPFS(file: File): Promise<IPFSUploadResult> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    // 先尝试使用SDK（公开网络）
    try {
      const upload = await pinata.upload.public.file(file);
      const cid = upload.cid;
      return {
        ipfsHash: cid,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      };
    } catch (sdkError) {
      console.warn('SDK upload failed, trying V1 API:', sdkError);
      // 如果SDK失败，使用V1 API
      throw new Error('File upload with V1 API not implemented yet');
    }
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * 上传 JSON 元数据到 IPFS
 */
export async function uploadJSONToIPFS(
  jsonData: any
): Promise<IPFSUploadResult> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('Pinata JWT not configured');
    }

    console.log('Starting JSON upload to IPFS...');
    console.log('Pinata instance type:', typeof pinata);
    console.log('Pinata instance keys:', Object.keys(pinata || {}));
    
    // 直接使用V1 API，避免SDK兼容性问题
    console.log('Using V1 API directly for better compatibility');
    return await uploadJSONWithV1API(jsonData);
    
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 创建并上传 NFT 元数据
 */
export async function createAndUploadNFTMetadata(
  name: string,
  description: string,
  imageUrl: string,
  meshyTaskData: {
    taskId: string;
    modelUrl: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    textureUrls?: string[];
    artStyle: string;
    mode: 'preview' | 'refine';
    polycount?: number;
  },
  additionalAttributes: Array<{
    trait_type: string;
    value: string | number;
  }> = []
): Promise<IPFSUploadResult> {
  try {
    // 构建 NFT 元数据
    const metadata: NFTMetadata = {
      name,
      description,
      image: imageUrl,
      external_url: `${window.location.origin}/nft`,
      animation_url: meshyTaskData.modelUrl,
      model_url: meshyTaskData.modelUrl,
      texture_urls: meshyTaskData.textureUrls || [],
      thumbnail_url: meshyTaskData.thumbnailUrl,
      video_url: meshyTaskData.videoUrl,
      meshy_task_id: meshyTaskData.taskId,
      art_style: meshyTaskData.artStyle,
      mode: meshyTaskData.mode,
      polycount: meshyTaskData.polycount,
      created_at: new Date().toISOString(),
      attributes: [
        {
          trait_type: 'Art Style',
          value: meshyTaskData.artStyle,
        },
        {
          trait_type: 'Mode',
          value: meshyTaskData.mode,
        },
        {
          trait_type: 'Has Texture',
          value: (meshyTaskData.textureUrls?.length || 0) > 0 ? 'Yes' : 'No',
        },
        {
          trait_type: 'Created At',
          value: new Date().toLocaleDateString(),
        },
        ...additionalAttributes,
      ],
    };

    if (meshyTaskData.polycount) {
      metadata.attributes.push({
        trait_type: 'Polycount',
        value: meshyTaskData.polycount,
      });
    }

    return await uploadJSONToIPFS(metadata);
  } catch (error) {
    console.error('Error creating and uploading NFT metadata:', error);
    throw new Error('Failed to create NFT metadata');
  }
}

export { pinata };
