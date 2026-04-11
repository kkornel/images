import {
  plainToInstance,
  Transform,
  type TransformFnParams,
} from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsString,
  Max,
  Min,
  ValidationError,
  validateSync,
} from 'class-validator';

function trimToUndefined(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? undefined : trimmedValue;
}

function toInteger(value: unknown): unknown {
  const normalizedValue = trimToUndefined(value);

  if (normalizedValue === undefined || typeof normalizedValue === 'number') {
    return normalizedValue;
  }

  if (typeof normalizedValue !== 'string') {
    return normalizedValue;
  }

  if (!/^-?\d+$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return Number(normalizedValue);
}

function toStrictBoolean(value: unknown): unknown {
  const normalizedValue = trimToUndefined(value);

  if (normalizedValue === undefined || typeof normalizedValue === 'boolean') {
    return normalizedValue;
  }

  if (typeof normalizedValue !== 'string') {
    return normalizedValue;
  }

  const lowerCasedValue = normalizedValue.toLowerCase();

  if (lowerCasedValue === 'true') {
    return true;
  }

  if (lowerCasedValue === 'false') {
    return false;
  }

  return normalizedValue;
}

const trimStringTransform = ({ value }: TransformFnParams): unknown =>
  trimToUndefined(value);

const integerTransform = ({ value }: TransformFnParams): unknown =>
  toInteger(value);

const booleanTransform = ({ value }: TransformFnParams): unknown =>
  toStrictBoolean(value);

class EnvironmentVariables {
  @Transform(integerTransform)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  DATABASE_HOST: string;

  @Transform(integerTransform)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  DATABASE_USER: string;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  DATABASE_PASSWORD: string;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  DATABASE_NAME: string;

  @Transform(booleanTransform)
  @IsDefined()
  @IsBoolean()
  DATABASE_SYNCHRONIZE: boolean;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  AWS_REGION: string;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  AWS_S3_BUCKET: string;

  @Transform(trimStringTransform)
  @IsDefined()
  @IsString()
  AWS_S3_ENDPOINT: string;

  @Transform(booleanTransform)
  @IsDefined()
  @IsBoolean()
  AWS_S3_FORCE_PATH_STYLE: boolean;
}

let validatedEnvironment: EnvironmentVariables | null = null;

function formatValidationErrors(
  errors: ValidationError[],
  parentPath?: string,
): string[] {
  return errors.flatMap((error) => {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const ownMessages = error.constraints
      ? Object.values(error.constraints).map(
          (message) => `${propertyPath}: ${message}`,
        )
      : [];

    const nestedMessages =
      error.children && error.children.length > 0
        ? formatValidationErrors(error.children, propertyPath)
        : [];

    return [...ownMessages, ...nestedMessages];
  });
}

function toEnvironmentStrings(
  environment: EnvironmentVariables,
): Record<string, string> {
  return {
    PORT: String(environment.PORT),
    DATABASE_HOST: environment.DATABASE_HOST,
    DATABASE_PORT: String(environment.DATABASE_PORT),
    DATABASE_USER: environment.DATABASE_USER,
    DATABASE_PASSWORD: environment.DATABASE_PASSWORD,
    DATABASE_NAME: environment.DATABASE_NAME,
    DATABASE_SYNCHRONIZE: String(environment.DATABASE_SYNCHRONIZE),
    AWS_REGION: environment.AWS_REGION,
    AWS_ACCESS_KEY_ID: environment.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: environment.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET: environment.AWS_S3_BUCKET,
    AWS_S3_ENDPOINT: environment.AWS_S3_ENDPOINT,
    AWS_S3_FORCE_PATH_STYLE: String(environment.AWS_S3_FORCE_PATH_STYLE),
  };
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const environment = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(environment, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = formatValidationErrors(errors).join('\n');
    throw new Error(`Environment validation failed:\n${messages}`);
  }

  validatedEnvironment = environment;
  Object.assign(process.env, toEnvironmentStrings(environment));

  return config;
}

export function getValidatedEnvironment(): EnvironmentVariables {
  if (!validatedEnvironment) {
    validateEnvironment(process.env as Record<string, unknown>);
  }

  if (!validatedEnvironment) {
    throw new Error('Validated environment could not be initialized.');
  }

  return validatedEnvironment;
}
