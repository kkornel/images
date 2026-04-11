import { registerAs } from '@nestjs/config';

import { getValidatedEnvironment } from '@/config/validation/environment.validation';

export default registerAs('storage', () => {
  const environment = getValidatedEnvironment();

  return {
    region: environment.AWS_REGION,
    accessKeyId: environment.AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
    bucket: environment.AWS_S3_BUCKET,
    endpoint: environment.AWS_S3_ENDPOINT,
    forcePathStyle: environment.AWS_S3_FORCE_PATH_STYLE,
  };
});
