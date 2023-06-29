import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Absence } from "./Entities/absence.entity";
import { AbsenceService } from "./absence.service";
import { UpdateAbsenceDto } from "./DTO/updateAbsenceDTO";
import { CreateAbsenceDto } from "./DTO/CreateAbsenceDTO";
@Controller('absence')
export class AbsenceController{
    constructor(private readonly absenceService: AbsenceService) {}

  @Get()
  async getAllAbsences(): Promise<Absence[]> {
    return this.absenceService.getAllAbsences();
  }

  @Post()
  async createAbsence(@Body() createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    return this.absenceService.createAbsence(createAbsenceDto);
  }

  @Delete(':id')
  async deleteAbsence(@Param('id') id: number): Promise<void> {
    return this.absenceService.deleteAbsence(id);
  }

  @Get(':id')
  async getAbsenceById(@Param('id') id: number): Promise<Absence> {
    return this.absenceService.getAbsenceById(id);
  }

  @Put(':id')
  async updateAbsence(
    @Param('id') id: number,
    @Body() updateAbsenceDto: UpdateAbsenceDto,
  ): Promise<Absence> {
    return this.absenceService.updateAbsence(id, updateAbsenceDto);
  }


  @Get(':userId/month/:month/year/:year')
  async getAbsencesByUserAndMonthYear(
    @Param('userId') userId: number,
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<Absence[]> {
    return this.absenceService.getAbsencesByUserAndMonthYear(userId, month, year);
  }


  @Get('date/:date')
  async getAbsencesByDate(@Param('date') date: string): Promise<Absence[]> {
    const parsedDate = new Date(date);

    return this.absenceService.getAbsencesByDate(parsedDate);
  }

  @Get('userDate/:id/:date')
  async getAbsencesByDateandUser(@Param('date') date: string,@Param('id') userId: number): Promise<Absence[]> {
    const parsedDate = new Date(date);
    console.log(parsedDate);

    return this.absenceService.getAbsencesByUserAndDate(userId,parsedDate);
  }
}