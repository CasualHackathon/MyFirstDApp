export interface ProjectSummary {
  projectId: number;
  projectAddress: string;
  name: string;
  category: string;
  creator: string;
  createdAt: number;
  isActive: boolean;
}

export interface ProjectListProps {
  onProjectSelect: (project: ProjectSummary) => void;
}

export interface ProjectDetailProps {
  projectAddress: string;
  onBack: () => void;
}

export interface ProjectInfo {
  name: string;
  contractAddress: string;
  website: string;
  github: string;
  apiDoc: string;
  description: string;
  category: string;
  createdAt: number;
  creator: string;
  isActive: boolean;
  currentVersion: number;
}

export interface UpdateRecord {
  versionId: number;
  timestamp: number;
  name: string;
  contractAddress: string;
  website: string;
  github: string;
  apiDoc: string;
  description: string;
  category: string;
  updater: string;
  stakeAmount: string;
  isChallenged: boolean;
  challengeDeadline: number;
  updateReason: string;
  isVerified: boolean;
  isRolledBack: boolean;
}

export interface Challenge {
  challenger: string;
  stakeAmount: string;
  reason: string;
  timestamp: number;
  isResolved: boolean;
  challengerWon: boolean;
}

export interface CreateProjectForm {
  name: string;
  contractAddress: string;
  website: string;
  github: string;
  apiDoc: string;
  description: string;
  category: string;
}

export interface UpdateProjectForm {
  name: string;
  contractAddress: string;
  website: string;
  github: string;
  apiDoc: string;
  description: string;
  category: string;
  updateReason: string;
}

export interface Web3ContextType {
  account: string | null;
  provider: any;
  signer: any;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  switchToSepolia: () => Promise<void>;
}
