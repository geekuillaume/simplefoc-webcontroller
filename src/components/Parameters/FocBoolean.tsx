import { Stack, Switch, Typography } from "@mui/material";
import { useState } from "react";
import { useSerialPort } from "../../lib/serialContext";
import { useSerialLineEvent } from "../../lib/useSerialLineEvent";
import { SimpleFocSerialPort } from "../../simpleFoc/serial";

export const FocBoolean = (props: {
  label: string;
  motorKey: string;
  onLabel: string;
  offLabel: string;
  command: string;
  onValue: string;
  offValue: string;
}) => {
  const [value, setValue] = useState(false);
  const serialPort = useSerialPort();
  useSerialLineEvent((line) => {
    if (line.content.startsWith(`${props.motorKey}${props.command}`)) {
      console.log("Got matching line:", line);
    }
  });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    serialPort?.send(
      `${props.motorKey}${props.command}${
        event.target.checked ? props.onValue : props.offValue
      }`
    );
    setValue(event.target.checked);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography>{props.offLabel}</Typography>
      <Switch checked={value} onChange={onChange} />
      <Typography>{props.onLabel}</Typography>
    </Stack>
  );
};
