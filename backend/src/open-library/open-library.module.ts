import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { OpenLibraryService } from "./open-library.service";

@Module({
    imports: [
        HttpModule.register({
            baseURL: 'https://openlibrary.org',
            timeout: 8000,
            headers: { 'User-Agent': 'MiniReadingTracker/1.0 (vinhhv28@gmail.com)' },
        })
    ],
    providers: [OpenLibraryService],
    exports: [OpenLibraryService]
})

export class OpenLibraryModule {
    
}