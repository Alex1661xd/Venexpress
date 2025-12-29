import { Injectable } from '@nestjs/common';
// import * as AWS from 'aws-sdk';
// import { awsConfig } from '../../config/aws.config';

@Injectable()
export class S3Service {
  // private s3: AWS.S3;

  constructor() {
    // this.s3 = new AWS.S3({
    //   accessKeyId: awsConfig.accessKeyId,
    //   secretAccessKey: awsConfig.secretAccessKey,
    //   region: awsConfig.region,
    // });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'proofs'): Promise<string> {
    // TODO: Implementar cuando se configure S3
    // const key = `${folder}/${Date.now()}-${file.originalname}`;
    // const params = {
    //   Bucket: awsConfig.s3.bucket,
    //   Key: key,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    //   ACL: 'public-read',
    // };
    
    // const result = await this.s3.upload(params).promise();
    // return result.Location;
    
    throw new Error('S3 upload not configured');
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // TODO: Implementar cuando se configure S3
    // const key = fileUrl.split('.com/')[1];
    // await this.s3.deleteObject({
    //   Bucket: awsConfig.s3.bucket,
    //   Key: key,
    // }).promise();
  }
}

