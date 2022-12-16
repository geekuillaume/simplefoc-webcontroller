import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "./ParametersAccordion";
import { red } from "@mui/material/colors";
import { useState } from "react";
import { useSerialIntervalSender } from "../lib/useSerialIntervalSender";
import { useSerialLineEvent } from "../lib/useSerialLineEvent";
import { FocBoolean } from "./Parameters/FocBoolean";
import { FocScalar } from "./Parameters/FocScalar";
import { Monitoring } from "./Parameters/Monitoring";
import { useSerialPortOpenStatus } from "../lib/serialContext";
import { TorqueControlTypeSwitch } from "./Parameters/TorqueControlTypeSwitch";
import { MotorControlTypeSwitch } from "./Parameters/MotorControlTypeSwitch";
import { Chip, Slider} from "@mui/material";
import { Box } from "@mui/system";
import { useSerialPort } from "../lib/serialContext";
import { SimpleFocSerialPort } from "../simpleFoc/serial";

const MOTOR_OUTPUT_REGEX = /^\?(\w):(.*)\r?$/;

export const Motors = () => {
  const [motors, setMotors] = useState<{ [key: string]: string }>({});
  const portOpen = useSerialPortOpenStatus();
  const serial = useSerialPort();

  useSerialIntervalSender("?", 10000);
  useSerialLineEvent((line) => {
    const match = line.content.match(MOTOR_OUTPUT_REGEX);
    if (match) {
      setMotors((m) => ({
        ...m,
        [match[1]]: match[2],
      }));
    }
  });

 
  if (!Object.keys(motors).length) {
    if (!portOpen) {
      return (
        <Stack gap={3} alignItems="center">
          <Typography variant="h4" sx={{ color: "grey.600" }}>
            Waiting for connection...
          </Typography>
        </Stack>
      );
    }
    return (
      <Stack gap={3} alignItems="center">
        <CircularProgress sx={{ color: "grey.600" }} />
        <Typography variant="h4" sx={{ color: "grey.600" }}>
          Waiting for motors list from controller...
        </Typography>
        <Typography sx={{ color: "grey.600" }}>
          Make sure to use "machine_readable" verbose mode
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack>
      {Object.entries(motors).map(([key, name]) => (
        <Card key={key}>
          <CardHeader
            title={<Typography variant="h5">{name}</Typography>}
            avatar={<Avatar sx={{ bgcolor: red[500] }}>{key}</Avatar>}
            action={
              <div style={{ marginRight: 15 }}>
                <FocBoolean
                  command="E"
                  label="Enabled"
                  motorKey={key}
                  offLabel="Off"
                  onLabel="On"
                  offValue="0"
                  onValue="1"
                />
              </div>
            }
          />
          <CardContent>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Motion Control</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" alignItems={"center"} spacing={2} sx={{ marginBottom: 1 }}>
                  <MotorControlTypeSwitch motorKey={key} />
                  <TorqueControlTypeSwitch motorKey={key} />
                </Stack>
                <FocScalar
                  motorKey={key}
                  command=""
                  label="Target"
                  defaultMin={-20}
                  defaultMax={20}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="CD"
                  label="Motion loop downsample"
                  defaultMin={0}
                  defaultMax={30}
                  step={1}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Current PID</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Current Q</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FocScalar
                  motorKey={key}
                  command="QP"
                  label="Propotionnal"
                  defaultMin={0}
                  defaultMax={5}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="QI"
                  label="Integral"
                  defaultMin={0}
                  defaultMax={40}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="QD"
                  label="Derivative"
                  defaultMin={0}
                  defaultMax={1}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="QR"
                  label="Output Ramp"
                  defaultMin={0}
                  defaultMax={10000}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="QL"
                  label="Output Limit"
                  defaultMin={0}
                  defaultMax={24}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="QF"
                  label="Filtering"
                  defaultMin={0}
                  defaultMax={0.2}
                  step={0.001}
                />
              </AccordionDetails>
            </Accordion><Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Current D</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FocScalar
                  motorKey={key}
                  command="DP"
                  label="Propotionnal"
                  defaultMin={0}
                  defaultMax={5}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="DI"
                  label="Integral"
                  defaultMin={0}
                  defaultMax={40}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="DD"
                  label="Derivative"
                  defaultMin={0}
                  defaultMax={1}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="DR"
                  label="Output Ramp"
                  defaultMin={0}
                  defaultMax={10000}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="DL"
                  label="Output Limit"
                  defaultMin={0}
                  defaultMax={24}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="DF"
                  label="Filtering"
                  defaultMin={0}
                  defaultMax={0.2}
                  step={0.001}
                />
              </AccordionDetails>
            </Accordion>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Velocity PID</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FocScalar
                  motorKey={key}
                  command="VP"
                  label="Propotionnal"
                  defaultMin={0}
                  defaultMax={5}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="VI"
                  label="Integral"
                  defaultMin={0}
                  defaultMax={40}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="VD"
                  label="Derivative"
                  defaultMin={0}
                  defaultMax={1}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="VR"
                  label="Output Ramp"
                  defaultMin={0}
                  defaultMax={10000}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="VL"
                  label="Output Limit"
                  defaultMin={0}
                  defaultMax={24}
                  step={0.0001}
                />
                <FocScalar
                  motorKey={key}
                  command="VF"
                  label="Filtering"
                  defaultMin={0}
                  defaultMax={0.2}
                  step={0.001}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Angle PID</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FocScalar
                  motorKey={key}
                  command="AP"
                  label="Propotionnal"
                  defaultMin={0}
                  defaultMax={5}
                  step={0.01}
                />
                <FocScalar
                  motorKey={key}
                  command="AL"
                  label="Output Limit"
                  defaultMin={0}
                  defaultMax={24}
                  step={0.0001}
                />
              </AccordionDetails>
            </Accordion>
            
          <Monitoring motorKey={key}/>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};
