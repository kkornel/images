import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { UniqueIdGenerator } from '@/images/application/ports/out/unique-id.generator';

@Injectable()
export class NodeCryptoUniqueIdGenerator extends UniqueIdGenerator {
  generate(): string {
    return randomUUID();
  }
}
