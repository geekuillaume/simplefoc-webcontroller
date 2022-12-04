import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSerialPortRef } from "../../lib/serialContext";
import { useSerialIntervalSender } from "../../lib/useSerialIntervalSender";
import { useSerialLineEvent } from "../../lib/useSerialLineEvent";

const CONTROL_VALUES = ["torque", "vel", "angle", "vel open", "angle open"];

const CONTROL_VALUE_TO_INDEX = {
  torque: 0,
  vel: 1,
  angle: 2,
  "vel open": 3,
  "angle open": 4,
} as any;

export const MotorControlTypeSwitch = ({ motorKey }: { motorKey: string }) => {
  const fullCommandString = `${motorKey}C`;
  const [value, setValue] = useState<string | null>(null);
  const serialRef = useSerialPortRef();

  const handleChange = (e: any, val: string) => {
    serialRef.current?.send(
      `${fullCommandString}${CONTROL_VALUE_TO_INDEX[val]}`
    );
  };

  useSerialLineEvent((line) => {
    if (
      line.content.startsWith(fullCommandString) &&
      // need to filter out the downsample command too which is "{motorKey}CD"
      CONTROL_VALUES.map((val) => fullCommandString + val).some(
        (val) => line.content === val
      )
    ) {
      const receivedValue = line.content.slice(fullCommandString.length);
      setValue(receivedValue);
      console.log(receivedValue);
    }
  });
  useSerialIntervalSender(fullCommandString, 5000);

  return (
    <Stack alignItems="center" sx={{ marginBottom: 2 }}>
      <ToggleButtonGroup value={value} exclusive onChange={handleChange}>
        <ToggleButton value="torque">Torque</ToggleButton>
        <ToggleButton value="vel">Velocity</ToggleButton>
        <ToggleButton value="angle">Angle</ToggleButton>
        <ToggleButton value="vel open">Velocity open</ToggleButton>
        <ToggleButton value="angle open">Angle open</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
};
