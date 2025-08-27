import React, { useState } from 'react';
import styled from 'styled-components';
import { X, AlertTriangle, MessageSquare, Coins } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { ContractService } from '../services/contractService';
import { UpdateRecord } from '../types';

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
  max-width: 500px;
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

const UpdateInfo = styled.div`
  background: #fef5e7;
  border: 1px solid #f6ad55;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const UpdateTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #c05621;
  font-size: 1.1rem;
`;

const UpdateDetails = styled.div`
  color: #744210;
  font-size: 0.9rem;
  line-height: 1.4;
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

const StakeInfo = styled.div`
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StakeLabel = styled.div`
  font-weight: 500;
  color: #c53030;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StakeAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #c53030;
`;

const WarningText = styled.p`
  color: #c53030;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
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
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(229, 62, 62, 0.4);
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

interface ChallengeModalProps {
  projectAddress: string;
  updateRecord: UpdateRecord;
  onClose: () => void;
  onSuccess: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ projectAddress, updateRecord, onClose, onSuccess }) => {
  const { signer } = useWeb3();
  const [challengeReason, setChallengeReason] = useState('');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer) {
      setError('Wallet not connected');
      return;
    }

    if (!challengeReason.trim()) {
      setError('Please provide a reason for the challenge');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const contractService = new ContractService(signer);
      await contractService.challengeUpdate(
        projectAddress,
        updateRecord.versionId,
        challengeReason,
        stakeAmount
      );
      
      setSuccess('Challenge submitted successfully!');
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit challenge');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <AlertTriangle />
            Challenge Update
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <UpdateInfo>
          <UpdateTitle>Update Being Challenged</UpdateTitle>
          <UpdateDetails>
            <strong>Version {updateRecord.versionId}</strong> by {formatAddress(updateRecord.updater)}<br />
            <strong>Reason:</strong> "{updateRecord.updateReason}"<br />
            <strong>Stake:</strong> {updateRecord.stakeAmount} DD<br />
            <strong>Submitted:</strong> {formatDate(updateRecord.timestamp)}
          </UpdateDetails>
        </UpdateInfo>

        <StakeInfo>
          <StakeLabel>
            <Coins />
            Challenge Stake Amount
          </StakeLabel>
          <StakeAmount>{stakeAmount} DD</StakeAmount>
          <WarningText>
            <strong>Warning:</strong> You must stake at least the same amount as the original update to challenge it. 
            If your challenge fails, you will lose your stake.
          </WarningText>
        </StakeInfo>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <MessageSquare />
              Challenge Reason
            </Label>
            <TextArea
              value={challengeReason}
              onChange={(e) => setChallengeReason(e.target.value)}
              placeholder="Explain why you're challenging this update..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Coins />
              Stake Amount (DD)
            </Label>
            <Input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min={updateRecord.stakeAmount}
              step="0.01"
              required
            />
            <small>Minimum: {updateRecord.stakeAmount} DD</small>
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Challenge'}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChallengeModal;
