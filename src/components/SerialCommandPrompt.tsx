import { Chip, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { KeyboardEventHandler, useState } from "react";
import { useSerialPort } from "../lib/serialContext";
import { SimpleFocSerialPort } from "../simpleFoc/serial";

export const SerialCommandPrompt = () => {
  const serial = useSerialPort();
  const [promptValue, setPromptValue] = useState("");

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.code === "Enter" && serial) {
      serial.send(promptValue);
      setPromptValue("");
    }
  };

  const handleStoredCommandClick = (command: string) => () => {
    serial?.send(command);
  };

  const handleRestart = () => {
    serial?.restartTarget();
  };

  return (
    <Stack gap={2}>
      <Box flex={1} sx={{ display: "flex" }}>
        <TextField
          disabled={!serial}
          variant="outlined"
          label="Command"
          value={promptValue}
          onChange={(e) => setPromptValue(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1 }}
        />
      </Box>
      <Stack gap={3} direction={"row"}>
        <Chip clickable label="Restart" onClick={handleRestart} />
        <Chip
          clickable
          label="Disable monitoring"
          onClick={handleStoredCommandClick("NMC")}
        />
        <Chip
          clickable
          label="Enable monitoring"
          onClick={handleStoredCommandClick("NMS01100011")}
        />
      </Stack>
    </Stack>
  );
};
