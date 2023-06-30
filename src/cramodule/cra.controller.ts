import { Body, Controller, Post } from "@nestjs/common";
import { CRAService } from "./cra.service";
import { CRA } from "./Entities/cra.entity";
import { CreateCraDto } from "./DTO/CreateCraDto";
@Controller('CRA')
export class CRAController{
    constructor(private readonly craService: CRAService) {}

    @Post()
    async createCra(@Body() createCraDto: CreateCraDto): Promise<CRA> {
      try {
        const createdCra = await this.craService.createCra(createCraDto);
        return createdCra;
      } catch (error) {
        console.error('Error creating CRA:', error);
        throw new Error('Failed to create CRA');
      }
    }
}