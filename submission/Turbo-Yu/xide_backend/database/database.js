/**
 * @fileoverview 数据库连接和初始化模块
 * @author Xide Team
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// 确保数据库目录存在
const dbDir = path.dirname(process.env.DB_PATH || "./database/xide.db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/**
 * 创建数据库连接
 * @returns {Promise<sqlite3.Database>} 数据库连接实例
 */
function createConnection() {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || "./database/xide.db";
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("📦 数据库连接成功:", dbPath);
        resolve(db);
      }
    });
  });
}

/**
 * 执行SQL语句
 * @param {sqlite3.Database} db 数据库连接
 * @param {string} sql SQL语句
 * @param {Array} params 参数数组
 * @returns {Promise} 执行结果
 */
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * 查询单条记录
 * @param {sqlite3.Database} db 数据库连接
 * @param {string} sql SQL语句
 * @param {Array} params 参数数组
 * @returns {Promise<Object>} 查询结果
 */
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * 查询多条记录
 * @param {sqlite3.Database} db 数据库连接
 * @param {string} sql SQL语句
 * @param {Array} params 参数数组
 * @returns {Promise<Array>} 查询结果数组
 */
function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * 初始化数据库表结构
 * @param {sqlite3.Database} db 数据库连接
 */
async function initTables(db) {
  try {
    // 课程表
    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        instructor TEXT NOT NULL,
        value REAL NOT NULL DEFAULT 0,
        rating REAL DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        publish_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        live_time DATETIME NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    );

    // 用户表
    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id TEXT UNIQUE NOT NULL,
        username TEXT,
        email TEXT,
        avatar TEXT,
        total_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    );

    // 用户课程记录表
    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS user_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        watch_time INTEGER DEFAULT 0,
        completion_rate REAL DEFAULT 0,
        points_earned INTEGER DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (course_id) REFERENCES courses (id),
        UNIQUE(user_id, course_id)
      )
    `
    );

    // 积分日志表
    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS points_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER,
        points_change INTEGER NOT NULL,
        reason TEXT NOT NULL,
        balance_after INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (course_id) REFERENCES courses (id)
      )
    `
    );

    // 课程类别表
    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS course_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    );

    console.log("✅ 数据库表初始化成功");
  } catch (error) {
    console.error("❌ 数据库表初始化失败:", error);
    throw error;
  }
}

/**
 * 插入初始数据
 * @param {sqlite3.Database} db 数据库连接
 */
async function insertInitialData(db) {
  try {
    // 插入默认课程类别
    const categories = [
      { name: "区块链基础", description: "区块链技术基础知识" },
      { name: "智能合约", description: "智能合约开发与部署" },
      { name: "DeFi应用", description: "去中心化金融应用" },
      { name: "NFT技术", description: "非同质化代币技术" },
      { name: "Web3开发", description: "Web3应用开发" },
    ];

    for (const category of categories) {
      await run(
        db,
        `
        INSERT OR IGNORE INTO course_categories (name, description)
        VALUES (?, ?)
      `,
        [category.name, category.description]
      );
    }

    // 插入示例课程
    await run(
      db,
      `
      INSERT OR IGNORE INTO courses (
        title, instructor, value, rating, rating_count, 
        live_time, category, description
      ) VALUES (
        '区块链入门基础课程',
        '张教授',
        100.0,
        4.8,
        25,
        datetime('now', '+7 days'),
        '区块链基础',
        '适合初学者的区块链基础知识课程，涵盖区块链原理、共识机制等核心概念。'
      )
    `
    );

    console.log("✅ 初始数据插入成功");
  } catch (error) {
    console.error("❌ 初始数据插入失败:", error);
    throw error;
  }
}

/**
 * 初始化数据库
 */
async function initDatabase() {
  let db;
  try {
    db = await createConnection();
    await initTables(db);
    await insertInitialData(db);
    console.log("🎉 数据库初始化完成");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

module.exports = {
  createConnection,
  run,
  get,
  all,
  initDatabase,
};
