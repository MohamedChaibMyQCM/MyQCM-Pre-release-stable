import { BadRequestException } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { getEnvOrFatal } from "common/utils/env.util";

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: getEnvOrFatal("CLOUDINARY_CLOUD_NAME"),
  api_key: getEnvOrFatal("CLOUDINARY_API_KEY"),
  api_secret: getEnvOrFatal("CLOUDINARY_API_SECRET"),
});

export const MulterConfig = {
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, file) => {
      let folder = "uploads"; // Default folder

      if (file.mimetype.startsWith("image/")) {
        folder = "uploads/images";
      } else if (file.mimetype === "application/pdf") {
        folder = "uploads/documents";
      } else if (
        [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.mimetype)
      ) {
        folder = "uploads/docs"; // Word documents
      } else if (file.mimetype === "text/plain") {
        folder = "uploads/text-files";
      } else {
        throw new BadRequestException("Invalid file type");
      }

      return {
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "pdf", "txt", "doc", "docx"],
        transformation: [{ quality: "auto" }],
      };
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "text/plain",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException("Invalid file type"), false);
    }
  },
};
