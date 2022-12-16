import { Grid,
  Slider, 
  TextField, 
  Typography,
  Chip, 
  Button,
  Stack,
  Checkbox,
  FormControlLabel,} from "@mui/material";
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
import { FocScalar } from "./FocScalar";
import { MotorMonitorGraph } from "../MotorMonitorGraph";

import {useRef, useEffect} from 'react';

export const Monitoring = (props: {
  motorKey: string;
}) => {
  const fullCommandString = `${props.motorKey}MS`;
  const serialRef = useSerialPortRef();

  var monitoredVars = "0000000"

  function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    index = index+1;
    return str.substring(0,index) + chr + str.substring(index);
  }
  const changeValue = useMemo(
    () =>
      throttle((value: string) => {
        serialRef.current?.send(`${fullCommandString}${value}`);
      }, 200),
    []
  );

  const updateMonitoredVars = ()=>{
    monitoredVars=(setCharAt(monitoredVars, 0, document.getElementById('tar').checked ? "1" : "0"));
    monitoredVars=(setCharAt(monitoredVars, 1, document.getElementById('vq').checked ? "1" : "0"));
    monitoredVars=(setCharAt(monitoredVars, 2, document.getElementById('vd').checked ? "1" : "0"));
    monitoredVars=(setCharAt(monitoredVars, 3, document.getElementById('cq').checked ? "1" : "0"));
    monitoredVars=(setCharAt(monitoredVars, 4, document.getElementById('cd').checked ? "1" : "0"));
    monitoredVars=(setCharAt(monitoredVars, 5, document.getElementById('vel').checked ? "1" : "0"));
    monitoredVars=(setCharAt(monitoredVars, 6, document.getElementById('angle').checked ? "1" : "0"));
    changeValue(monitoredVars);
  }
  

  const handleStoredCommandClick = (command: string) => () => {
    serialRef.current?.send(command);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Monitoring Control</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={3} direction={"row"} style={{marginBottom:10}}>
          <Button  variant="outlined"
            // label="Disable monitoring"
            onClick={handleStoredCommandClick(props.motorKey+"MC")}
          > Disable monitoring</Button >
          <Button variant="outlined"
            // label="Enable monitoring"
            onClick={handleStoredCommandClick(props.motorKey+"MS01100011")}
          > Enable monitoring</Button>
        </Stack>
        
        <FocScalar
          motorKey = {props.motorKey}
          command="MD"
          label="Monitor Downsample"
          defaultMin={0}
          defaultMax={1000}
          step={1}
        />

      <Accordion 
          sx={{ backgroundColor: "grey.50" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Monitored Variables</Typography>
        </AccordionSummary>
        <AccordionDetails >
            <FormControlLabel
              control={
                <Checkbox
                  id="tar"
                  onChange={updateMonitoredVars}
                />}
              label="Target"
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="vq"
                  onChange={updateMonitoredVars}
                />}
              label="Voltage Q"
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="vd"
                  onChange={updateMonitoredVars}
                />}
                label="Voltage D"
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="cq"
                  onChange={updateMonitoredVars}
                />}
              label="Current Q"
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="cd"
                  onChange={updateMonitoredVars}
                />}
                label="Current D"
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="vel"
                  onChange={updateMonitoredVars}
                />}
              label="Velocity"
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="angle"
                  onChange={updateMonitoredVars}
                />}
              label="Angle"
            />
        </AccordionDetails>
    </Accordion>
      <MotorMonitorGraph motorKey={props.motorKey} />
      </AccordionDetails>
    </Accordion>
  );
};
