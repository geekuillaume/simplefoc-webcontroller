import {
  Backdrop,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useAvailablePorts } from "../lib/useAvailablePorts";
import { SimpleFocSerialPort } from "../simpleFoc/serial";
import { SerialCommandPrompt } from "./SerialCommandPrompt";
import { SerialOutputViewer } from "./SerialOutputViewer";

const BAUD_RATES = 
[
  300,
  1200,
  2400,
  4800,
  9600,
  11200,
  19200,
  38400,
  57600,
  74880,
  115200,
  230400,
  250000,
  921600
];

export const SerialManager = ({
  onSetSerial,
  serial,
  ...other
}: {
  serial: SimpleFocSerialPort | null;
  onSetSerial: (serial: SimpleFocSerialPort | null) => any;
}) => {
  const [baudRate, setBaudRate] = useState(BAUD_RATES[1]);
  const [loading, setLoading] = useState(false);
  const ports = useAvailablePorts();

  const handleConnect = async (port?: SerialPort) => {
    const serial = new SimpleFocSerialPort(baudRate);
    setLoading(true);
    try {
      await serial.open(port);
      onSetSerial(serial);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await serial?.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ gridColumn: "span 12" }} {...other}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Stack gap={3} alignContent="center" alignItems="stretch">
            <Typography variant="h5" gutterBottom>
              Serial
            </Typography>
            <TextField
              select
              label="Baud Rate"
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
            >
              {BAUD_RATES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <ButtonGroup variant="contained">
              <Button
                sx={{ flex: 1 }}
                disabled={!!serial && !!serial.port}
                onClick={() => handleConnect()}
              >
                Connect
              </Button>
              <Button
                sx={{ flex: 1 }}
                disabled={!serial || !serial.port}
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </ButtonGroup>
            {!!ports.length && (
              <Stack gap={1} alignContent="center" alignItems="stretch">
                <Typography sx={{ color: "grey.800" }}>
                  Previously connected:
                </Typography>
                {ports.map((port, i) => (
                  <Chip
                    key={i}
                    clickable
                    disabled={!!serial && !!serial.port}
                    label={`${port.getInfo().usbVendorId} - ${
                      port.getInfo().usbProductId
                    }`}
                    onClick={() => handleConnect(port)}
                  />
                ))}
              </Stack>
            )}
          </Stack>
          <Stack flex={1} gap={1}>
            <SerialOutputViewer />
            <SerialCommandPrompt />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
