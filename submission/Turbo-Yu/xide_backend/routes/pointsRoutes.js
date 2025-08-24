/**
 * @fileoverview 积分相关API路由
 * @author Xide Team
 */

const express = require("express");
const router = express.Router();
const { createConnection, run, get, all } = require("../database/database");

/**
 * @route GET /api/points/:wallet_id
 * @desc 获取用户积分余额
 * @access Public
 */
router.get("/:wallet_id", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const db = await createConnection();

    const user = await get(
      db,
      `
      SELECT id, wallet_id, total_points, created_at, updated_at
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
      data: {
        wallet_id: user.wallet_id,
        total_points: user.total_points,
        last_updated: user.updated_at,
      },
    });
  } catch (error) {
    console.error("获取用户积分失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取用户积分失败",
    });
  }
});

/**
 * @route POST /api/points/:wallet_id/earn
 * @desc 用户获得积分（如完成课程、参与活动等）
 * @access Public
 */
router.post("/:wallet_id/earn", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { points, reason, course_id } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        status: "error",
        message: "积分数量必须大于0",
      });
    }

    if (!reason) {
      return res.status(400).json({
        status: "error",
        message: "必须提供获得积分的原因",
      });
    }

    const db = await createConnection();

    // 获取用户信息
    const user = await get(
      db,
      "SELECT id, total_points FROM users WHERE wallet_id = ?",
      [wallet_id]
    );
    if (!user) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    // 开始事务
    await run(db, "BEGIN TRANSACTION");

    try {
      // 更新用户总积分
      const newTotalPoints = user.total_points + points;
      await run(
        db,
        `
        UPDATE users SET 
          total_points = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [newTotalPoints, user.id]
      );

      // 记录积分日志
      await run(
        db,
        `
        INSERT INTO points_logs (
          user_id, course_id, points_change, reason, balance_after
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [user.id, course_id || null, points, reason, newTotalPoints]
      );

      // 如果有课程ID，更新用户课程记录
      if (course_id) {
        await run(
          db,
          `
          UPDATE user_courses SET 
            points_earned = points_earned + ?
          WHERE user_id = ? AND course_id = ?
        `,
          [points, user.id, course_id]
        );
      }

      // 提交事务
      await run(db, "COMMIT");

      db.close();

      res.json({
        status: "success",
        message: "积分获得成功",
        data: {
          points_earned: points,
          total_points: newTotalPoints,
          reason: reason,
        },
      });
    } catch (error) {
      // 回滚事务
      await run(db, "ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("获得积分失败:", error);
    res.status(500).json({
      status: "error",
      message: "获得积分失败",
    });
  }
});

/**
 * @route POST /api/points/:wallet_id/spend
 * @desc 用户消费积分（如购买课程、兑换商品等）
 * @access Public
 */
router.post("/:wallet_id/spend", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { points, reason, course_id } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        status: "error",
        message: "消费积分数量必须大于0",
      });
    }

    if (!reason) {
      return res.status(400).json({
        status: "error",
        message: "必须提供消费积分的原因",
      });
    }

    const db = await createConnection();

    // 获取用户信息
    const user = await get(
      db,
      "SELECT id, total_points FROM users WHERE wallet_id = ?",
      [wallet_id]
    );
    if (!user) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    // 检查积分是否足够
    if (user.total_points < points) {
      db.close();
      return res.status(400).json({
        status: "error",
        message: "积分余额不足",
      });
    }

    // 开始事务
    await run(db, "BEGIN TRANSACTION");

    try {
      // 更新用户总积分
      const newTotalPoints = user.total_points - points;
      await run(
        db,
        `
        UPDATE users SET 
          total_points = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [newTotalPoints, user.id]
      );

      // 记录积分日志（消费为负数）
      await run(
        db,
        `
        INSERT INTO points_logs (
          user_id, course_id, points_change, reason, balance_after
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [user.id, course_id || null, -points, reason, newTotalPoints]
      );

      // 提交事务
      await run(db, "COMMIT");

      db.close();

      res.json({
        status: "success",
        message: "积分消费成功",
        data: {
          points_spent: points,
          total_points: newTotalPoints,
          reason: reason,
        },
      });
    } catch (error) {
      // 回滚事务
      await run(db, "ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("消费积分失败:", error);
    res.status(500).json({
      status: "error",
      message: "消费积分失败",
    });
  }
});

/**
 * @route GET /api/points/:wallet_id/logs
 * @desc 获取用户积分变动日志
 * @access Public
 */
router.get("/:wallet_id/logs", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const { page = 1, limit = 20, type } = req.query;

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

    let whereClause = "WHERE pl.user_id = ?";
    let params = [user.id];

    if (type === "earn") {
      whereClause += " AND pl.points_change > 0";
    } else if (type === "spend") {
      whereClause += " AND pl.points_change < 0";
    }

    // 获取总数
    const countResult = await get(
      db,
      `
      SELECT COUNT(*) as total 
      FROM points_logs pl
      ${whereClause}
    `,
      params
    );
    const total = countResult.total;

    // 获取积分日志
    const logs = await all(
      db,
      `
      SELECT 
        pl.id, pl.points_change, pl.reason, pl.balance_after,
        pl.created_at, pl.course_id,
        c.title as course_title,
        CASE 
          WHEN pl.points_change > 0 THEN 'earn'
          ELSE 'spend'
        END as type
      FROM points_logs pl
      LEFT JOIN courses c ON pl.course_id = c.id
      ${whereClause}
      ORDER BY pl.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), offset]
    );

    db.close();

    res.json({
      status: "success",
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取积分日志失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取积分日志失败",
    });
  }
});

/**
 * @route GET /api/points/:wallet_id/statistics
 * @desc 获取用户积分统计信息
 * @access Public
 */
router.get("/:wallet_id/statistics", async (req, res) => {
  try {
    const { wallet_id } = req.params;
    const db = await createConnection();

    // 获取用户ID
    const user = await get(
      db,
      "SELECT id, total_points FROM users WHERE wallet_id = ?",
      [wallet_id]
    );
    if (!user) {
      db.close();
      return res.status(404).json({
        status: "error",
        message: "用户不存在",
      });
    }

    // 获取积分统计
    const stats = await get(
      db,
      `
      SELECT 
        SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END) as total_earned,
        SUM(CASE WHEN points_change < 0 THEN ABS(points_change) ELSE 0 END) as total_spent,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN points_change > 0 THEN 1 END) as earn_count,
        COUNT(CASE WHEN points_change < 0 THEN 1 END) as spend_count
      FROM points_logs 
      WHERE user_id = ?
    `,
      [user.id]
    );

    // 获取最近7天的积分变化
    const weeklyStats = await all(
      db,
      `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END) as earned,
        SUM(CASE WHEN points_change < 0 THEN ABS(points_change) ELSE 0 END) as spent
      FROM points_logs 
      WHERE user_id = ? 
        AND created_at >= date('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `,
      [user.id]
    );

    db.close();

    res.json({
      status: "success",
      data: {
        current_balance: user.total_points,
        total_earned: stats.total_earned || 0,
        total_spent: stats.total_spent || 0,
        total_transactions: stats.total_transactions || 0,
        earn_count: stats.earn_count || 0,
        spend_count: stats.spend_count || 0,
        weekly_stats: weeklyStats,
      },
    });
  } catch (error) {
    console.error("获取积分统计失败:", error);
    res.status(500).json({
      status: "error",
      message: "获取积分统计失败",
    });
  }
});

module.exports = router;
