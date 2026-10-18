import { Module } from '@nestjs/common';
import { OpenLibraryModule } from '../open-library/open-library.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ShelfModule } from '../shelf/shelf.module';

@Module({
  imports: [OpenLibraryModule, ShelfModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BookModule {}
