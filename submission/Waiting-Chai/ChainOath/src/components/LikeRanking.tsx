import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
// TODO: 实现公共合约服务
// import { publicContractService } from '../services/publicContractService';

interface SimpleOath {
  id: number;
  title: string;
  creater: string;
  likeCount: number;
}

interface LikeRankingProps {
  limit?: number;
}

const LikeRanking: React.FC<LikeRankingProps> = ({ limit = 10 }) => {
  const navigate = useNavigate();
  const [rankingOaths, setRankingOaths] = React.useState<SimpleOath[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    
    const loadRanking = async () => {
      try {
        setLoading(true);
        // TODO: 实现publicContractService.getLikeRanking方法
        // const data = await publicContractService.getLikeRanking(limit);
        const data: SimpleOath[] = []; // 临时空数据
        if (mounted) {
          setRankingOaths(data);
        }
      } catch (error) {
        console.error('加载点赞排行榜失败:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRanking();

    return () => {
      mounted = false;
    };
  }, [limit]);



  const getRankIcon = (index: number) => {
    if (index === 0) return <TrophyIcon sx={{ color: '#FFD700' }} />; // 金色
    if (index === 1) return <TrophyIcon sx={{ color: '#C0C0C0' }} />; // 银色
    if (index === 2) return <TrophyIcon sx={{ color: '#CD7F32' }} />; // 铜色
    return (
      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
        {index + 1}
      </Avatar>
    );
  };

  const handleViewOath = (oathId: string) => {
    navigate(`/oath/${oathId}`);
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon color="primary" />
            点赞排行榜
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FavoriteIcon color="primary" />
          点赞排行榜
        </Typography>
        
        {rankingOaths.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              暂无数据
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {rankingOaths.map((oath, index) => (
              <ListItem
                key={oath.id}
                sx={{
                  px: 0,
                  py: 1,
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => handleViewOath(oath.id.toString())}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  {getRankIcon(index)}
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: index < 3 ? 'bold' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {oath.title || '无标题'}
                    </Typography>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        创建者: {oath.creater.slice(0, 6)}...{oath.creater.slice(-4)}
                      </Typography>

                    </Stack>
                  }
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    <Typography variant="body2" fontWeight="bold">
                      {oath.likeCount}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOath(oath.id.toString());
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default LikeRanking;