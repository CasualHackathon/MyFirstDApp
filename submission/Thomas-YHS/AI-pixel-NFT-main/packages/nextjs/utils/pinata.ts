"server only";

import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.NEXT_PUBLIC_PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

// 导出类型定义
export interface PinataUploadResult {
  cid: string;
  url: string;
  size: number;
  timestamp: string;
}

export interface PinataMetadataResult {
  cid: string;
  url: string;
  metadata: any;
}
