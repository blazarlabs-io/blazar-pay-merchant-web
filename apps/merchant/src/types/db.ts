import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;
  ammount: number;
  dateTime: Timestamp;
  transactionHash: string;
  originWallet: Wallet;
  destinationWallet: Wallet;
  symbol?: string;
  assets?: { [key: string]: number };
}

/////////////////////

export interface Coordinates {
  lat: string;
  lng: string;
}

export interface WineGeneralInfo {
  wineryName: string;
  image: string;
  collectionName: string;
  volume: string;
  type: string;
  grapeVarieties: Grape[];
  country: string;
  cdo?: string;
  collectionSize?: string;
}

export interface Ingredient {
  name: string;
}

export interface WineIngredients {
  rawMaterial: string;
  alcoholByVolume: string;
  sugar: string;
  acidityRegulators?: Ingredient[];
  stabilizers?: Ingredient[];
  finingAgents?: Ingredient[];
  antioxidants?: Ingredient[];
}

export interface WineNutritionalInfo {
  energy?: string;
  fat?: string; // TODO: More info
  carbohydrates?: string; // TODO: More info
  protein?: string;
  salt?: string;
}

export interface Barrel {
  woodType?: string;
  woodOrigin?: string;
  timeOfFermentation?: string;
}

export interface WineProfile {
  color?: string;
  aromaProfile?: string[];
  flavorProfile?: string[];
  perceivedAlcohol: string;
  sweetness?: string;
  acidityLevel?: string;
  taningLevel?: string;
  barrelFermented?: Barrel[];
  awards?: string[];
}

export interface WineMakingTechnique {
  vegan?: boolean | null;
  organic?: boolean | null;
  bioDynamic?: boolean | null;
  natural?: boolean | null;
  fermentationType?: string[];
  yeastType?: string[];
  ageingPotential?: string;
}

export interface Terroir {
  vineyardName?: string;
  cdo?: string;
  sunExposure?: string;
  elevation?: string;
  ageOfVines?: string;
  soilType?: string[];
  irrigationPractices?: string[];
  vineyardLocation?: Coordinates[];
  grapesHarvesing?: {
    method?: string;
    yieldPerHa?: string;
  };
}

export interface Wine {
  uid: string;
  id: string;
  qrCode?: string;
  publicUrl?: string;
  status: "draft" | "published" | "archived";
  isReadyToPublish: boolean;
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  generalInfo: WineGeneralInfo;
  ingredients: WineIngredients;
  nutritionalInfo?: WineNutritionalInfo;
  profile?: WineProfile;
  makingTechnique?: WineMakingTechnique;
  terroir?: Terroir;
  likes?: number;
}

export interface Grape {
  name: string;
  percentage: string;
  vintage: string;
}

export interface Representative {
  name: string;
  email: string;
  phone: string;
}

export interface Settings {
  autosave: boolean;
  language: string;
  theme: string;
}

export interface Certifications {
  name: string;
}

export interface WineryInfo {
  name: string;
  avatar?: string;
  foundedIn?: string;
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
  wineCollections?: string;
  bottlesProduced?: string;
  vineyardsSurface?: string;
  grapeVarieties?: string;
  certifications?: Certifications[];
  headquarters?: Coordinates;
  representative?: Representative;
}

export type PricingLevelOptions = "bronze" | "silver" | "gold" | "platinum";

export interface Billing {
  level: PricingLevelOptions;
}

export interface Winery {
  id: string;
  info: WineryInfo | null;
  settings: Settings;
  billing: Billing | null;
  isVerified: boolean;
}

export interface DbResponse {
  data: any;
  error: any;
  code: number;
}

export interface Sweetness {
  dessert: string[];
  sparkling: string[];
  other: string[];
}

export type Balance = {
  amount: number;
  currency: string;
  asUsd: number | string;
};

export type Utxo = {
  address: string;
  datum: string;
  outputIndex: number;
  txHash: string;
  assets: {
    [key: string]: number;
  };
};

export type Funds = {
  fundsInL1: Utxo[];
  fundsInL2: Utxo[];
  totalInL1: {
    [key: string]: number;
  };
  totalInL2: {
    [key: string]: number;
  };
};

export type Wallet = {
  name: string;
  address: string;
  balance: Balance;
  icon: string;
  transactions?: Transaction[];
  seedPhrase?: string;
  publicKey?: string;
};

export type Asset = {
  name: string;
  symbol: string;
  decimals: number;
  amount: number;
  icon: string;
  selected: boolean;
  assetUnit: string;
};

export type UserData = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  type: "admin" | "merchant" | "client";
  emailVerified: boolean;
  wallet: Wallet | null;
  createdAt: Timestamp;
  lastUpdated: Timestamp;
};
// export type Sweetness = string[];

export interface PricingLevel {
  name: PricingLevelOptions;
  price: number;
  qrCodes: number | string;
  language: {
    description: string;
    available: boolean;
  };
  editable: {
    description: string;
    available: boolean;
  };
  training: {
    description: string;
    available: boolean;
  };
  tokenization: {
    description: string;
    available: boolean;
  };
  analytics: {
    description: string;
    available: boolean;
  };
  earlyAccess: {
    description: string;
    available: boolean;
  };
}

export interface DynamicQrCode {
  uid: string;
  wineId: string;
  imageUrl: string;
  staticUrl: string;
  redirectUrl: string;
  createdAt: Timestamp;
  lastUpdated: Timestamp;
}
