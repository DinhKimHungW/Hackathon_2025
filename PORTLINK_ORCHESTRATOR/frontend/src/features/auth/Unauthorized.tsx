import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Block as BlockIcon } from '@mui/icons-material';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <BlockIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          403
        </Typography>
        
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Truy cập bị từ chối
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
          >
            Về trang chủ
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
