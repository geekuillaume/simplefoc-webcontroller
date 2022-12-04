import { useCallback, useEffect, useState } from "react";

export const useAvailablePorts = () => {
  const [ports, setPorts] = useState([] as SerialPort[]);

  const refreshPorts = useCallback(() => {
    navigator.serial
      .getPorts()
      .then((ports) => {
        setPorts(ports);
      })
      .catch((e) => {
        console.error("Error while listing ports", e);
      });
  }, []);

  useEffect(() => {
    navigator.serial.addEventListener("connect", refreshPorts);
    navigator.serial.addEventListener("disconnect", refreshPorts);
    refreshPorts();
    return () => {
      navigator.serial.removeEventListener("connect", refreshPorts);
      navigator.serial.removeEventListener("disconnect", refreshPorts);
    };
  }, []);

  return ports;
};
