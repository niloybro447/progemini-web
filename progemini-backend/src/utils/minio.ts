import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import path from "path";
import stream from "stream";

class MinioService {
  private client: Minio.Client;
  private bucketName: string;

  constructor() {
    this.client = new Minio.Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
    this.bucketName = config.minio.bucketName;
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket);
      logger.info({ bucket }, "Created MinIO bucket");
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string,
    bucketOverride?: string,
  ): Promise<{ slug: string; url: string; size: number }> {
    const bucket = bucketOverride || this.bucketName;
    await this.ensureBucketExists(bucket);

    const ext = path.extname(originalName);
    const slug = folder ? `${folder}/${uuidv4()}${ext}` : `${uuidv4()}${ext}`;
    const fileSize = fileBuffer.length;

    await this.client.putObject(bucket, slug, fileBuffer, fileSize, {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${originalName}"`,
    });

    const url = await this.client.presignedGetObject(bucket, slug, 604800);
    logger.info({ slug, size: fileSize, bucket }, "File uploaded to MinIO");
    return { slug, url, size: fileSize };
  }

  async getFileStream(slug: string, bucketOverride?: string): Promise<{ stream: stream.Readable; mimeType: string } | null> {
    const bucket = bucketOverride || this.bucketName;
    try {
      const fileStream = await this.client.getObject(bucket, slug);
      const stat = await this.client.statObject(bucket, slug);
      const mimeType = (stat.metaData as Record<string, string>)?.["content-type"] || "application/octet-stream";
      return { stream: fileStream, mimeType };
    } catch {
      return null;
    }
  }

  async deleteFile(slug: string, bucketOverride?: string): Promise<void> {
    const bucket = bucketOverride || this.bucketName;
    try {
      await this.client.removeObject(bucket, slug);
      logger.info({ slug, bucket }, "File deleted from MinIO");
    } catch (err) {
      logger.error({ err, slug }, "Failed to delete file from MinIO");
      throw err;
    }
  }

  async deleteFiles(slugs: string[]): Promise<void> {
    try {
      await this.client.removeObjects(this.bucketName, slugs);
      logger.info({ count: slugs.length }, "Bulk deleted files from MinIO");
    } catch (err) {
      logger.error({ err }, "Failed to bulk delete files from MinIO");
      throw err;
    }
  }

  async getFileUrl(slug: string, expiryInSeconds = 604800, bucketOverride?: string): Promise<string> {
    const bucket = bucketOverride || this.bucketName;
    return this.client.presignedGetObject(bucket, slug, expiryInSeconds);
  }

  async fileExists(slug: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, slug);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(prefix?: string): Promise<Minio.BucketItem[]> {
    const objects: Minio.BucketItem[] = [];
    const stream = this.client.listObjects(this.bucketName, prefix, true);
    for await (const obj of stream) {
      objects.push(obj);
    }
    return objects;
  }
}

const minioService = new MinioService();
export default minioService;
