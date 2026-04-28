import type { DeleteImageCommand } from '@/images/application/commands/delete-image.command';

export abstract class DeleteImageUseCase {
  abstract execute(command: DeleteImageCommand): Promise<void>;
}
