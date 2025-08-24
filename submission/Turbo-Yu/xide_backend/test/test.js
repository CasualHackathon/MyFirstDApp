/**
 * @fileoverview 简单的API测试文件
 * @author Xide Team
 */

const axios = require("axios");

const BASE_URL = "http://localhost:10086/api";

/**
 * 测试课程相关API
 */
async function testCourses() {
  console.log("🧪 测试课程相关API...");

  try {
    // 获取课程列表
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    console.log("✅ 获取课程列表成功:", coursesResponse.data);

    // 获取课程类别
    const categoriesResponse = await axios.get(
      `${BASE_URL}/courses/categories`
    );
    console.log("✅ 获取课程类别成功:", categoriesResponse.data);

    // 创建新课程
    const newCourse = {
      title: "智能合约开发实战",
      instructor: "李教授",
      value: 150.0,
      live_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "智能合约",
      description: "深入学习智能合约的开发、部署和测试",
      cover_image: "https://example.com/smart-contract.jpg",
    };

    const createResponse = await axios.post(`${BASE_URL}/courses`, newCourse);
    console.log("✅ 创建课程成功:", createResponse.data);

    const courseId = createResponse.data.data.id;

    // 获取课程详情
    const courseDetailResponse = await axios.get(
      `${BASE_URL}/courses/${courseId}`
    );
    console.log("✅ 获取课程详情成功:", courseDetailResponse.data);
  } catch (error) {
    console.error("❌ 课程API测试失败:", error.response?.data || error.message);
  }
}

/**
 * 测试用户相关API
 */
async function testUsers() {
  console.log("\n🧪 测试用户相关API...");

  try {
    const walletId = "0x1234567890abcdef1234567890abcdef12345678";

    // 创建新用户
    const newUser = {
      wallet_id: walletId,
      username: "测试用户",
      email: "test@example.com",
      avatar: "https://example.com/avatar.jpg",
    };

    const createUserResponse = await axios.post(`${BASE_URL}/users`, newUser);
    console.log("✅ 创建用户成功:", createUserResponse.data);

    // 获取用户信息
    const userResponse = await axios.get(`${BASE_URL}/users/${walletId}`);
    console.log("✅ 获取用户信息成功:", userResponse.data);

    // 用户加入课程
    const joinCourseResponse = await axios.post(
      `${BASE_URL}/users/${walletId}/join-course`,
      {
        course_id: 1,
      }
    );
    console.log("✅ 用户加入课程成功:", joinCourseResponse.data);

    // 获取用户课程列表
    const userCoursesResponse = await axios.get(
      `${BASE_URL}/users/${walletId}/courses`
    );
    console.log("✅ 获取用户课程列表成功:", userCoursesResponse.data);

    // 更新学习进度
    const progressResponse = await axios.put(
      `${BASE_URL}/users/${walletId}/courses/1/progress`,
      {
        watch_time: 1800,
        completion_rate: 60.0,
      }
    );
    console.log("✅ 更新学习进度成功:", progressResponse.data);
  } catch (error) {
    console.error("❌ 用户API测试失败:", error.response?.data || error.message);
  }
}

/**
 * 测试积分相关API
 */
async function testPoints() {
  console.log("\n🧪 测试积分相关API...");

  try {
    const walletId = "0x1234567890abcdef1234567890abcdef12345678";

    // 获取用户积分余额
    const pointsResponse = await axios.get(`${BASE_URL}/points/${walletId}`);
    console.log("✅ 获取用户积分成功:", pointsResponse.data);

    // 用户获得积分
    const earnResponse = await axios.post(
      `${BASE_URL}/points/${walletId}/earn`,
      {
        points: 100,
        reason: "完成课程学习",
        course_id: 1,
      }
    );
    console.log("✅ 用户获得积分成功:", earnResponse.data);

    // 再次获取积分余额
    const updatedPointsResponse = await axios.get(
      `${BASE_URL}/points/${walletId}`
    );
    console.log("✅ 更新后积分余额:", updatedPointsResponse.data);

    // 获取积分日志
    const logsResponse = await axios.get(`${BASE_URL}/points/${walletId}/logs`);
    console.log("✅ 获取积分日志成功:", logsResponse.data);

    // 获取积分统计
    const statsResponse = await axios.get(
      `${BASE_URL}/points/${walletId}/statistics`
    );
    console.log("✅ 获取积分统计成功:", statsResponse.data);
  } catch (error) {
    console.error("❌ 积分API测试失败:", error.response?.data || error.message);
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log("🚀 开始运行API测试...\n");

  try {
    await testCourses();
    await testUsers();
    await testPoints();

    console.log("\n🎉 所有测试完成！");
  } catch (error) {
    console.error("\n❌ 测试过程中发生错误:", error.message);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  testCourses,
  testUsers,
  testPoints,
  runTests,
};
