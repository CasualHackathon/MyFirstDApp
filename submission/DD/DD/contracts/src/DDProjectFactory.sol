// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DDToken.sol";
import "./DDProject.sol";

contract DDProjectFactory is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    DDToken public ddToken;
    
    struct ProjectSummary {
        uint256 projectId;
        address projectAddress;
        string name;
        string category;
        address creator;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(uint256 => address) public projects; // projectId => projectAddress
    mapping(address => uint256) public projectAddressToId; // projectAddress => projectId
    mapping(address => uint256[]) public userProjects; // user => projectIds[]
    
    uint256 public nextProjectId = 1;
    uint256 public totalProjects = 0;
    
    event ProjectCreated(uint256 indexed projectId, address indexed projectAddress, string name, address indexed creator);
    event ProjectDeactivated(uint256 indexed projectId, address indexed projectAddress);
    event ProjectReactivated(uint256 indexed projectId, address indexed projectAddress);
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "DDProjectFactory: admin role required");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "DDProjectFactory: operator role required");
        _;
    }
    
    constructor(address _ddToken) {
        ddToken = DDToken(_ddToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
    function createProject(
        string memory _name,
        address _contractAddress,
        string memory _website,
        string memory _github,
        string memory _apiDoc,
        string memory _description,
        string memory _category
    ) external returns (uint256 projectId, address projectAddress) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_contractAddress != address(0), "Contract address cannot be zero");
        
        projectId = nextProjectId++;
        
        // 创建新的项目合约
        DDProject newProject = new DDProject(
            address(ddToken),
            address(this),
            _name,
            _contractAddress,
            _website,
            _github,
            _apiDoc,
            _description,
            _category,
            msg.sender
        );
        
        projectAddress = address(newProject);
        
        // 记录项目信息
        projects[projectId] = projectAddress;
        projectAddressToId[projectAddress] = projectId;
        userProjects[msg.sender].push(projectId);
        totalProjects++;
        
        emit ProjectCreated(projectId, projectAddress, _name, msg.sender);
        
        return (projectId, projectAddress);
    }
    
    function getProject(uint256 _projectId) internal view returns (ProjectSummary memory) {
        address projectAddress = projects[_projectId];
        require(projectAddress != address(0), "Project does not exist");
        
        DDProject project = DDProject(projectAddress);
        DDProject.ProjectInfo memory info = project.getProjectInfo();
        
        return ProjectSummary({
            projectId: _projectId,
            projectAddress: projectAddress,
            name: info.name,
            category: info.category,
            creator: info.creator,
            createdAt: info.createdAt,
            isActive: info.isActive
        });
    }
    
    function getProjectByAddress(address _projectAddress) external view returns (ProjectSummary memory) {
        uint256 projectId = projectAddressToId[_projectAddress];
        require(projectId > 0, "Project does not exist");
        
        return getProject(projectId);
    }
    
    function getUserProjects(address _user) external view returns (uint256[] memory) {
        return userProjects[_user];
    }
    
    function getAllProjects(uint256 _start, uint256 _limit) external view returns (ProjectSummary[] memory) {
        require(_start < totalProjects, "Start index out of bounds");
        
        uint256 end = _start + _limit;
        if (end > totalProjects) {
            end = totalProjects;
        }
        
        uint256 count = end - _start;
        ProjectSummary[] memory result = new ProjectSummary[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 projectId = _start + i + 1; // +1 because projectId starts from 1
            result[i] = getProject(projectId);
        }
        
        return result;
    }
    
    function getProjectsByCategory(string memory _category) external view returns (ProjectSummary[] memory) {
        uint256[] memory tempIds = new uint256[](totalProjects);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalProjects; i++) {
            address projectAddress = projects[i];
            if (projectAddress != address(0)) {
                DDProject project = DDProject(projectAddress);
                DDProject.ProjectInfo memory info = project.getProjectInfo();
                
                if (keccak256(bytes(info.category)) == keccak256(bytes(_category))) {
                    tempIds[count] = i;
                    count++;
                }
            }
        }
        
        ProjectSummary[] memory result = new ProjectSummary[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = getProject(tempIds[i]);
        }
        
        return result;
    }
    
    function searchProjects(string memory _searchTerm) external view returns (ProjectSummary[] memory) {
        uint256[] memory tempIds = new uint256[](totalProjects);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalProjects; i++) {
            address projectAddress = projects[i];
            if (projectAddress != address(0)) {
                DDProject project = DDProject(projectAddress);
                DDProject.ProjectInfo memory info = project.getProjectInfo();
                
                // 搜索名称和描述
                if (containsString(info.name, _searchTerm) || 
                    containsString(info.description, _searchTerm)) {
                    tempIds[count] = i;
                    count++;
                }
            }
        }
        
        ProjectSummary[] memory result = new ProjectSummary[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = getProject(tempIds[i]);
        }
        
        return result;
    }
    
    function deactivateProject(uint256 _projectId) external onlyAdmin {
        address projectAddress = projects[_projectId];
        require(projectAddress != address(0), "Project does not exist");
        
        DDProject project = DDProject(projectAddress);
        project.emergencyPause();
        
        emit ProjectDeactivated(_projectId, projectAddress);
    }
    
    function reactivateProject(uint256 _projectId) external onlyAdmin {
        address projectAddress = projects[_projectId];
        require(projectAddress != address(0), "Project does not exist");
        
        DDProject project = DDProject(projectAddress);
        project.emergencyResume();
        
        emit ProjectReactivated(_projectId, projectAddress);
    }
    
    function getProjectStats() external view returns (
        uint256 totalProjectsCount,
        uint256 activeProjectsCount,
        uint256 totalCategories
    ) {
        totalProjectsCount = totalProjects;
        
        // 计算活跃项目数量
        for (uint256 i = 1; i <= totalProjects; i++) {
            address projectAddress = projects[i];
            if (projectAddress != address(0)) {
                DDProject project = DDProject(projectAddress);
                DDProject.ProjectInfo memory info = project.getProjectInfo();
                if (info.isActive) {
                    activeProjectsCount++;
                }
            }
        }
        
        // 计算分类数量（简化实现）
        totalCategories = 10; // 可以根据需要调整或实现更复杂的统计
        
        return (totalProjectsCount, activeProjectsCount, totalCategories);
    }
    
    // 辅助函数：检查字符串是否包含子字符串
    function containsString(string memory _source, string memory _search) internal pure returns (bool) {
        bytes memory source = bytes(_source);
        bytes memory search = bytes(_search);
        
        if (search.length > source.length) {
            return false;
        }
        
        for (uint256 i = 0; i <= source.length - search.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < search.length; j++) {
                if (source[i + j] != search[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        
        return false;
    }
}
