import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import PortLayoutCanvas from '../../components/portMap/PortLayoutCanvas';
import { MOCK_PORT_LAYOUT } from '../../types/portLayout';
import type { Berth, Ship, Crane } from '../../types/portLayout';
import { usePortMapSocket } from '../../hooks/usePortMapSocket';

const PortMapPage: React.FC = () => {
  const [portLayout, setPortLayout] = useState(MOCK_PORT_LAYOUT);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedBerth, setSelectedBerth] = useState<Berth | null>(null);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [selectedCrane, setSelectedCrane] = useState<Crane | null>(null);

  // WebSocket real-time updates
  usePortMapSocket({
    onBerthUpdate: useCallback((data) => {
      setPortLayout((prev) => ({
        ...prev,
        berths: prev.berths.map((berth) =>
          berth.id === data.id ? { ...berth, ...data } : berth
        ),
      }));
    }, []),
    onShipUpdate: useCallback((data) => {
      setPortLayout((prev) => ({
        ...prev,
        ships: prev.ships.map((ship) =>
          ship.id === data.id ? { ...ship, ...data } : ship
        ),
      }));
    }, []),
    onCraneUpdate: useCallback((data) => {
      setPortLayout((prev) => ({
        ...prev,
        cranes: prev.cranes.map((crane) =>
          crane.id === data.id ? { ...crane, ...data } : crane
        ),
      }));
    }, []),
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false),
  });

  const handleBerthClick = (berth: Berth) => {
    setSelectedBerth(berth);
  };

  const handleShipClick = (ship: Ship) => {
    setSelectedShip(ship);
  };

  const handleCraneClick = (crane: Crane) => {
    setSelectedCrane(crane);
  };

  const handleRefresh = () => {
    setPortLayout(MOCK_PORT_LAYOUT);
  };

  const handleExport = () => {
    // TODO: Implement export to PNG/PDF
    console.log('Export port map');
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Bản Đồ Cảng - {portLayout.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={isConnected ? 'Kết nối' : 'Mất kết nối'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
            <Tooltip title="Làm mới">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xuất bản đồ">
              <IconButton onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cài đặt">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
              />
            }
            label="Hiện bản đồ nhiệt (Heatmap)"
          />
          <Chip
            label={`${portLayout.berths.length} bến`}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${portLayout.ships.length} tàu`}
            color="info"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${portLayout.cranes.length} cẩu`}
            color="warning"
            variant="outlined"
            size="small"
          />
        </Stack>
      </Box>

      {/* Map Canvas */}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <PortLayoutCanvas
          portLayout={portLayout}
          showHeatmap={showHeatmap}
          onBerthClick={handleBerthClick}
          onShipClick={handleShipClick}
          onCraneClick={handleCraneClick}
        />
      </Box>

      {/* Berth Detail Dialog */}
      <Dialog
        open={!!selectedBerth}
        onClose={() => setSelectedBerth(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedBerth && (
          <>
            <DialogTitle>
              Chi Tiết Bến {selectedBerth.code} - {selectedBerth.name}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái:
                  </Typography>
                  <Chip
                    label={selectedBerth.status}
                    color={
                      selectedBerth.status === 'AVAILABLE'
                        ? 'success'
                        : selectedBerth.status === 'OCCUPIED'
                        ? 'primary'
                        : selectedBerth.status === 'RESERVED'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại bến:
                  </Typography>
                  <Typography>{selectedBerth.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Độ sâu tối đa:
                  </Typography>
                  <Typography>{selectedBerth.maxDraft}m</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chiều dài tối đa:
                  </Typography>
                  <Typography>{selectedBerth.maxLength}m</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Độ sử dụng:
                  </Typography>
                  <Typography>{selectedBerth.utilization}%</Typography>
                </Box>
                {selectedBerth.currentShip && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tàu hiện tại:
                    </Typography>
                    <Typography fontWeight="bold">
                      {selectedBerth.currentShip.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đến: {new Date(selectedBerth.currentShip.arrivalTime).toLocaleString('vi-VN')}
                    </Typography>
                    {selectedBerth.currentShip.departureTime && (
                      <Typography variant="body2" color="text.secondary">
                        Rời: {new Date(selectedBerth.currentShip.departureTime).toLocaleString('vi-VN')}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedBerth(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Ship Detail Dialog */}
      <Dialog
        open={!!selectedShip}
        onClose={() => setSelectedShip(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedShip && (
          <>
            <DialogTitle>Chi Tiết Tàu - {selectedShip.name}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại tàu:
                  </Typography>
                  <Typography>{selectedShip.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kích thước:
                  </Typography>
                  <Typography>
                    {selectedShip.length}m x {selectedShip.width}m
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mớn nước:
                  </Typography>
                  <Typography>{selectedShip.draft}m</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái:
                  </Typography>
                  <Chip label={selectedShip.status} color="primary" size="small" />
                </Box>
                {selectedShip.eta && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dự kiến đến:
                    </Typography>
                    <Typography>
                      {new Date(selectedShip.eta).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                )}
                {selectedShip.etd && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dự kiến rời:
                    </Typography>
                    <Typography>
                      {new Date(selectedShip.etd).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedShip(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Crane Detail Dialog */}
      <Dialog
        open={!!selectedCrane}
        onClose={() => setSelectedCrane(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCrane && (
          <>
            <DialogTitle>
              Chi Tiết Cẩu {selectedCrane.code} - {selectedCrane.name}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại cẩu:
                  </Typography>
                  <Typography>{selectedCrane.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sức nâng:
                  </Typography>
                  <Typography>{selectedCrane.capacity} tấn</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái:
                  </Typography>
                  <Chip
                    label={selectedCrane.status}
                    color={
                      selectedCrane.status === 'AVAILABLE'
                        ? 'success'
                        : selectedCrane.status === 'IN_USE'
                        ? 'primary'
                        : selectedCrane.status === 'MAINTENANCE'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
                {selectedCrane.currentTask && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Công việc hiện tại:
                    </Typography>
                    <Typography fontWeight="bold">
                      {selectedCrane.currentTask.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bắt đầu: {new Date(selectedCrane.currentTask.startTime).toLocaleString('vi-VN')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCrane(null)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PortMapPage;
