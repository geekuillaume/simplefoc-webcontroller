import { useEffect } from "react";
import { useSerialPort, useSerialPortOpenStatus } from "./serialContext";

// send the command every X miliseconds and directly after the serial is connected
export const useSerialIntervalSender = (command: string, interval: number) => {
  const serial = useSerialPort();
  const status = useSerialPortOpenStatus();

  useEffect(() => {
    if (!status) {
      return;
    }

    serial?.send(command);
    const intervalRef = setInterval(() => {
      serial?.send(command);
    }, interval);
    return () => {
      clearInterval(intervalRef);
    };
  }, [serial, command, interval, status]);
};
