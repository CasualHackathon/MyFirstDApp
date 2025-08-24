export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTItem {
  tokenId: number;
  city: string;
  date: string;
  weather: string;
  temperature: number;
  timeOfDay: string;
  imageUrl: string;
  metadataUrl: string;
  timestamp: number;
  minter: string;
  tokenURI: string;
  attributes: NFTAttribute[];
  image: string;
  name: string;
}
