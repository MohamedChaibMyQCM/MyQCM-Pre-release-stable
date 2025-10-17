import { BadRequestException } from "@nestjs/common";
import * as multer from "multer";

const allowedMimeTypes = new Set([
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const allowedExtensions = new Set([".csv", ".xls", ".xlsx"]);

const hasAllowedExtension = (filename: string) => {
  const lower = filename.toLowerCase();
  for (const ext of allowedExtensions) {
    if (lower.endsWith(ext)) {
      return true;
    }
  }
  return false;
};

export const SpreadsheetMulterConfig: multer.Options = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (
      allowedMimeTypes.has(file.mimetype) ||
      hasAllowedExtension(file.originalname)
    ) {
      cb(null, true);
      return;
    }

    const error = new BadRequestException("Unsupported spreadsheet format");
    (cb as unknown as (error: Error | null, acceptFile: boolean) => void)(
      error,
      false,
    );
  },
};
