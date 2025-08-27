import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Edit, AlertTriangle, Download, MessageSquare, Clock, User, Tag, Globe, Github, FileText } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { useProjectStore } from '../store/projectStore';
import { ContractService } from '../services/contractService';
import { ProjectInfo, UpdateRecord, UpdateProjectForm, ProjectDetailProps } from '../types';
import UpdateProjectModal from './UpdateProjectModal';
import ChallengeModal from './ChallengeModal';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f7fafc;
  }
`;

const ProjectHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ProjectTitle = styled.h1`
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProjectIcon = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const ProjectMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MetaLabel = styled.span`
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const MetaValue = styled.span`
  color: #2d3748;
  font-weight: 500;
`;

const ProjectDescription = styled.p`
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
  font-size: 1.1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'secondary': return '#f7fafc';
      case 'danger': return '#fed7d7';
      default: return '#f7fafc';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return 'white';
      case 'secondary': return '#4a5568';
      case 'danger': return '#c53030';
      default: return '#4a5568';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return 'transparent';
      case 'secondary': return '#e2e8f0';
      case 'danger': return '#feb2b2';
      default: return '#e2e8f0';
    }
  }};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UpdateHistory = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UpdateCard = styled.div<{ isChallenged: boolean }>`
  background: ${props => props.isChallenged ? '#fef5e7' : '#f7fafc'};
  border: 1px solid ${props => props.isChallenged ? '#f6ad55' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const UpdateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UpdateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UpdateVersion = styled.span`
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
`;

const UpdateTimestamp = styled.span`
  color: #718096;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UpdateReason = styled.p`
  color: #4a5568;
  margin: 0 0 1rem 0;
  font-style: italic;
`;

const UpdateDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #2d3748;
  font-size: 0.9rem;
  word-break: break-all;
`;

const ChallengeStatus = styled.div<{ isChallenged: boolean }>`
  background: ${props => props.isChallenged ? '#fed7d7' : '#c6f6d5'};
  color: ${props => props.isChallenged ? '#c53030' : '#38a169'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e53e3e;
`;



const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectAddress, onBack }) => {
  const { signer } = useWeb3();
  const { selectedProject, setSelectedProject, updateRecords, setUpdateRecords, setLoading, setError } = useProjectStore();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateRecord | null>(null);

  useEffect(() => {
    if (signer) {
      loadProjectInfo();
      loadUpdateRecords();
    }
  }, [signer, projectAddress]);

  const loadProjectInfo = async () => {
    if (!signer) return;
    
    try {
      setLoading(true);
      const contractService = new ContractService(signer);
      const projectInfo = await contractService.getProjectInfo(projectAddress);
      setSelectedProject(projectInfo);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load project info');
    } finally {
      setLoading(false);
    }
  };

  const loadUpdateRecords = async () => {
    if (!signer) return;
    
    try {
      const contractService = new ContractService(signer);
      const records: UpdateRecord[] = [];
      
      // Load update records for current version and previous versions
      if (selectedProject) {
        for (let i = 1; i <= selectedProject.currentVersion; i++) {
          try {
            const record = await contractService.getUpdateRecord(projectAddress, i);
            records.push(record);
          } catch (error) {
            console.warn(`Failed to fetch update record ${i}:`, error);
          }
        }
      }
      
      setUpdateRecords(records);
    } catch (error) {
      console.error('Error loading update records:', error);
    }
  };

  const handleUpdateProject = () => {
    setShowUpdateModal(true);
  };

  const handleChallengeUpdate = (update: UpdateRecord) => {
    setSelectedUpdate(update);
    setShowChallengeModal(true);
  };

  const exportToJson = () => {
    if (!selectedProject) return;
    
    const exportData = {
      project: selectedProject,
      updates: updateRecords,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `dd-project-${selectedProject.name}-${Date.now()}.json`;
    link.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!selectedProject) {
    return (
      <Container>
        <LoadingState>Loading project information...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={onBack}>
        <ArrowLeft />
        Back to Projects
      </BackButton>

      <ProjectHeader>
        <ProjectTitle>
          <ProjectIcon>
            <MessageSquare />
          </ProjectIcon>
          {selectedProject.name}
        </ProjectTitle>

        <ProjectMeta>
          <MetaItem>
            <MetaLabel>
              <User />
              Creator
            </MetaLabel>
            <MetaValue>{formatAddress(selectedProject.creator)}</MetaValue>
          </MetaItem>
          
          <MetaItem>
            <MetaLabel>
              <Tag />
              Category
            </MetaLabel>
            <MetaValue>{selectedProject.category}</MetaValue>
          </MetaItem>
          
          <MetaItem>
            <MetaLabel>
              <Clock />
              Created
            </MetaLabel>
            <MetaValue>{formatDate(selectedProject.createdAt)}</MetaValue>
          </MetaItem>
          
          <MetaItem>
            <MetaLabel>
              <MessageSquare />
              Version
            </MetaLabel>
            <MetaValue>{selectedProject.currentVersion}</MetaValue>
          </MetaItem>
        </ProjectMeta>

        <ProjectDescription>{selectedProject.description}</ProjectDescription>

        <ActionButtons>
          <ActionButton variant="primary" onClick={handleUpdateProject}>
            <Edit />
            Update Project
          </ActionButton>
          
          <ActionButton onClick={exportToJson}>
            <Download />
            Export JSON
          </ActionButton>
        </ActionButtons>
      </ProjectHeader>

      <UpdateHistory>
        <SectionTitle>
          <MessageSquare />
          Update History
        </SectionTitle>

        {updateRecords.length === 0 ? (
          <p>No updates found for this project.</p>
        ) : (
          updateRecords.map((update) => (
            <UpdateCard key={update.versionId} isChallenged={update.isChallenged}>
              <UpdateHeader>
                <UpdateInfo>
                  <UpdateVersion>Version {update.versionId}</UpdateVersion>
                  <UpdateTimestamp>
                    <Clock />
                    {formatDate(update.timestamp)}
                  </UpdateTimestamp>
                </UpdateInfo>
                
                <ChallengeStatus isChallenged={update.isChallenged}>
                  {update.isChallenged ? (
                    <>
                      <AlertTriangle />
                      Challenged
                    </>
                  ) : (
                    <>
                      <MessageSquare />
                      Active
                    </>
                  )}
                </ChallengeStatus>
              </UpdateHeader>

              <UpdateReason>"{update.updateReason}"</UpdateReason>

              <UpdateDetails>
                <DetailItem>
                  <DetailLabel>Name</DetailLabel>
                  <DetailValue>{update.name}</DetailValue>
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>Contract</DetailLabel>
                  <DetailValue>{formatAddress(update.contractAddress)}</DetailValue>
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>Updater</DetailLabel>
                  <DetailValue>{formatAddress(update.updater)}</DetailValue>
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>Stake</DetailLabel>
                  <DetailValue>{update.stakeAmount} DD</DetailValue>
                </DetailItem>
              </UpdateDetails>

              {update.isChallenged && (
                <ActionButton
                  variant="danger"
                  onClick={() => handleChallengeUpdate(update)}
                >
                  <AlertTriangle />
                  Challenge Update
                </ActionButton>
              )}
            </UpdateCard>
          ))
        )}
      </UpdateHistory>

      {showUpdateModal && (
        <UpdateProjectModal
          projectAddress={projectAddress}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => {
            setShowUpdateModal(false);
            loadProjectInfo();
            loadUpdateRecords();
          }}
        />
      )}

      {showChallengeModal && selectedUpdate && (
        <ChallengeModal
          projectAddress={projectAddress}
          updateRecord={selectedUpdate}
          onClose={() => {
            setShowChallengeModal(false);
            setSelectedUpdate(null);
          }}
          onSuccess={() => {
            setShowChallengeModal(false);
            setSelectedUpdate(null);
            loadUpdateRecords();
          }}
        />
      )}
    </Container>
  );
};

export default ProjectDetail;
