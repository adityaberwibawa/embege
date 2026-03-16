/* eslint-disable @typescript-eslint/no-explicit-any */
export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case "txt":
      return buffer.toString("utf-8");

    case "pdf": {
      const raw = buffer.toString("latin1");
      const matches = raw.match(/\(([^)]{2,200})\)/g) || [];
      const text = matches
        .map((m: string) => m.slice(1, -1))
        .filter((t: string) => /[a-zA-Z]{2,}/.test(t))
        .join(" ")
        .replace(/\\n/g, "\n")
        .replace(/\\/g, "");
      return text || buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
    }

    case "docx": {
      const mammoth = await import("mammoth") as any;
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    case "pptx": {
      const text = buffer.toString("utf-8");
      return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    default:
      return buffer.toString("utf-8");
  }
}