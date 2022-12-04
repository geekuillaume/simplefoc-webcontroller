export class LineBreakTransformer implements Transformer<string, string> {
  chunks = "";

  transform: TransformerTransformCallback<string, string> = (
    chunk,
    controller
  ) => {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop() || "";
    lines.forEach((line) => controller.enqueue(line));
  };

  flush: TransformerFlushCallback<string> = (controller) => {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  };
}
