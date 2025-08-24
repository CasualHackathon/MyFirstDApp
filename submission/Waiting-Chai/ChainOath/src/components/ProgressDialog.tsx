import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Close as CloseIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description?: string;
  error?: string;
}

export interface ProgressDialogProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  steps: ProgressStep[];
  currentStepIndex: number;
  progress?: number; // 0-100
  canClose?: boolean;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({
  open,
  onClose,
  title,
  steps,
  currentStepIndex,
  progress = 0,
  canClose = false
}) => {
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'running':
        return (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <LinearProgress
              variant="indeterminate"
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '50%'
                }
              }}
            />
          </Box>
        );
      default:
        return <PendingIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'running':
        return 'primary.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={canClose && onClose ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 400
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {canClose && onClose && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* 总体进度条 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              总体进度
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4
              }
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* 步骤列表 */}
        <List sx={{ py: 0 }}>
          {steps.map((step, index) => (
            <ListItem
              key={step.id}
              sx={{
                px: 0,
                py: 1,
                bgcolor: index === currentStepIndex ? 'action.hover' : 'transparent',
                borderRadius: 1,
                mb: 0.5
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getStepIcon(step)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      color: getStepColor(step),
                      fontWeight: index === currentStepIndex ? 'bold' : 'normal'
                    }}
                  >
                    {step.label}
                  </Typography>
                }
                secondary={
                  <Box>
                    {step.description && (
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    )}
                    {step.error && (
                      <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                        错误: {step.error}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* 当前步骤详情 */}
        {currentStepIndex < steps.length && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              当前步骤
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {steps[currentStepIndex]?.label}
            </Typography>
            {steps[currentStepIndex]?.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {steps[currentStepIndex].description}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;