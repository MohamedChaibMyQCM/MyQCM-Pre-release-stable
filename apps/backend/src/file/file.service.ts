import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { File } from "./entities/file.entity";

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async create(createFileDto: Express.Multer.File) {
    console.log("createFileDto", createFileDto);
    const file = this.fileRepository.create({
      fieldname: createFileDto.fieldname,
      originalname: createFileDto.originalname,
      filename: createFileDto.filename,
      mimetype: createFileDto.mimetype,
      size: createFileDto.size,
      path: createFileDto.path,
    }); ///explicitly set all properties to avoid issues with missing fields
    return this.fileRepository.save(file);
  }

  async createBatch(files: Express.Multer.File[]): Promise<File[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const fileEntities = this.fileRepository.create(
      files.map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      })),
    );

    if (files.length > 100) {
      const chunkSize = 100;
      const results: File[] = [];

      for (let i = 0; i < fileEntities.length; i += chunkSize) {
        const chunk = fileEntities.slice(i, i + chunkSize);
        const savedChunk = await this.fileRepository.save(chunk);
        results.push(...savedChunk);
      }

      return results;
    }

    return this.fileRepository.save(fileEntities);
  }

  // New methods needed for MenuService

  /**
   * Find a file by ID
   */
  async findOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  /**
   * Remove a file by ID
   */
  async remove(id: string): Promise<{ id: string; deleted: boolean }> {
    const file = await this.findOne(id);
    await this.fileRepository.remove(file);
    return { id, deleted: true };
  }

  /**
   * Remove multiple files by IDs
   */
  async removeBatch(ids: string[]): Promise<{ deleted: number }> {
    if (!ids || ids.length === 0) {
      return { deleted: 0 };
    }

    let deletedCount = 0;

    for (const id of ids) {
      try {
        await this.remove(id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete file with ID ${id}:`, error);
      }
    }

    return { deleted: deletedCount };
  }
}
