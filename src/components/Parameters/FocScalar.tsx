import { Grid, Slider, TextField, Typography,Chip, Button} from "@mui/material";
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
  const [targetValueEntry, setTargetValueEntry] = useState<string | "">(""); // value sent to controller
  const [stepValue, setStepValue] = useState<number | props.step>(props.step); // value sent to controller
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
          setTargetValueEntry(receivedValue.toString());
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

  const handleSetZero = () => {
    setTargetValue(0);
    changeValue(0);
    setTargetValueEntry("0");
  };

  const handleAddValue = (dir: number) => {
    if (targetValueEntry === null) return;
    if (targetValue === null) return;
    if (stepValue === null) return;
    setTargetValue(targetValue+dir*stepValue);
    changeValue(targetValue+dir*stepValue);
    setTargetValueEntry((targetValue+dir*stepValue).toString());
  };

  const handleStepChange = (e: any) => {
    setStepValue(e.target.value);
  };

  const handleEntryChange = (e: any) => {
    setTargetValueEntry(e.target.value);
    if (e.target.value === 0 && targetValueEntry === null) return;
    if (e.target.value == "" || typeof parseFloat(targetValueEntry) !== "number" ) return;
    setTargetValue(parseFloat(e.target.value));
    changeValue(parseFloat(e.target.value));
  };

  const handleSliderChange = (e: any) => {
    if (e.target.value === 0 && targetValue === null) {
      return;
    }
    setTargetValue(e.target.value);
    setTargetValueEntry(e.target.value);
    changeValue(e.target.value);
  };

  return (
    <Accordion
      expanded={expanded}
      // onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{ backgroundColor: "grey.50" }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon 
          onClick={() => setExpanded(!expanded)}
          />}
        sx={{ alignItems: "center" }}
      >
        <Typography        
        onClick={() => setExpanded(!expanded)}
        >{props.label}</Typography>
        <div 
          onClick={() => setExpanded(!expanded)}
          style={{ flex: 1 }} />
        
        <Typography style={{marginTop: 4}}>Jog step:</Typography>
        <div style={{ marginRight: 10}} />
        
        <TextField
          value={stepValue}
          onChange={handleStepChange}
          variant="standard"
          type="number"
          style = {{width: 70}}
        />
        <div style={{ marginRight: 10}} />
        <Chip variant="filled"
          color="primary"
          onClick={()=>{handleAddValue(1);}}
          label="+"
          /> 
        <div style={{ marginRight: 10}} />  
        <Chip variant="filled"
          color="primary"
          onClick={()=>{handleAddValue(-1);}}
          label="--"
          /> 
        <div style={{ marginRight: 10}} />
        <Chip variant="filled"
          color="primary"
          onClick={handleSetZero}
          label="Zero"
          /> 
        <div onClick={() => setExpanded(!expanded)} style={{ paddingRight: 200}} />
        <TextField
          value={targetValueEntry }
          onChange={handleEntryChange}
          variant="standard"
          sx={{ marginRight: 2 }}
          type="number" 
          inputProps={{
            step: props.step
          }}
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
