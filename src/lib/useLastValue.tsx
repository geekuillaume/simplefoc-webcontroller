import { useRef } from "react";

export function useLastValue<T>(value: T): { current: T } {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
