import React, { useState } from 'react';
import styled from 'styled-components';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import NetworkStatus from './components/NetworkStatus';
import DebugPage from './components/DebugPage';
import { ProjectSummary } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f7fafc;
`;

const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);
  const [showDebugPage, setShowDebugPage] = useState(false);

  const handleProjectSelect = (project: ProjectSummary) => {
    setSelectedProject(project);
    setShowDebugPage(false);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setShowDebugPage(false);
  };

  const handleShowDebugPage = () => {
    setShowDebugPage(true);
    setSelectedProject(null);
  };

  const handleBackFromDebug = () => {
    setShowDebugPage(false);
  };

  return (
    <Web3Provider>
      <AppContainer>
        <Header onDebugClick={handleShowDebugPage} />
        <NetworkStatus />
        
        {showDebugPage ? (
          <DebugPage onBack={handleBackFromDebug} />
        ) : selectedProject ? (
          <ProjectDetail
            projectAddress={selectedProject.projectAddress}
            onBack={handleBackToProjects}
          />
        ) : (
          <ProjectList onProjectSelect={handleProjectSelect} />
        )}
      </AppContainer>
    </Web3Provider>
  );
};

export default App;
