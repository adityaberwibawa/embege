// Extract plain text from uploaded files
export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case "txt":
      return buffer.toString("utf-8");

    case "pdf": {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return data.text;
    }

    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    case "pptx": {
      // Basic PPTX text extraction via XML parsing
      const { unzipSync } = await import("zlib");
      try {
        // Read PPTX as zip, extract slide XMLs
        const text = buffer.toString("utf-8");
        // Strip XML tags for basic extraction
        return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      } catch {
        return "Konten PPTX tidak dapat diekstrak sepenuhnya.";
      }
    }

    default:
      return buffer.toString("utf-8");
  }
}
