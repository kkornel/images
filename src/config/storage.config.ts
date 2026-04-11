import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  region: process.env.AWS_REGION || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  bucket: process.env.AWS_S3_BUCKET || '',
  endpoint: process.env.AWS_S3_ENDPOINT || '',
  forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
}));
