const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemoryFragments", function () {
  let MemoryFragments;
  let memoryFragments;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    MemoryFragments = await ethers.getContractFactory("MemoryFragments");
    memoryFragments = await MemoryFragments.deploy();
    await memoryFragments.waitForDeployment();
  });

  describe("部署測試", function () {
    it("應該設置正確的名稱和符號", async function () {
      expect(await memoryFragments.name()).to.equal("Memory Fragments");
      expect(await memoryFragments.symbol()).to.equal("MEMORY");
    });

    it("應該設置正確的owner", async function () {
      expect(await memoryFragments.owner()).to.equal(owner.address);
    });
  });

  describe("記憶碎片功能", function () {
    it("應該能夠上傳高品質記憶碎片", async function () {
      const contentHash = "QmTest123";
      const tags = ["childhood", "happy"];
      const isPublic = true;
      const emotionScore = 85;
      const fragmentType = "image";
      const qualityScore = 85; // 高品質，無需質押

      await expect(
        memoryFragments.uploadFragment(
          contentHash,
          tags,
          isPublic,
          emotionScore,
          fragmentType,
          qualityScore,
          { value: 0 } // 無需質押
        )
      ).to.emit(memoryFragments, "FragmentUploaded");

      const fragment = await memoryFragments.memoryFragments(1);
      expect(fragment.contentHash).to.equal(contentHash);
      expect(Number(fragment.qualityScore)).to.equal(qualityScore);
      expect(fragment.isVerified).to.equal(true);
    });

    it("應該要求低品質內容質押", async function () {
      const qualityScore = 50; // 低品質
      const requiredStake = await memoryFragments.calculateStakeAmount(qualityScore);
      
      expect(requiredStake).to.be.gt(0);
      
      await expect(
        memoryFragments.uploadFragment(
          "QmLowQuality",
          ["test"],
          true,
          50,
          "text",
          qualityScore,
          { value: 0 } // 沒有質押
        )
      ).to.be.revertedWith("Insufficient stake amount");
    });

    it("應該能夠創建記憶故事", async function () {
      // 先上傳兩個碎片
      await memoryFragments.uploadFragment("QmTest1", ["tag1"], true, 80, "text", 80, { value: 0 });
      await memoryFragments.uploadFragment("QmTest2", ["tag2"], true, 90, "image", 90, { value: 0 });

      const fragmentIds = [1, 2];
      const storyHash = "QmStoryHash";
      const title = "我的故事";
      const emotionalIntensity = 95;

      await expect(
        memoryFragments.createStory(fragmentIds, storyHash, title, emotionalIntensity)
      ).to.emit(memoryFragments, "StoryCreated");

      const story = await memoryFragments.memoryStories(1);
      expect(story.title).to.equal(title);
      expect(story.creator).to.equal(owner.address);
    });
  });

  describe("用戶信譽系統", function () {
    it("應該在上傳碎片後更新信譽", async function () {
      const initialReputation = await memoryFragments.userReputations(owner.address);
      
      await memoryFragments.uploadFragment("QmTest", ["test"], true, 80, "text", 80, { value: 0 });
      
      const newReputation = await memoryFragments.userReputations(owner.address);
      
      // 正確處理BigInt比較
      expect(Number(newReputation.totalSubmissions)).to.equal(Number(initialReputation.totalSubmissions) + 1);
      expect(Number(newReputation.reputationScore)).to.be.gte(Number(initialReputation.reputationScore));
    });
  });

  describe("質押計算", function () {
    it("應該正確計算質押金額", async function () {
      // 高品質內容無需質押
      const highQualityStake = await memoryFragments.calculateStakeAmount(80);
      expect(highQualityStake).to.equal(0);
      
      // 低品質內容需要質押
      const lowQualityStake = await memoryFragments.calculateStakeAmount(50);
      expect(lowQualityStake).to.be.gt(0);
      expect(lowQualityStake).to.be.lte(ethers.parseEther("0.01")); // MAX_STAKE_AMOUNT
    });
  });

  describe("數據查詢功能", function () {
    beforeEach(async function () {
      // 上傳一些測試數據
      await memoryFragments.uploadFragment("QmTest1", ["tag1"], true, 80, "text", 80, { value: 0 });
      await memoryFragments.uploadFragment("QmTest2", ["tag2"], false, 90, "image", 90, { value: 0 });
    });

    it("應該能夠獲取用戶的記憶碎片", async function () {
      const userFragments = await memoryFragments.getUserFragments(owner.address);
      expect(userFragments.length).to.equal(2);
      expect(Number(userFragments[0])).to.equal(1);
      expect(Number(userFragments[1])).to.equal(2);
    });

    it("應該能夠獲取公開的記憶碎片", async function () {
      const publicFragments = await memoryFragments.getPublicFragments();
      expect(publicFragments.length).to.equal(1); // 只有第一個是公開的
      expect(Number(publicFragments[0])).to.equal(1);
    });
  });

  describe("NFT功能", function () {
    it("應該能夠鑄造故事NFT", async function () {
      // 上傳碎片並創建故事
      await memoryFragments.uploadFragment("QmTest1", ["tag1"], true, 80, "text", 80, { value: 0 });
      await memoryFragments.uploadFragment("QmTest2", ["tag2"], true, 90, "image", 90, { value: 0 });
      
      await memoryFragments.createStory([1, 2], "QmStoryHash", "測試故事", 95);
      
      // 鑄造NFT
      await expect(
        memoryFragments.mintStoryNFT(1)
      ).to.emit(memoryFragments, "StoryNFTMinted");

      // 檢查NFT所有權
      expect(await memoryFragments.ownerOf(3)).to.equal(owner.address);
      
      // 檢查故事標記
      const story = await memoryFragments.memoryStories(1);
      expect(story.isNFTMinted).to.equal(true);
    });

    it("不應該允許重複鑄造故事NFT", async function () {
      // 上傳碎片並創建故事
      await memoryFragments.uploadFragment("QmTest1", ["tag1"], true, 80, "text", 80, { value: 0 });
      await memoryFragments.createStory([1], "QmStoryHash", "測試故事", 95);
      
      // 第一次鑄造
      await memoryFragments.mintStoryNFT(1);
      
      // 嘗試第二次鑄造應該失敗
      await expect(
        memoryFragments.mintStoryNFT(1)
      ).to.be.revertedWith("Already minted");
    });
  });
});
