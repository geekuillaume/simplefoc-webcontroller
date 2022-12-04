import { useEffect, useRef } from "react";
import { SerialLine } from "../simpleFoc/serial";
import { useSerialPort } from "./serialContext";

export const useSerialLineEvent = (callback: (line: SerialLine) => any) => {
  const serial = useSerialPort();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!serial) {
      return;
    }

    const lineHandler = (line: SerialLine) => {
      if (line.type === "received") {
        callbackRef.current(line);
      }
    };
    serial.on("line", lineHandler);
    return () => {
      serial.off("line", lineHandler);
    };
  }, [serial]);
};
