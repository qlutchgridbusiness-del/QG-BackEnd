import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

@Injectable()
export class UploadsService {
  private s3: S3Client | null = null;
  private bucket: string;
  private region: string;
  private useS3: boolean;

  constructor() {
    this.region = process.env.AWS_REGION || '';
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.useS3 = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      this.bucket
    );
    if (this.useS3) {
      this.s3 = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
    }
  }

  async processLocalFile(file: Express.Multer.File) {
    // Return local URL (ensure static served)
    const base = process.env.APP_BASE_URL || '';
    return `${base}/uploads/${file.filename}`;
  }

  async processFileToS3(file: Express.Multer.File) {
    if (!this.s3) throw new Error('S3 not configured');
    const key = `uploads/${file.filename}`;
    const body = fs.readFileSync(file.path);
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });
    await this.s3.send(cmd);
    // Delete local file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}
    // Return S3 public url
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async processFile(file: Express.Multer.File) {
    if (this.useS3) {
      return this.processFileToS3(file);
    }
    return this.processLocalFile(file);
  }
}
