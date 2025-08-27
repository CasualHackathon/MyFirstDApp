class ContentValidator {
  constructor() {
    // 簡化版驗證器，主要使用規則引擎
  }

  async validateMemoryContent(content, title, tags) {
    try {
      // 暫時使用基礎驗證，之後可以添加AI功能
      return this.basicValidation(content, title, tags);
    } catch (error) {
      console.error('驗證失敗:', error);
      return {
        score: 50,
        issues: ['驗證系統暫時不可用'],
        suggestions: ['請確保內容是真實的個人記憶'],
        memoryIndicators: []
      };
    }
  }

  basicValidation(content, title, tags) {
    let score = 50;
    const issues = [];
    const suggestions = [];
    const memoryIndicators = [];

    // 檢查內容長度
    if (content.length < 20) {
      issues.push('內容過短，建議提供更多細節');
      score -= 20;
    } else if (content.length > 50) {
      memoryIndicators.push('內容詳細');
      score += 10;
    }

    // 檢查標題
    if (!title || title.length < 3) {
      issues.push('標題過短或缺失');
      score -= 15;
    } else {
      memoryIndicators.push('有明確標題');
      score += 5;
    }

    // 檢查個人化詞彙
    const personalWords = ['我', '我的', '那時', '記得', '感覺', '看到', '聽到', '媽媽', '爸爸', '朋友', '家', '學校'];
    const personalWordCount = personalWords.filter(word => content.includes(word)).length;
    
    if (personalWordCount >= 3) {
      memoryIndicators.push('包含個人化詞彙');
      score += 15;
    } else if (personalWordCount === 0) {
      issues.push('缺少個人化描述，建議使用第一人稱');
      score -= 25;
    }

    // 檢查時間指示詞
    const timeWords = ['那天', '以前', '小時候', '去年', '昨天', '當時', '後來', '現在', '那時候'];
    const timeWordCount = timeWords.filter(word => content.includes(word)).length;
    
    if (timeWordCount > 0) {
      memoryIndicators.push('包含時間元素');
      score += 10;
    } else {
      suggestions.push('可以添加時間相關的描述');
    }

    // 檢查情感詞彙
    const emotionWords = ['開心', '難過', '興奮', '緊張', '感動', '害怕', '溫暖', '懷念', '快樂', '悲傷', '高興', '失望'];
    const emotionWordCount = emotionWords.filter(word => content.includes(word)).length;
    
    if (emotionWordCount > 0) {
      memoryIndicators.push('包含情感描述');
      score += 15;
    } else {
      suggestions.push('建議添加當時的感受和情感');
    }

    // 檢查垃圾內容指標
    const spamIndicators = ['廣告', '推廣', '聯繫方式', 'http', 'www', '購買', '優惠', '點擊', '關注'];
    const spamCount = spamIndicators.filter(word => content.includes(word)).length;
    
    if (spamCount > 0) {
      issues.push('內容可能包含推廣信息');
      score -= 50;
    }

    // 檢查重複字符
    const repeatPattern = /(.)\1{4,}/;
    if (repeatPattern.test(content)) {
      issues.push('包含重複字符，可能是隨意輸入');
      score -= 30;
    }

    // 檢查標籤質量
    if (tags && tags.length > 0) {
      memoryIndicators.push('包含相關標籤');
      score += 5;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      suggestions,
      memoryIndicators
    };
  }

  checkSimilarity(newContent, existingFragments) {
    if (!existingFragments || existingFragments.length === 0) {
      return {
        hasSimilar: false,
        similarFragments: [],
        maxSimilarity: 0
      };
    }

    const similarities = existingFragments.map(fragment => {
      const similarity = this.calculateSimilarity(newContent, fragment.content);
      return { fragmentId: fragment.id, similarity };
    });

    const highSimilarity = similarities.filter(s => s.similarity > 0.8);
    
    return {
      hasSimilar: highSimilarity.length > 0,
      similarFragments: highSimilarity,
      maxSimilarity: Math.max(...similarities.map(s => s.similarity), 0)
    };
  }

  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  async comprehensiveValidation(content, title, tags, existingFragments) {
    const [contentValidation, similarityCheck] = await Promise.all([
      this.validateMemoryContent(content, title, tags),
      Promise.resolve(this.checkSimilarity(content, existingFragments))
    ]);

    const finalScore = contentValidation.score - (similarityCheck.maxSimilarity * 30);

    return {
      ...contentValidation,
      similarity: similarityCheck,
      finalScore: Math.max(0, Math.min(100, finalScore)),
      canSubmit: finalScore >= 70 && !similarityCheck.hasSimilar
    };
  }
}

export default ContentValidator;
