// const TaskContract = artifacts.require("TaskContract");

// module.exports = function (deployer) {
//   deployer.deploy(TaskContract);
// };

const ReviewContract = artifacts.require("ReviewContract");

module.exports = function (deployer) {
  deployer.deploy(ReviewContract);
};
