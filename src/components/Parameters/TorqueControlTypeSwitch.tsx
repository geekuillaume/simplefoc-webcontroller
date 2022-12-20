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

const TORQUE_VALUES = ["volt", "dc curr", "foc curr"];

const TORQUE_VALUE_TO_INDEX = {
  volt: 0,
  "dc curr": 1,
  "foc curr": 2
} as any;

export const TorqueControlTypeSwitch = ({ motorKey }: { motorKey: string }) => {
  const fullCommandString = `${motorKey}T`;
  const [value, setValue] = useState<string | null>(null);
  const serialRef = useSerialPortRef();

  const handleChange = (e: any, val: string) => {
    serialRef.current?.send(
      `${fullCommandString}${TORQUE_VALUE_TO_INDEX[val]}`
    );
  };

  useSerialLineEvent((line) => {
    if (
      line.content.startsWith(fullCommandString) &&
      // need to filter out the downsample command too which is "{motorKey}CD"
      TORQUE_VALUES.map((val) => fullCommandString + val).some(
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
    <Stack alignItems="center" direction="row" spacing={2}>
      <Typography>Torque mode:</Typography>
      <ToggleButtonGroup value={value} exclusive onChange={handleChange}>
        <ToggleButton value="volt">Voltage</ToggleButton>
        <ToggleButton value="dc curr">DC Current</ToggleButton>
        <ToggleButton value="foc curr">FOC current</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
};
