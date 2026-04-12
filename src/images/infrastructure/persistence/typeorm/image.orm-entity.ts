import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'images' })
export class ImageOrmEntity {
  @PrimaryColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  storageKey: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'varchar', length: 10 })
  extension: string;

  @Column({ type: 'integer' })
  width: number;

  @Column({ type: 'integer' })
  height: number;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
