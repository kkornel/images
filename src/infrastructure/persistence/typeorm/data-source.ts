import { join } from 'node:path';
import { cwd } from 'node:process';

import { DataSource } from 'typeorm';

import { getValidatedEnvironment } from '../../../config/validation/environment.validation';

process.loadEnvFile?.(join(cwd(), '.env'));
const config = getValidatedEnvironment();

const rootDir = __dirname;

export default new DataSource({
  type: 'postgres',
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  synchronize: false,
  entities: ['src/**/*orm-entity.ts'],
  migrations: [join(rootDir, 'migrations', '*.{ts,js}')],
});
