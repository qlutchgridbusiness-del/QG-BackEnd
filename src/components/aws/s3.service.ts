import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Accept base64 instead of Multer file
  async uploadBase64(
    base64: string,
    filename: string,
    mimetype: string,
    folder = "uploads"
  ) {
    const buffer = Buffer.from(base64, "base64");
    const fileExt = filename.split(".").pop() || "";
    const key = `${folder}/${uuid()}.${fileExt}`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    await this.s3.send(new PutObjectCommand(uploadParams));

    return `${process.env.AWS_S3_BASE_URL}/${key}`;
  }
}
