import { registerAs } from '@nestjs/config';

import { getValidatedEnvironment } from '@/config/validation/environment.validation';

export default registerAs('app', () => {
  const environment = getValidatedEnvironment();

  return {
    port: environment.PORT,
  };
});
