import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Edit, Database, Globe, Github, FileText, MessageSquare, Coins } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { ContractService } from '../services/contractService';
import { UpdateProjectForm } from '../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f7fafc;
    color: #4a5568;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const StakeInfo = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StakeLabel = styled.div`
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StakeAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background: #fed7d7;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  background: #c6f6d5;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #9ae6b4;
  margin-bottom: 1rem;
`;

interface UpdateProjectModalProps {
  projectAddress: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateProjectModal: React.FC<UpdateProjectModalProps> = ({ projectAddress, onClose, onSuccess }) => {
  const { signer } = useWeb3();
  const [formData, setFormData] = useState<UpdateProjectForm>({
    name: '',
    contractAddress: '',
    website: '',
    github: '',
    apiDoc: '',
    description: '',
    category: 'DeFi',
    updateReason: '',
  });
  
  const [stakeAmount, setStakeAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof UpdateProjectForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const contractService = new ContractService(signer);
      const versionId = await contractService.updateProjectInfo(projectAddress, formData, stakeAmount);
      
      setSuccess(`Project updated successfully! New version: ${versionId}`);
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'DeFi',
    'NFT',
    'Gaming',
    'Infrastructure',
    'DAO',
    'Privacy',
    'Scalability',
    'Cross-chain',
    'Other'
  ];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Edit />
            Update DD Project
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <StakeInfo>
          <StakeLabel>
            <Coins />
            Required Stake Amount
          </StakeLabel>
          <StakeAmount>{stakeAmount} DD</StakeAmount>
          <small>Minimum stake required to update project information</small>
        </StakeInfo>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <Database />
              Project Name
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter new project name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Database />
              Contract Address
            </Label>
            <Input
              type="text"
              value={formData.contractAddress}
              onChange={(e) => handleInputChange('contractAddress', e.target.value)}
              placeholder="0x..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Globe />
              Website
            </Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://..."
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Github />
              GitHub Repository
            </Label>
            <Input
              type="url"
              value={formData.github}
              onChange={(e) => handleInputChange('github', e.target.value)}
              placeholder="https://github.com/..."
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <FileText />
              API Documentation
            </Label>
            <Input
              type="url"
              value={formData.apiDoc}
              onChange={(e) => handleInputChange('apiDoc', e.target.value)}
              placeholder="https://..."
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <MessageSquare />
              Description
            </Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project updates..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              <MessageSquare />
              Update Reason
            </Label>
            <TextArea
              value={formData.updateReason}
              onChange={(e) => handleInputChange('updateReason', e.target.value)}
              placeholder="Explain why you're updating this project..."
              required
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UpdateProjectModal;
