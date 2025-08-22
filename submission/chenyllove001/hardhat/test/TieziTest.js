const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tiezi Contract", function () {
    let tieziContract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Tiezi = await ethers.getContractFactory("Tiezi");
        tieziContract = await Tiezi.deploy();
        await tieziContract.deployed();
    });

    describe("Publish Tiezi", function () {
        it("Should publish a new tiezi successfully", async function () {
            const newTiezi = {
                id: 0,
                parentid: 0,
                title: "Test Title",
                content: "Test Content",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser",
                voteCount: 0
            };

            await expect(tieziContract.connect(addr1).publishtiezi(newTiezi))
                .to.emit(tieziContract, "TieziPublished") // 如果有事件可以添加
                .to.not.be.reverted;

            // 验证帖子ID已正确分配
            const storedTiezi = await tieziContract.tiezis(1);
            expect(storedTiezi.id).to.equal(1);
            expect(storedTiezi.title).to.equal("Test Title");
            expect(storedTiezi.content).to.equal("Test Content");
            expect(storedTiezi.username).to.equal("testuser");
            expect(storedTiezi.status).to.equal(1);
        });

        it("Should fail to publish tiezi with empty title", async function () {
            const newTiezi = {
                id: 0,
                parentid: 0,
                title: "",
                content: "Test Content",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser",
                voteCount: 0
            };

            await expect(tieziContract.connect(addr1).publishtiezi(newTiezi))
                .to.be.revertedWith("Title cannot be empty");
        });

        it("Should fail to publish tiezi with empty content", async function () {
            const newTiezi = {
                id: 0,
                parentid: 0,
                title: "Test Title",
                content: "",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser",
                voteCount: 0
            };

            await expect(tieziContract.connect(addr1).publishtiezi(newTiezi))
                .to.be.revertedWith("Content cannot be empty");
        });

        it("Should record tiezi under author's list", async function () {
            const newTiezi = {
                id: 0,
                parentid: 0,
                title: "Test Title",
                content: "Test Content",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser",
                voteCount: 0
            };

            await tieziContract.connect(addr1).publishtiezi(newTiezi);
            
            const authorTiezis = await tieziContract.tieziAuthors("testuser", 0);
            expect(authorTiezis).to.equal(1);
        });

        it("Should handle reply tiezi correctly", async function () {
            // 先发布一个主帖
            const mainTiezi = {
                id: 0,
                parentid: 0,
                title: "Main Title",
                content: "Main Content",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser1",
                voteCount: 0
            };

            await tieziContract.connect(addr1).publishtiezi(mainTiezi);

            // 再发布一个回复帖
            const replyTiezi = {
                id: 0,
                parentid: 1,
                title: "Reply Title",
                content: "Reply Content",
                lx: "reply",
                time: 0,
                status: 0,
                username: "testuser2",
                voteCount: 0
            };

            await tieziContract.connect(addr2).publishtiezi(replyTiezi);

            // 验证回复关系是否正确建立
            const replies = await tieziContract.tieziReplies(1, 0);
            expect(replies).to.equal(2);
        });
    });

    describe("Daily Tiezi Count", function () {
        it("Should record daily tiezi count and reset", async function () {
            const newTiezi = {
                id: 0,
                parentid: 0,
                title: "Test Title",
                content: "Test Content",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser",
                voteCount: 0
            };

            // 发布几个帖子
            await tieziContract.connect(addr1).publishtiezi(newTiezi);
            await tieziContract.connect(addr2).publishtiezi(newTiezi);

            // 记录今日帖子数
            await tieziContract.jrtz("2023-01-01");

            const dailyCount = await tieziContract.rqtz("2023-01-01");
            expect(dailyCount).to.equal(2);

            // 验证今日计数器已重置
            const todayCount = await tieziContract.toDayTiezi();
            expect(todayCount).to.equal(0);
        });
    });

    describe("Tiezi ID Generation", function () {
        it("Should generate incremental IDs", async function () {
            const newTiezi = {
                id: 0,
                parentid: 0,
                title: "Test Title 1",
                content: "Test Content",
                lx: "general",
                time: 0,
                status: 0,
                username: "testuser",
                voteCount: 0
            };

            await tieziContract.connect(addr1).publishtiezi(newTiezi);
            const tiezi1 = await tieziContract.tiezis(1);
            expect(tiezi1.id).to.equal(1);

            await tieziContract.connect(addr2).publishtiezi(newTiezi);
            const tiezi2 = await tieziContract.tiezis(2);
            expect(tiezi2.id).to.equal(2);
        });
    });
});