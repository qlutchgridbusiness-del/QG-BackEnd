// src/common/s3.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly baseUrl: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET!;
    this.region = process.env.AWS_REGION!;

    if (!this.bucket || !this.region) {
      throw new Error('AWS_S3_BUCKET or AWS_REGION missing');
    }

    /**
     * ✅ IMPORTANT
     * Do NOT pass credentials here.
     * AWS SDK will automatically pick:
     * - IAM Role (EC2) ✅
     * - or ENV keys (local) ✅
     */
    this.s3 = new S3Client({
      region: this.region,
    });

    // Optional but recommended
    this.baseUrl =
      process.env.AWS_S3_BASE_URL ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  async upload(
    file: Express.Multer.File,
    folder = 'social',
  ): Promise<{ key: string; url: string }> {
    try {
      const key = `${folder}/${randomUUID()}-${file.originalname}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        key,
        url: `${this.baseUrl}/${key}`,
      };
    } catch (err: any) {
      console.error('S3 upload failed', err);
      throw new InternalServerErrorException('S3 upload failed');
    }
  }
}
