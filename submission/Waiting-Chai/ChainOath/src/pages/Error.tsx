import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h2" color="error" gutterBottom>
        出错啦！
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        很抱歉，页面发生了异常或未找到。
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/")}>返回首页</Button>
    </Box>
  );
};

export default ErrorPage;
