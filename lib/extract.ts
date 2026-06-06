/* eslint-disable @typescript-eslint/no-explicit-any */
export async function extractText(buffer: Buffer, fileType: string, fileUrl?: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case "txt":
      return buffer.toString("utf-8");

    case "pdf": {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        let text = data.text;

        // Jika teks sangat sedikit (mungkin ini PDF hasil scan gambar)
        if (text.trim().length < 50 && fileUrl) {
          console.log("PDF tampaknya hasil scan, mencoba OCR...");
          const apiKey = process.env.OCR_SPACE_API_KEY || "helloworld";
          const ocrUrl = `https://api.ocr.space/parse/imageurl?apikey=${apiKey}&url=${encodeURIComponent(fileUrl)}&language=eng&isOverlayRequired=false&filetype=pdf`;
          
          console.log("Memanggil OCR.space dengan URL:", fileUrl);
          const response = await fetch(ocrUrl);
          const ocrData = await response.json();
          
          console.log("OCR.space Response:", JSON.stringify(ocrData));
          
          if (ocrData.IsErroredOnProcessing) {
            const errorMsg = ocrData.ErrorMessage ? ocrData.ErrorMessage.join(", ") : "Unknown OCR error";
            throw new Error(`OCR Space Error: ${errorMsg}`);
          }
          
          if (ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
            text = ocrData.ParsedResults.map((r: any) => r.ParsedText).join("\n");
          } else {
            throw new Error("OCR Space tidak mengembalikan hasil teks.");
          }
        }
        return text;
      } catch (err: any) {
        console.error("Gagal mengekstrak PDF:", err);
        throw err;
      }
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