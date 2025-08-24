module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复bug
        "docs", // 文档更新
        "style", // 代码格式调整
        "refactor", // 重构
        "test", // 测试
        "chore", // 构建过程或辅助工具的变动
        "perf", // 性能优化
        "ci", // CI/CD相关
      ],
    ],
    "subject-max-length": [2, "always", 100],
  },
};
