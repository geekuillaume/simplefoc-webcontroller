import { createContext, useContext, useEffect, useRef } from "react";
import { SimpleFocSerialPort } from "../simpleFoc/serial";
import { useLastValue } from "./useLastValue";
import { useRerender, useThrotthledRerender } from "./utils";

export const serialPortContext = createContext<SimpleFocSerialPort | null>(
  null
);

export const useSerialPort = () => {
  return useContext(serialPortContext);
};

export const useSerialPortLines = () => {
  const serial = useContext(serialPortContext);
  const rerender = useThrotthledRerender(100);

  useEffect(() => {
    if (!serial) {
      return;
    }
    const lineHandler = () => {
      rerender();
    };
    serial.on("line", lineHandler);

    return () => {
      serial.off("line", lineHandler);
    };
  }, [serial]);
  return serial?.lines || [];
};

export const useSerialPortRef = () => {
  return useLastValue(useContext(serialPortContext));
};

export const useSerialPortOpenStatus = () => {
  const serialPort = useSerialPort();
  const rerender = useRerender();
  useEffect(() => {
    serialPort?.addListener("stateChange", rerender);
    return () => {
      serialPort?.removeListener("stateChange", rerender);
    };
  }, []);

  return !!serialPort?.port;
};
