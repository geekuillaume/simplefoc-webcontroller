import { useEffect } from "react";
import { useLastValue } from "./useLastValue";

export const useInterval = (callback: () => any, interval: number) => {
  const callbackRef = useLastValue(callback);
  useEffect(() => {
    const intervalRef = setInterval(() => {
      callbackRef.current();
    }, interval);
    return () => {
      clearInterval(intervalRef);
    };
  }, [interval]);
};
