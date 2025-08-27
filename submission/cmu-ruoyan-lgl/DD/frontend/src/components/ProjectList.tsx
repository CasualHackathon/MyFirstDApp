import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Database, Calendar, User, Tag, Bug, Search } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useProjectStore } from '../store/projectStore';
import { ContractService } from '../services/contractService';
import { ProjectSummary, ProjectListProps } from '../types';
import CreateProjectModal from './CreateProjectModal';
import NetworkStatus from './NetworkStatus';
import ErrorDisplay from './ErrorDisplay';
import QuickStartGuide from './QuickStartGuide';
import { debugContract, testCreateProject, checkNetwork, analyzeTransaction, verifyContractDeployment, debugProjectCreation, diagnoseContractState } from '../utils/debug';
import { quickDiagnosis } from '../utils/quickDiagnosis';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin: 0;
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProjectIcon = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const ProjectTitle = styled.h3`
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.9rem;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ProjectDescription = styled.p`
  color: #4a5568;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CategoryTag = styled.span`
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  
  button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 1rem;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  
  svg {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusButton = styled.button`
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin-left: 1rem;
  
  &:hover {
    background: rgba(255, 152, 0, 0.2);
    transform: translateY(-1px);
  }
`;

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect }) => {
  const { signer, isConnected, isCorrectNetwork } = useWeb3();
  const { projects, loading, error, setProjects, setLoading, setError } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [contractStatus, setContractStatus] = useState<string>('');

  useEffect(() => {
    if (isConnected && signer) {
      loadProjects();
    }
  }, [isConnected, signer]);

  const loadProjects = async () => {
    if (!signer) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading projects...');
      
      const contractService = new ContractService(signer);
      const projectList = await contractService.getAllProjects();
      
      console.log('Projects loaded:', projectList);
      setProjects(projectList);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = async () => {
    console.log('Project creation successful, refreshing projects...');
    setShowCreateModal(false);
    setRefreshing(true);
    
    // 等待一下让区块链确认
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await loadProjects();
    } finally {
      setRefreshing(false);
    }
  };

  const handleProjectClick = (project: ProjectSummary) => {
    onProjectSelect(project);
  };

  const handleAnalyzeTransaction = async () => {
    if (!signer || !txHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }
    
    try {
      await analyzeTransaction(signer, txHash.trim());
    } catch (error) {
      console.error('Transaction analysis failed:', error);
      alert('Transaction analysis failed. Check console for details.');
    }
  };

  const handleVerifyContracts = async () => {
    if (!signer) return;
    
    try {
      await verifyContractDeployment(signer);
    } catch (error) {
      console.error('Contract verification failed:', error);
    }
  };

  const handleProjectCreationDebug = async () => {
    if (!signer || !txHash.trim()) {
      alert('Please enter a transaction hash from a project creation attempt');
      return;
    }
    
    try {
      await debugProjectCreation(signer, txHash.trim());
    } catch (error) {
      console.error('Project creation debug failed:', error);
      alert('Project creation debug failed. Check console for details.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // 检查合约状态
  const checkContractStatus = async () => {
    if (!signer) return;
    
    setContractStatus('Checking...');
    try {
      const { quickDiagnosis } = await import('../utils/quickDiagnosis');
      await quickDiagnosis(signer);
      setContractStatus('Check complete - see console');
    } catch (error) {
      setContractStatus('Check failed');
      console.error('Contract status check failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <Container>
        <EmptyState>
          <Database />
          <h3>Connect your wallet to view projects</h3>
          <p>Please connect your MetaMask wallet to access the DD Project Manager</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>DD Projects</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StatusButton onClick={checkContractStatus} disabled={!isConnected}>
            {contractStatus || 'Check Contract Status'}
          </StatusButton>
          <ActionButton 
            onClick={() => setShowCreateModal(true)}
            disabled={!isConnected || !isCorrectNetwork}
          >
            {!isConnected ? 'Connect Wallet First' : 
             !isCorrectNetwork ? 'Switch to Sepolia' : 'Create New Project'}
          </ActionButton>
        </div>
      </Header>

      {/* 显示快速启动指南 */}
      {(!isConnected || !isCorrectNetwork) && (
        <QuickStartGuide />
      )}

      {loading && !refreshing ? (
        <LoadingState>
          <p>Loading projects...</p>
        </LoadingState>
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadProjects} />
      ) : projects.length === 0 ? (
        <EmptyState>
          <Database />
          <h3>No projects found</h3>
          <p>Create your first DD project to get started</p>
        </EmptyState>
      ) : (
        <ProjectGrid>
          {projects.map((project) => (
            <ProjectCard key={project.projectId} onClick={() => handleProjectClick(project)}>
              <ProjectHeader>
                <ProjectIcon>
                  <Database />
                </ProjectIcon>
                <ProjectTitle>{project.name}</ProjectTitle>
              </ProjectHeader>
              
              <ProjectMeta>
                <MetaItem>
                  <User />
                  {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                </MetaItem>
                <MetaItem>
                  <Calendar />
                  {formatDate(project.createdAt)}
                </MetaItem>
                <MetaItem>
                  <Tag />
                  <CategoryTag>{project.category}</CategoryTag>
                </MetaItem>
              </ProjectMeta>
              
              <ProjectDescription>
                Project ID: {project.projectId} • Address: {project.projectAddress.slice(0, 6)}...{project.projectAddress.slice(-4)}
              </ProjectDescription>
            </ProjectCard>
          ))}
        </ProjectGrid>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </Container>
  );
};

export default ProjectList;
