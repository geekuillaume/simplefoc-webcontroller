import { Stack, Switch, Typography } from "@mui/material";
import { useState } from "react";
import { useSerialPort } from "../../lib/serialContext";
import { useSerialIntervalSender } from "../../lib/useSerialIntervalSender";
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
  const fullCommandString = `${props.motorKey}${props.command}`;

  const [value, setValue] = useState(false);
  const serialPort = useSerialPort();
  useSerialLineEvent((line) => {
    if (line.content.startsWith(fullCommandString)) {
      const receivedValue = line.content.slice(fullCommandString.length);
      if (receivedValue !== props.onValue && receivedValue !== props.offValue) {
        console.warn(
          `Received value for motor ${props.motorKey} and command ${props.command} which doesn't match on or off value: ${line.content}`,
          { onValue: props.onValue, offValue: props.offValue }
        );
        return;
      }
      setValue(receivedValue === props.onValue ? true : false);
    }
  });

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    serialPort?.send(
      `${fullCommandString}${
        event.target.checked ? props.onValue : props.offValue
      }`
    );
    setValue(event.target.checked);
  };

  useSerialIntervalSender(fullCommandString, 5000);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography>{props.offLabel}</Typography>
      <Switch checked={value} onChange={onChange} />
      <Typography>{props.onLabel}</Typography>
    </Stack>
  );
};
