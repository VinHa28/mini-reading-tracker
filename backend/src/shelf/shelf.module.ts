import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenLibraryModule } from '../open-library/open-library.module';
import { ShelfBook } from './shelf-book.entity';
import { ShelfController } from './shelf.controller';
import { ShelfService } from './shelf.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShelfBook]), OpenLibraryModule],
  controllers: [ShelfController],
  providers: [ShelfService],
  exports: [ShelfService],
})
export class ShelfModule {}
