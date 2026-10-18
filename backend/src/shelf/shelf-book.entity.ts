import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ReadingStatus {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  FINISHED = 'FINISHED',
}

@Entity('shelf_books')
export class ShelfBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'work_id', type: 'varchar', length: 32 })
  workId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  authors: string;

  @Column({ name: 'cover_id', type: 'int', nullable: true })
  coverId: number | null;

  @Column({ name: 'first_publish_year', type: 'int', nullable: true })
  firstPublishYear: number | null;

  @Column({ name: 'total_pages', type: 'int', nullable: true })
  totalPages: number | null;

  @Index()
  @Column({
    type: 'enum',
    enum: ReadingStatus,
    default: ReadingStatus.WANT_TO_READ,
  })
  status: ReadingStatus;

  @Column({ name: 'current_page', type: 'int', default: 0 })
  currentPage: number;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string | null;

  @Column({
    name: 'started_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  startedAt: Date | null;

  @Column({
    name: 'finished_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  finishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
