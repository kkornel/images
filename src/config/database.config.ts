import { registerAs } from '@nestjs/config';

import { getValidatedEnvironment } from '@/config/validation/environment.validation';

export default registerAs('database', () => {
  const environment = getValidatedEnvironment();

  return {
    host: environment.DATABASE_HOST,
    port: environment.DATABASE_PORT,
    username: environment.DATABASE_USER,
    password: environment.DATABASE_PASSWORD,
    database: environment.DATABASE_NAME,
    synchronize: environment.DATABASE_SYNCHRONIZE,
  };
});
