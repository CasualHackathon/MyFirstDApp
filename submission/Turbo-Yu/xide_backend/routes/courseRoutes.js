/**
 * @fileoverview 课程相关API路由
 * @author Xide Team
 */

const express = require("express");
const router = express.Router();
const { createConnection, run, get, all } = require("../database/database");
const { validateCourse } = require("../middleware/validation");

/**
 * @route GET /api/courses
 * @desc 获取所有课程列表
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const db = await createConnection();

    const {
      page = 1,
      limit = 10,
      category,
      status = "active",
      search,
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = "WHERE status = ?";
    let params = [status];

    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }

    if (search) {
      whereClause +=
        " AND (title LIKE ? OR instructor LIKE ? OR description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM courses ${whereClause}`;
    const countResult = await get(db, countSql, params);
    const total = countResult.total;

    // 获取课程列表
    const coursesSql = `
      SELECT 
        id, title, instructor, value, rating, rating_count,
        publish_time, live_time, category, description, 
        cover_image, status, created_at
      FROM courses 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const courses = await all(db, coursesSql, [
      ...params,
      parseInt(limit),
      offset,
    ]);

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
    console.error("获取课程列表失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取课程列表失败",
    });
  }
});

/**
 * @route GET /api/courses/:id
 * @desc 获取单个课程详情
 * @access Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await createConnection();

    const course = await get(
      db,
      `
      SELECT 
        id, title, instructor, value, rating, rating_count,
        publish_time, live_time, category, description, 
        cover_image, status, created_at, updated_at
      FROM courses 
      WHERE id = ? AND status = 'active'
    `,
      [id]
    );

    db.close();

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "课程不存在",
      });
    }

    res.json({
      status: "success",
      data: course,
    });
  } catch (error) {
    console.error("获取课程详情失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取课程详情失败",
    });
  }
});

/**
 * @route POST /api/courses
 * @desc 创建新课程（后台管理）
 * @access Private
 */
router.post("/", validateCourse, async (req, res) => {
  try {
    const {
      title,
      instructor,
      value,
      live_time,
      category,
      description,
      cover_image,
    } = req.body;

    const db = await createConnection();

    const result = await run(
      db,
      `
      INSERT INTO courses (
        title, instructor, value, live_time, category, 
        description, cover_image, publish_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [title, instructor, value, live_time, category, description, cover_image]
    );

    // 获取新创建的课程
    const newCourse = await get(
      db,
      `
      SELECT * FROM courses WHERE id = ?
    `,
      [result.id]
    );

    db.close();

    res.status(201).json({
      status: "success",
      message: "课程创建成功",
      data: newCourse,
    });
  } catch (error) {
    console.error("创建课程失败:", error);
    res.status(500).json({
      status: "error",
      message: "创建课程失败",
    });
  }
});

/**
 * @route PUT /api/courses/:id
 * @desc 更新课程信息（后台管理）
 * @access Private
 */
router.put("/:id", validateCourse, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      instructor,
      value,
      live_time,
      category,
      description,
      cover_image,
      status,
    } = req.body;

    const db = await createConnection();

    // 检查课程是否存在
    const existingCourse = await get(
      db,
      "SELECT id FROM courses WHERE id = ?",
      [id]
    );
    if (!existingCourse) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "课程不存在",
      });
    }

    // 更新课程
    await run(
      db,
      `
      UPDATE courses SET 
        title = ?, instructor = ?, value = ?, live_time = ?, 
        category = ?, description = ?, cover_image = ?, 
        status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        title,
        instructor,
        value,
        live_time,
        category,
        description,
        cover_image,
        status,
        id,
      ]
    );

    // 获取更新后的课程
    const updatedCourse = await get(db, "SELECT * FROM courses WHERE id = ?", [
      id,
    ]);

    db.close();

    res.json({
      status: "success",
      message: "课程更新成功",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("更新课程失败:", error);
    res.status(500).json({
      status: "error",
      message: "更新课程失败",
    });
  }
});

/**
 * @route DELETE /api/courses/:id
 * @desc 删除课程（后台管理）
 * @access Private
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await createConnection();

    // 检查课程是否存在
    const existingCourse = await get(
      db,
      "SELECT id FROM courses WHERE id = ?",
      [id]
    );
    if (!existingCourse) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "课程不存在",
      });
    }

    // 软删除：将状态设置为deleted
    await run(
      db,
      `
      UPDATE courses SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [id]
    );

    db.close();

    res.json({
      status: "success",
      message: "课程删除成功",
    });
  } catch (error) {
    console.error("删除课程失败:", error);
    res.status(500).json({
      status: "error",
      message: "删除课程失败",
    });
  }
});

/**
 * @route GET /api/courses/categories
 * @desc 获取所有课程类别
 * @access Public
 */
router.get("/categories", async (req, res) => {
  try {
    const db = await createConnection();

    const categories = await all(
      db,
      `
      SELECT id, name, description, created_at
      FROM course_categories
      ORDER BY name
    `
    );

    db.close();

    res.json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    console.error("获取课程类别失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取课程类别失败",
    });
  }
});

module.exports = router;
