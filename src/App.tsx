import { useState } from "react";
import "./App.css";
import { SimpleFocSerialPort } from "./simpleFoc/serial";
import Header from "./components/Header";
import { Box, Stack } from "@mui/material";
import { SerialManager } from "./components/SerialManager";
import { Container } from "@mui/system";
import { Motors } from "./components/Motors";
import { serialPortContext } from "./lib/serialContext";

function App() {
  const [serial, setSerial] = useState<SimpleFocSerialPort | null>(null);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <Header />
      <Container maxWidth="lg">
        <Stack gap={3} paddingTop={3}>
          <serialPortContext.Provider value={serial}>
            <SerialManager onSetSerial={setSerial} serial={serial} />
            <Motors />
          </serialPortContext.Provider>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
