/**
 * @fileoverview 用户相关API路由
 * @author Xide Team
 */

const express = require("express");
const router = express.Router();
const { createConnection, run, get, all } = require("../database/database");
const { validateUser } = require("../middleware/validation");

/**
 * @route POST /api/users
 * @desc 创建新用户（通过Web3钱包ID）
 * @access Public
 */
router.post("/", validateUser, async (req, res) => {
  try {
    const { wallet_id, username, email, avatar } = req.body;

    const db = await createConnection();

    // 检查钱包ID是否已存在
    const existingUser = await get(
      db,
      "SELECT id FROM users WHERE wallet_id = ?",
      [wallet_id]
    );
    if (existingUser) {
      db.close();
      return res.status(400).json({
        status: "error",
        message: "该钱包ID已存在",
      });
    }

    // 创建新用户
    const result = await run(
      db,
      `
      INSERT INTO users (wallet_id, username, email, avatar)
      VALUES (?, ?, ?, ?)
    `,
      [wallet_id, username, email, avatar]
    );

    // 获取新创建的用户
    const newUser = await get(
      db,
      `
      SELECT id, wallet_id, username, email, avatar, total_points, created_at
      FROM users WHERE id = ?
    `,
      [result.id]
    );

    db.close();

    res.status(201).json({
      status: "success",
      message: "用户创建成功",
      data: newUser,
    });
  } catch (error) {
    console.error("创建用户失败:", error);
    res.status(500).json({
      status: "error",
      message: "创建用户失败",
    });
  }
});

/**
 * @route GET /api/users/:wallet_id
 * @desc 通过钱包ID获取用户信息
 * @access Public
 */
router.get("/:wallet_id", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const db = await createConnection();

    const user = await get(
      db,
      `
      SELECT id, wallet_id, username, email, avatar, total_points, created_at, updated_at
      FROM users WHERE wallet_id = ?
    `,
      [wallet_id]
    );

    db.close();

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取用户信息失败",
    });
  }
});

/**
 * @route PUT /api/users/:wallet_id
 * @desc 更新用户信息
 * @access Public
 */
router.put("/:wallet_id", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { username, email, avatar } = req.body;

    const db = await createConnection();

    // 检查用户是否存在
    const existingUser = await get(
      db,
      "SELECT id FROM users WHERE wallet_id = ?",
      [wallet_id]
    );
    if (!existingUser) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    // 更新用户信息
    await run(
      db,
      `
      UPDATE users SET 
        username = ?, email = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE wallet_id = ?
    `,
      [username, email, avatar, wallet_id]
    );

    // 获取更新后的用户信息
    const updatedUser = await get(
      db,
      `
      SELECT id, wallet_id, username, email, avatar, total_points, created_at, updated_at
      FROM users WHERE wallet_id = ?
    `,
      [wallet_id]
    );

    db.close();

    res.json({
      status: "success",
      message: "用户信息更新成功",
      data: updatedUser,
    });
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({
      status: "error",
      message: "更新用户信息失败",
    });
  }
});

/**
 * @route POST /api/users/:wallet_id/join-course
 * @desc 用户加入课程
 * @access Public
 */
router.post("/:wallet_id/join-course", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { course_id } = req.body;

    const db = await createConnection();

    // 检查用户是否存在
    const user = await get(db, "SELECT id FROM users WHERE wallet_id = ?", [
      wallet_id,
    ]);
    if (!user) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    // 检查课程是否存在
    const course = await get(
      db,
      'SELECT id FROM courses WHERE id = ? AND status = "active"',
      [course_id]
    );
    if (!course) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "课程不存在或已下架",
      });
    }

    // 检查用户是否已经加入该课程
    const existingJoin = await get(
      db,
      "SELECT id FROM user_courses WHERE user_id = ? AND course_id = ?",
      [user.id, course_id]
    );
    if (existingJoin) {
      db.close();
      return res.status(400).json({
        status: "error",
        message: "用户已加入该课程",
      });
    }

    // 加入课程
    await run(
      db,
      `
      INSERT INTO user_courses (user_id, course_id)
      VALUES (?, ?)
    `,
      [user.id, course_id]
    );

    db.close();

    res.json({
      status: "success",
      message: "成功加入课程",
    });
  } catch (error) {
    console.error("加入课程失败:", error);
    res.status(500).json({
      status: "error",
      message: "加入课程失败",
    });
  }
});

/**
 * @route GET /api/users/:wallet_id/courses
 * @desc 获取用户已加入的课程列表
 * @access Public
 */
router.get("/:wallet_id/courses", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const db = await createConnection();

    // 获取用户ID
    const user = await get(db, "SELECT id FROM users WHERE wallet_id = ?", [
      wallet_id,
    ]);
    if (!user) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await get(
      db,
      `
      SELECT COUNT(*) as total 
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = ? AND c.status = 'active'
    `,
      [user.id]
    );
    const total = countResult.total;

    // 获取课程列表
    const courses = await all(
      db,
      `
      SELECT 
        c.id, c.title, c.instructor, c.value, c.rating,
        c.live_time, c.category, c.cover_image,
        uc.watch_time, uc.completion_rate, uc.points_earned,
        uc.joined_at
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = ? AND c.status = 'active'
      ORDER BY uc.joined_at DESC
      LIMIT ? OFFSET ?
    `,
      [user.id, parseInt(limit), offset]
    );

    db.close();

    res.json({
      status: "success",
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取用户课程列表失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取用户课程列表失败",
    });
  }
});

/**
 * @route PUT /api/users/:wallet_id/courses/:course_id/progress
 * @desc 更新用户课程学习进度
 * @access Public
 */
router.put("/:wallet_id/courses/:course_id/progress", async (req, res) => {
  try {
    const { wallet_id, course_id } = req.params;
    const { watch_time, completion_rate } = req.body;

    const db = await createConnection();

    // 获取用户ID
    const user = await get(db, "SELECT id FROM users WHERE wallet_id = ?", [
      wallet_id,
    ]);
    if (!user) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    // 检查用户是否已加入该课程
    const userCourse = await get(
      db,
      "SELECT id FROM user_courses WHERE user_id = ? AND course_id = ?",
      [user.id, course_id]
    );
    if (!userCourse) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户未加入该课程",
      });
    }

    // 更新学习进度
    await run(
      db,
      `
      UPDATE user_courses SET 
        watch_time = ?, completion_rate = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?
    `,
      [watch_time, completion_rate, user.id, course_id]
    );

    db.close();

    res.json({
      status: "success",
      message: "学习进度更新成功",
    });
  } catch (error) {
    console.error("更新学习进度失败:", error);
    res.status(500).json({
      status: "error",
      message: "更新学习进度失败",
    });
  }
});

module.exports = router;
