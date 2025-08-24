/**
 * @fileoverview 数据验证中间件
 * @author Xide Team
 */

const Joi = require("joi");

/**
 * 课程数据验证模式
 */
const courseSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    "string.empty": "课程标题不能为空",
    "string.min": "课程标题至少需要1个字符",
    "string.max": "课程标题不能超过200个字符",
    "any.required": "课程标题是必填项",
  }),
  instructor: Joi.string().min(1).max(100).required().messages({
    "string.empty": "讲师姓名不能为空",
    "string.min": "讲师姓名至少需要1个字符",
    "string.max": "讲师姓名不能超过100个字符",
    "any.required": "讲师姓名是必填项",
  }),
  value: Joi.number().min(0).required().messages({
    "number.base": "课程价值必须是数字",
    "number.min": "课程价值不能为负数",
    "any.required": "课程价值是必填项",
  }),
  live_time: Joi.string().isoDate().required().messages({
    "string.isoDate": "直播时间格式不正确，请使用ISO日期格式",
    "any.required": "直播时间是必填项",
  }),
  category: Joi.string().min(1).max(50).required().messages({
    "string.empty": "课程类别不能为空",
    "string.min": "课程类别至少需要1个字符",
    "string.max": "课程类别不能超过50个字符",
    "any.required": "课程类别是必填项",
  }),
  description: Joi.string().max(1000).optional().messages({
    "string.max": "课程描述不能超过1000个字符",
  }),
  cover_image: Joi.string().uri().optional().messages({
    "string.uri": "封面图片必须是有效的URL",
  }),
  status: Joi.string()
    .valid("active", "inactive", "deleted")
    .optional()
    .messages({
      "any.only": "状态只能是 active、inactive 或 deleted",
    }),
});

/**
 * 用户数据验证模式
 */
const userSchema = Joi.object({
  wallet_id: Joi.string().min(26).max(42).required().messages({
    "string.empty": "钱包ID不能为空",
    "string.min": "钱包ID长度不正确",
    "string.max": "钱包ID长度不正确",
    "any.required": "钱包ID是必填项",
  }),
  username: Joi.string().min(1).max(50).optional().messages({
    "string.empty": "用户名不能为空",
    "string.min": "用户名至少需要1个字符",
    "string.max": "用户名不能超过50个字符",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "邮箱格式不正确",
  }),
  avatar: Joi.string().uri().optional().messages({
    "string.uri": "头像必须是有效的URL",
  }),
});

/**
 * 积分操作验证模式
 */
const pointsSchema = Joi.object({
  points: Joi.number().integer().min(1).required().messages({
    "number.base": "积分必须是数字",
    "number.integer": "积分必须是整数",
    "number.min": "积分必须大于0",
    "any.required": "积分是必填项",
  }),
  reason: Joi.string().min(1).max(200).required().messages({
    "string.empty": "积分变动原因不能为空",
    "string.min": "积分变动原因至少需要1个字符",
    "string.max": "积分变动原因不能超过200个字符",
    "any.required": "积分变动原因是必填项",
  }),
  course_id: Joi.number().integer().min(1).optional().messages({
    "number.base": "课程ID必须是数字",
    "number.integer": "课程ID必须是整数",
    "number.min": "课程ID必须大于0",
  }),
});

/**
 * 课程进度更新验证模式
 */
const progressSchema = Joi.object({
  watch_time: Joi.number().integer().min(0).required().messages({
    "number.base": "观看时间必须是数字",
    "number.integer": "观看时间必须是整数",
    "number.min": "观看时间不能为负数",
    "any.required": "观看时间是必填项",
  }),
  completion_rate: Joi.number().min(0).max(100).required().messages({
    "number.base": "完成率必须是数字",
    "number.min": "完成率不能为负数",
    "number.max": "完成率不能超过100%",
    "any.required": "完成率是必填项",
  }),
});

/**
 * 课程数据验证中间件
 */
function validateCourse(req, res, next) {
  const { error } = courseSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "数据验证失败",
      details: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next();
}

/**
 * 用户数据验证中间件
 */
function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "数据验证失败",
      details: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next();
}

/**
 * 积分操作验证中间件
 */
function validatePoints(req, res, next) {
  const { error } = pointsSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "数据验证失败",
      details: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next();
}

/**
 * 课程进度验证中间件
 */
function validateProgress(req, res, next) {
  const { error } = progressSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "数据验证失败",
      details: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next();
}

module.exports = {
  validateCourse,
  validateUser,
  validatePoints,
  validateProgress,
};
