import { Box } from "@mui/system";
import { FixedSizeList } from "react-window";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSerialPort, useSerialPortLines } from "../lib/serialContext";
import { SerialLine } from "../simpleFoc/serial";

const SerialLineDisplay = ({
  index,
  style,
  data,
}: {
  index: number;
  style: any;
  data: SerialLine[];
}) => (
  <div
    style={{
      ...style,
      lineHeight: "10px",
      fontSize: "13px",
      padding: "0 10px",
      fontFamily: "monospace",
    }}
  >
    {data[index].type === "received" ? "➡️" : "⬅️"}
    &nbsp;
    {data[index].content}
  </div>
);

const serialLinesToKey = (index: number, data: SerialLine[]) => {
  return data[index].index;
};

const SerialLinesList = FixedSizeList<SerialLine[]>;

export const SerialOutputViewer = () => {
  const listRef = useRef<any>();
  const listOuterRef = useRef<any>();
  const lines = useSerialPortLines();

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    if (
      listOuterRef.current &&
      listOuterRef.current?.scrollHeight -
        (listOuterRef.current?.scrollTop + listOuterRef.current?.clientHeight) <
        300
    ) {
      listRef.current.scrollToItem(lines.length ? lines.length - 1 : 0);
    }
  }, [lines]);

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: "grey.200",
          border: "1px solid",
          borderColor: "grey.400",
          flex: 1,
          height: 300,
          contain: "content",
        }}
      >
        <SerialLinesList
          itemData={lines}
          itemCount={lines.length}
          height={300}
          itemSize={20}
          width="100%"
          itemKey={serialLinesToKey}
          ref={listRef}
          outerRef={listOuterRef}
        >
          {SerialLineDisplay}
        </SerialLinesList>
      </Box>
    </Box>
  );
};
