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

  const setCharAt = (str:string,index:number,chr:string) => {
    if(index > str.length-1) return str;
    index = index+1;
    return str.substring(0,index) + chr + str.substring(index+1);
  }
  const getCheckboxValue = (id:string) => {
    var element = document.getElementById(id) as HTMLInputElement | null;
    if (element == null) return "0";
    else return element.checked ? "1" : "0";
  }

  const changeValue = useMemo(
    () =>
      throttle((value: string) => {
        serialRef.current?.send(`${fullCommandString}${value}`);
      }, 200),
    []
  );

  const updateMonitoredVars = ()=>{
    monitoredVars=setCharAt(monitoredVars, 0, getCheckboxValue('tar'));
    monitoredVars=setCharAt(monitoredVars, 1, getCheckboxValue('vq'));
    monitoredVars=setCharAt(monitoredVars, 2, getCheckboxValue('vd'));
    monitoredVars=setCharAt(monitoredVars, 3, getCheckboxValue('cq'));
    monitoredVars=setCharAt(monitoredVars, 4, getCheckboxValue('cd'));
    monitoredVars=setCharAt(monitoredVars, 5, getCheckboxValue('vel'));
    monitoredVars=setCharAt(monitoredVars, 6, getCheckboxValue('angle'));
    changeValue(monitoredVars);
    console.log(monitoredVars)
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
