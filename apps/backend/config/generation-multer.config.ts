import { BadRequestException } from "@nestjs/common";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { randomUUID } from "crypto";

const allowedTypes = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const storageRoot = path.resolve(process.cwd(), "storage", "generation");

const ensureStorageRoot = () => {
  if (!fs.existsSync(storageRoot)) {
    fs.mkdirSync(storageRoot, { recursive: true });
  }
};

export const GenerationMulterConfig: multer.Options = {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      try {
        ensureStorageRoot();
        cb(null, storageRoot);
      } catch (error) {
        cb(error as Error, storageRoot);
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new BadRequestException("Invalid file type");
      (cb as unknown as (error: any, acceptFile: boolean) => void)(error, false);
    }
  },
};
