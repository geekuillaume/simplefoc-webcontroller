import { Chip, Stack, TextField, Slider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { KeyboardEventHandler, useState, MouseEventHandler } from "react";
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

  
  const handleMachineReadable = () => {
    serial?.send("@3");
  };

  return (
    <Stack gap={2} direction={"row"}>
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
        <Stack gap={2} direction={"column"}>
          <Chip clickable label="Force machine readable mode" onClick={handleMachineReadable} />
          <Chip clickable label="Restart" onClick={handleRestart} />
        </Stack>
      </Stack>
  );
};
