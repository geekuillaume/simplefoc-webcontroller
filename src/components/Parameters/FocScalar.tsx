import { Grid, Slider, TextField, Typography } from "@mui/material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "../ParametersAccordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { throttle } from "lodash-es";
import { useMemo, useState } from "react";
import { useSerialPortRef } from "../../lib/serialContext";
import { useSerialIntervalSender } from "../../lib/useSerialIntervalSender";
import { useSerialLineEvent } from "../../lib/useSerialLineEvent";
import { useParameterSettings } from "../../lib/useParameterSettings";

export const FocScalar = (props: {
  motorKey: string;
  command: string;
  label: string;
  defaultMin: number;
  defaultMax: number;
  step: number;
}) => {
  const fullCommandString = `${props.motorKey}${props.command}`;
  const { expanded, setExpanded, min, setMin, max, setMax } =
    useParameterSettings(fullCommandString, props.defaultMin, props.defaultMax);

  const [targetValue, setTargetValue] = useState<number | null>(null); // value sent to controller
  const [value, setValue] = useState<number | null>(null); // value acknowledged by controller, for now not used
  const serialRef = useSerialPortRef();

  useSerialLineEvent((line) => {
    if (line.content.startsWith(fullCommandString)) {
      const receivedValue = Number(
        line.content.slice(fullCommandString.length)
      );
      if (!isNaN(receivedValue)) {
        setValue(receivedValue);
        if (targetValue === null) {
          setTargetValue(receivedValue);
        }
      }
    }
  });
  useSerialIntervalSender(fullCommandString, 3000);

  const changeValue = useMemo(
    () =>
      throttle((value: number) => {
        serialRef.current?.send(`${fullCommandString}${value}`);
      }, 200),
    []
  );

  const handleSliderChange = (e: any) => {
    if (e.target.value === 0 && targetValue === null) {
      return;
    }
    setTargetValue(e.target.value);
    changeValue(e.target.value);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{ backgroundColor: "grey.50" }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ alignItems: "center" }}
      >
        <Typography>{props.label}</Typography>
        <div style={{ flex: 1 }} />
        <TextField
          value={typeof targetValue === "number" ? targetValue : 0}
          onChange={handleSliderChange}
          variant="standard"
          sx={{ marginRight: 2 }}
          type="number"
        />
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              size="small"
              type="number"
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
              sx={{ width: 70 }}
            />
          </Grid>
          <Grid item xs>
            <Slider
              value={typeof targetValue === "number" ? targetValue : 0}
              track={false}
              onChange={handleSliderChange}
              valueLabelDisplay="on"
              min={min}
              max={max}
              step={props.step}
            />
          </Grid>
          <Grid item>
            <TextField
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              size="small"
              type="number"
              variant="standard"
              inputProps={{ style: { textAlign: "center" } }}
              sx={{ width: 70 }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
