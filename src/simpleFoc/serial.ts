import EventEmitter from "eventemitter3";
import { LineBreakTransformer } from "../lib/LineBreakTransformer";
import { assert, assertExist, delay } from "../lib/utils";

const MAX_LINES_IN_BUFFER = 10000000;

export type SerialLine = {
  index: number;
  content: string;
  type: "received" | "sent";
};

export class SimpleFocSerialPort extends EventEmitter<"line" | "stateChange"> {
  port: SerialPort | undefined;
  writer: WritableStreamDefaultWriter<string> | undefined;

  _closeReader: undefined | (() => any);
  _closeWriter: undefined | (() => any);

  lastLineIndex = 0;
  lines = [] as SerialLine[];

  constructor(public baudRate: number) {
    super();
  }

  async open(existingPort?: SerialPort) {
    assert(!this.port, "Port is already open");
    const port =
      existingPort ||
      (await navigator.serial.requestPort({
        filters: [],
      }));
    await port.open({
      baudRate: this.baudRate,
      bufferSize: 1024,
    });

    assert(!this.port, "Port is already open");
    this.port = port;

    if (port.writable) {
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
      this.writer = textEncoder.writable.getWriter();

      this._closeWriter = async () => {
        this.writer?.close();
        await writableStreamClosed;
        this._closeWriter = undefined;
      };
    }
    this._readLoop();
    this.emit("stateChange");
  }

  private async _readLoop() {
    assertExist(this.port);
    while (this.port?.readable) {
      // will restart a loop if a non-fatal error was triggered
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(
        textDecoder.writable
      );

      const reader = textDecoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();

      this._closeReader = async () => {
        await reader.cancel();
        await readableStreamClosed.catch(() => {});
        this._closeReader = undefined;
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          this.handleLine(value, "received");
        }
      } catch (error) {
        console.error(error);
        // Handle |error|...
      } finally {
        reader.releaseLock();
      }
    }
  }

  async close() {
    if (!this.port) {
      throw new Error("Already closed");
    }
    const port = this.port;
    this.port = undefined;

    await this._closeReader?.();
    await this._closeWriter?.();

    await port.close();
    this.emit("stateChange");
  }

  private handleLine(line: string, type: SerialLine["type"]) {
    const serialLine: SerialLine = {
      index: this.lastLineIndex,
      content: line,
      type,
    };
    this.lastLineIndex += 1;
    this.lines.push(serialLine);
    this.lines = this.lines.slice(-MAX_LINES_IN_BUFFER);
    this.emit("line", serialLine);
  }

  async send(line: string) {
    this.writer?.write(`${line}\n`);
    this.handleLine(line, "sent");
  }

  async restartTarget() {
    assertExist(this.port);
    await this.port.setSignals({ dataTerminalReady: false });
    await delay(200);
    await this.port.setSignals({ dataTerminalReady: true });
  }
}
