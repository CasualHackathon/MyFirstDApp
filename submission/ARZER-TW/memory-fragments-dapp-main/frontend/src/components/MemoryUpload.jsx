import React, { useState, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  PhotoIcon, 
  DocumentTextIcon, 
  MusicalNoteIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  SparklesIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ContentValidator from '../utils/contentValidator';

const MemoryUpload = ({ onFragmentUploaded, onNavigate, existingFragments = [] }) => {
  const { address } = useAccount();
  const fileInputRef = useRef(null);
  const contentValidator = new ContentValidator();
  
  // 表單狀態
  const [formData, setFormData] = useState({
    content: '',
    tags: [],
    isPublic: false,
    emotionScore: 50,
    fragmentType: 'text',
    title: ''
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // 內容驗證狀態
  const [validation, setValidation] = useState({
    isValidating: false,
    isValidated: false,
    result: null,
    showDetails: false
  });
  
  // 質押系統狀態
  const [qualityStake, setQualityStake] = useState({
    amount: 0,
    required: false,
    accepted: false
  });

  // 情感選項
  const emotionOptions = [
    { value: 20, label: '悲傷', color: 'bg-blue-400', icon: '😢' },
    { value: 40, label: '平靜', color: 'bg-gray-400', icon: '😌' },
    { value: 60, label: '快樂', color: 'bg-yellow-400', icon: '😊' },
    { value: 80, label: '興奮', color: 'bg-orange-400', icon: '🤩' },
    { value: 100, label: '狂喜', color: 'bg-red-400', icon: '🥳' }
  ];

  // 記憶類型選項
  const memoryTypes = [
    { 
      id: 'text', 
      name: '文字記憶', 
      icon: DocumentTextIcon, 
      description: '日記、便條、想法',
      accept: '.txt,.md'
    },
    { 
      id: 'image', 
      name: '視覺記憶', 
      icon: PhotoIcon, 
      description: '照片、圖片、截圖',
      accept: 'image/*'
    },
    { 
      id: 'audio', 
      name: '聲音記憶', 
      icon: MusicalNoteIcon, 
      description: '錄音、音樂、語音',
      accept: 'audio/*'
    }
  ];

  // 處理文件選擇
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, fragmentType: 'image' }));
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/')) {
      setFormData(prev => ({ ...prev, fragmentType: 'audio' }));
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({ ...prev, fragmentType: 'text' }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, content: e.target.result }));
      };
      reader.readAsText(file);
      setFilePreview(null);
    }
  }, []);

  // 拖拽處理
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 添加標籤
  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag('');
    }
  };

  // 移除標籤
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 實時內容驗證
  const validateContent = async () => {
    if (!formData.title || !formData.content) return;
    
    setValidation(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = await contentValidator.comprehensiveValidation(
        formData.content,
        formData.title,
        formData.tags,
        existingFragments
      );
      
      setValidation({
        isValidating: false,
        isValidated: true,
        result,
        showDetails: false
      });
      
      // 根據分數決定是否需要質押
      if (result.finalScore < 70) {
        const stakeAmount = Math.max(0.001, (70 - result.finalScore) * 0.0001);
        setQualityStake({
          amount: stakeAmount,
          required: true,
          accepted: false
        });
      } else {
        setQualityStake({
          amount: 0,
          required: false,
          accepted: false
        });
      }
      
    } catch (error) {
      console.error('驗證失敗:', error);
      setValidation({
        isValidating: false,
        isValidated: false,
        result: { error: '驗證系統暫時不可用' },
        showDetails: false
      });
    }
  };

  // 內容驗證結果組件
  const ValidationResult = () => {
    if (!validation.isValidated || !validation.result) return null;
    
    const { result } = validation;
    
    return (
      <div className="space-y-4">
        {/* 分數顯示 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-memory-700">記憶真實度評分</span>
            <span className={`text-lg font-bold ${
              result.finalScore >= 80 ? 'text-green-600' :
              result.finalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {result.finalScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                result.finalScore >= 80 ? 'bg-green-500' :
                result.finalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.finalScore}%` }}
            />
          </div>
        </div>

        {/* 狀態指示器 */}
        <div className="flex items-center space-x-3 mb-4">
          {result.canSubmit ? (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">可以提交</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">需要改進</span>
            </div>
          )}
          
          {result.similarity?.hasSimilar && (
            <div className="flex items-center text-orange-600">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">發現相似內容</span>
            </div>
          )}
        </div>

        {validation.showDetails && (
          <div className="space-y-4 border-t border-memory-200 pt-4">
            {/* 記憶指標 */}
            {result.memoryIndicators && result.memoryIndicators.length > 0 && (
              <div>
                <h4 className="font-medium text-memory-800 mb-2">✅ 記憶特徵</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.memoryIndicators.map((indicator, index) => (
                    <li key={index} className="text-sm text-green-700">{indicator}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 問題 */}
            {result.issues && result.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-memory-800 mb-2">⚠️ 需要改進</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 建議 */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-memory-800 mb-2">💡 改進建議</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-600">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 質押系統組件
  const QualityStakeComponent = () => {
    if (!qualityStake.required) return null;
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-2">
              需要質押以提交低品質內容
            </h3>
            <p className="text-yellow-700 text-sm mb-4">
              由於內容評分較低（{validation.result?.finalScore}/100），
              需要質押 <span className="font-bold">{qualityStake.amount} ETH</span> 以提交此記憶。
              如果社區驗證為垃圾內容，質押金將被扣除。
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={qualityStake.accepted}
                  onChange={(e) => setQualityStake(prev => ({ ...prev, accepted: e.target.checked }))}
                  className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-yellow-800">
                  我理解並願意支付質押金，承諾這是真實的個人記憶
                </span>
              </label>
              
              <div className="text-xs text-yellow-600 space-y-1">
                <p>• 高品質記憶內容無需質押</p>
                <p>• 質押金會在內容通過社區驗證後退還</p>
                <p>• 重複提交垃圾內容將影響信譽分數</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 模擬IPFS上傳
  const uploadToIPFS = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `QmExample${Date.now()}`;
  };

  // 提交記憶碎片
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address) return;

    if (!validation.isValidated) {
      alert('請先驗證內容品質');
      return;
    }

    if (!validation.result?.canSubmit && (!qualityStake.required || !qualityStake.accepted)) {
      alert('內容品質不符合要求，請改進內容或接受質押條件');
      return;
    }

    setIsUploading(true);
    
    try {
      let contentToUpload = {
        ...formData,
        validationScore: validation.result.finalScore,
        stakeAmount: qualityStake.amount,
        timestamp: Date.now()
      };
      
      if (selectedFile) {
        contentToUpload.file = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        };
      }

      const contentHash = await uploadToIPFS(contentToUpload);

      const fragment = {
        id: Date.now(),
        contentHash,
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        isPublic: formData.isPublic,
        emotionScore: formData.emotionScore,
        fragmentType: formData.fragmentType,
        timestamp: Date.now(),
        owner: address,
        file: selectedFile,
        validationScore: validation.result.finalScore,
        qualityStake: qualityStake.amount
      };

      onFragmentUploaded(fragment);

      // 重置表單
      setFormData({
        content: '',
        tags: [],
        isPublic: false,
        emotionScore: 50,
        fragmentType: 'text',
        title: ''
      });
      setSelectedFile(null);
      setFilePreview(null);
      setValidation({
        isValidating: false,
        isValidated: false,
        result: null,
        showDetails: false
      });
      setQualityStake({
        amount: 0,
        required: false,
        accepted: false
      });
      
      alert(`記憶碎片上傳成功！品質評分: ${validation.result.finalScore}/100`);
      onNavigate('gallery');
      
    } catch (error) {
      console.error('上傳失敗:', error);
      alert('上傳失敗，請重試');
    } finally {
      setIsUploading(false);
    }
  };

  if (!address) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-8">
          <HeartIcon className="h-16 w-16 text-memory-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-memory-800 mb-4">
            連接錢包開始上傳記憶
          </h2>
          <p className="text-memory-600">
            請先連接你的錢包，開始收集珍貴的記憶碎片
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-memory-800 mb-2">
          上傳記憶碎片
        </h1>
        <p className="text-memory-600">
          分享你的珍貴記憶，讓AI幫你重新拼湊完整的故事
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 記憶類型選擇 */}
        <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-memory-800 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            記憶類型
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {memoryTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.fragmentType === type.id;
              
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, fragmentType: type.id }))}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${isSelected 
                      ? 'border-memory-500 bg-memory-50' 
                      : 'border-memory-200 bg-white/50 hover:border-memory-300'
                    }
                  `}
                >
                  <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-memory-600' : 'text-memory-400'}`} />
                  <h4 className="font-semibold text-memory-800 mb-1">{type.name}</h4>
                  <p className="text-sm text-memory-600">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 文件上傳區域 */}
        <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-memory-800 mb-4">
            上傳內容
          </h3>
          
          <div
            className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={memoryTypes.find(t => t.id === formData.fragmentType)?.accept}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-memory-500 rounded-lg">
                      <CloudArrowUpIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-memory-800">{selectedFile.name}</p>
                      <p className="text-sm text-memory-600">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-1 hover:bg-memory-100 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5 text-memory-500" />
                  </button>
                </div>
                
                {/* 文件預覽 */}
                {filePreview && (
                  <div className="mt-4">
                    {formData.fragmentType === 'image' && (
                      <img 
                        src={filePreview} 
                        alt="預覽" 
                        className="max-h-48 rounded-lg mx-auto"
                      />
                    )}
                    {formData.fragmentType === 'audio' && (
                      <audio 
                        controls 
                        src={filePreview}
                        className="w-full"
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <CloudArrowUpIcon className="h-12 w-12 text-memory-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-memory-700">
                    點擊或拖拽文件到此處上傳
                  </p>
                  <p className="text-memory-500 text-sm">
                    支持 {memoryTypes.find(t => t.id === formData.fragmentType)?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 標題和內容 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
            <label className="block text-lg font-semibold text-memory-800 mb-3">
              記憶標題
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="給這個記憶取個名字..."
              className="input-field"
              required
            />
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
            <label className="block text-lg font-semibold text-memory-800 mb-3">
              記憶描述
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="描述這個記憶的詳細內容..."
              rows={3}
              className="textarea-field"
              required
            />
          </div>
        </div>

        {/* 標籤和情感 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
            <label className="block text-lg font-semibold text-memory-800 mb-3 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              標籤
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="添加標籤..."
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-secondary"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-memory-100 text-memory-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-memory-900"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
            <label className="block text-lg font-semibold text-memory-800 mb-3">
              情感強度
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.emotionScore}
                onChange={(e) => setFormData(prev => ({ ...prev, emotionScore: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                {emotionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, emotionScore: option.value }))}
                    className={`
                      flex flex-col items-center p-2 rounded-lg transition-all
                      ${Math.abs(formData.emotionScore - option.value) < 20 
                        ? `${option.color} text-white shadow-md` 
                        : 'text-memory-600 hover:bg-memory-100'
                      }
                    `}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs mt-1">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 內容驗證區域 */}
        {(formData.title && formData.content) && (
          <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-memory-800">
                內容品質驗證
              </h3>
              {!validation.isValidated && (
                <button
                  type="button"
                  onClick={validateContent}
                  disabled={validation.isValidating}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {validation.isValidating ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      <span>驗證內容</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {!validation.isValidated && !validation.isValidating && (
              <div className="text-center py-8 text-memory-600">
                <SparklesIcon className="h-12 w-12 text-memory-400 mx-auto mb-4" />
                <p className="mb-2">點擊「驗證內容」分析你的記憶品質</p>
                <p className="text-sm">高品質記憶內容可以免費提交</p>
              </div>
            )}
            
            <ValidationResult />
            
            {validation.isValidated && (
              <button
                type="button"
                onClick={() => setValidation(prev => ({ ...prev, showDetails: !prev.showDetails }))}
                className="mt-4 text-sm text-memory-600 hover:text-memory-700 underline"
              >
                {validation.showDetails ? '隱藏詳情' : '查看詳細分析'}
              </button>
            )}
          </div>
        )}

        {/* 質押系統 */}
        <QualityStakeComponent />

        {/* 隱私設置 */}
        <div className="bg-white/70 backdrop-blur-sm border border-memory-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-memory-800 flex items-center">
                {formData.isPublic ? (
                  <EyeIcon className="h-5 w-5 mr-2" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 mr-2" />
                )}
                隱私設置
              </h3>
              <p className="text-memory-600 text-sm">
                {formData.isPublic 
                  ? '其他用戶可以看到這個記憶碎片' 
                  : '只有你可以看到這個記憶碎片'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${formData.isPublic ? 'bg-memory-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* 提交按鈕 */}
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => onNavigate('welcome')}
            className="btn-secondary"
            disabled={isUploading}
          >
            返回
          </button>
          <button
            type="submit"
            disabled={
              isUploading || 
              !formData.title || 
              !formData.content || 
              !validation.isValidated ||
              (!validation.result?.canSubmit && (!qualityStake.required || !qualityStake.accepted))
            }
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner"></div>
                <span>上傳中...</span>
              </div>
            ) : !validation.isValidated ? (
              '請先驗證內容'
            ) : !validation.result?.canSubmit ? (
              qualityStake.required && qualityStake.accepted ? 
                `提交 (質押 ${qualityStake.amount} ETH)` : 
                '內容需要改進'
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>上傳記憶碎片</span>
              </div>
            )}
            
            {/* 品質評分指示器 */}
            {validation.isValidated && validation.result && (
              <div className="absolute -top-2 -right-2 bg-white rounded-full border-2 border-memory-500 px-2 py-1">
                <span className={`text-xs font-bold ${
                  validation.result.finalScore >= 80 ? 'text-green-600' :
                  validation.result.finalScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {validation.result.finalScore}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* 幫助信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <h4 className="font-semibold text-blue-800 mb-3">💡 如何提交高品質記憶？</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <h5 className="font-medium mb-1">具體細節</h5>
              <p>包含時間、地點、人物等具體信息</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">情感描述</h5>
              <p>描述當時的感受和情緒變化</p>
            </div>
            <div>
              <h5 className="font-medium mb-1">個人化</h5>
              <p>使用第一人稱，包含個人經歷</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MemoryUpload;
