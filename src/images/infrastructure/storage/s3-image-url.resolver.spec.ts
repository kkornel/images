import { S3ImageUrlResolver } from './s3-image-url.resolver';

type StorageConfig = ConstructorParameters<typeof S3ImageUrlResolver>[0];

function makeConfig(overrides: Partial<StorageConfig> = {}): StorageConfig {
  return {
    region: 'eu-central-1',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    bucket: 'images-bucket',
    endpoint: '',
    forcePathStyle: false,
    ...overrides,
  };
}

describe('S3ImageUrlResolver', () => {
  it('returns the default AWS virtual-hosted URL when no custom endpoint is configured', () => {
    const resolver = new S3ImageUrlResolver(
      makeConfig({
        region: 'eu-central-1',
        endpoint: '',
        forcePathStyle: false,
      }),
    );

    const result = resolver.resolveUrl('images/cat.jpg');

    expect(result).toBe(
      'https://images-bucket.eu-central-1.amazonaws.com/images/cat.jpg',
    );
  });

  it('returns a path-style URL when a custom endpoint is configured with forcePathStyle', () => {
    const resolver = new S3ImageUrlResolver(
      makeConfig({
        endpoint: 'http://localhost:4566/',
        forcePathStyle: true,
      }),
    );

    const result = resolver.resolveUrl('images/cat.jpg');

    expect(result).toBe('http://localhost:4566/images-bucket/images/cat.jpg');
  });

  it('returns a virtual-hosted URL when a custom endpoint is configured without forcePathStyle', () => {
    const resolver = new S3ImageUrlResolver(
      makeConfig({
        endpoint: 'https://s3.example.test/base-path/',
        forcePathStyle: false,
      }),
    );

    const result = resolver.resolveUrl('images/cat.jpg');

    expect(result).toBe('https://images-bucket.s3.example.test/images/cat.jpg');
  });

  it('strips trailing slashes from the configured endpoint', () => {
    const resolver = new S3ImageUrlResolver(
      makeConfig({
        endpoint: 'https://cdn.example.test///',
        forcePathStyle: true,
      }),
    );

    const result = resolver.resolveUrl('images/cat.jpg');

    expect(result).toBe(
      'https://cdn.example.test/images-bucket/images/cat.jpg',
    );
  });
});
