import { throttle } from "lodash-es";
import { useCallback, useMemo, useState } from "react";

export function assertExist<T>(a: T | undefined): asserts a is T {
  if (!a) {
    throw new Error("Undefined");
  }
}

export function assert(a: any, msg: string = "assert failed"): void {
  if (!a) {
    throw new Error(msg);
  }
}

export const useRerender = () => {
  const [, setNotUsed] = useState(0);
  return useCallback(() => {
    setNotUsed((n) => n + 1);
  }, []);
};

export const useThrotthledRerender = (delay: number) => {
  const [, setNotUsed] = useState(0);
  return useMemo(() => {
    return throttle(() => {
      setNotUsed((n) => n + 1);
    }, delay);
  }, [delay]);
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
