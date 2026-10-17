import { Body, Controller, Post } from "@nestjs/common";
import { ShelfService } from "./shelf.service";
import { AddToShelfDTO } from "./dto/add-to-shelf.dto";

@Controller('shelf')
export class ShelfController {
    constructor(private readonly shelf: ShelfService) {}

    @Post()
    add(@Body() dto: AddToShelfDTO) {
        return this.shelf.add(dto);
    }
}