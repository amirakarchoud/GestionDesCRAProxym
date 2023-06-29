import { Absence } from "./Entities/absence.entity";
import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRAService } from "../cramodule/cra.service";
import { UserService } from "../user-module/user.service";
import { Between, Repository } from "typeorm";
import { CreateAbsenceDto } from "./DTO/CreateAbsenceDTO";
import { UpdateAbsenceDto } from "./DTO/updateAbsenceDTO";
import { HolidayService } from "src/holiday-module/holiday.service";
import { CRA } from "src/cramodule/Entities/cra.entity";
@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>, private readonly userService: UserService,
    private readonly craService: CRAService,private readonly holidayService:HolidayService
  ) {}


  async getAllAbsences(): Promise<Absence[]> {
    return this.absenceRepository.find();
  }

  async createAbsence(createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    //console.log(createAbsenceDto.date);
    const dateAbs=new Date(createAbsenceDto.date);
    //Test holiday
    const holidays = this.holidayService.getHolidayByDate(dateAbs);

    if ((await holidays).length > 0) {
      const holidayNames = (await holidays).map((holiday) => holiday.name).join(', ');
      throw new HttpException(`It's a holiday (${holidayNames})!`, HttpStatus.BAD_REQUEST);
    }

    //test cra exists
    if (!this.craService.checkCRAExists(dateAbs.getMonth(),dateAbs.getFullYear()))
    { const cra=new CRA();
      cra.month=dateAbs.getMonth();
      cra.year=dateAbs.getFullYear();
     await this.craService.createCra(cra);
    }
    else {

    //test if that day is full or already full period

   


    //test in cra : same month and year

    }

     //test dates of adding



    const absence = new Absence();
  absence.date = createAbsenceDto.date;
  absence.matin = createAbsenceDto.matin;
  absence.raison = createAbsenceDto.raison;
  absence.collab = await this.userService.findById(createAbsenceDto.collabId);
  absence.cra = await this.craService.getCRAById(createAbsenceDto.craId);

  return this.absenceRepository.save(absence);
  }

  async deleteAbsence(id: number): Promise<void> {
     this.absenceRepository.delete(id);
  }

  async getAbsenceById(id: number): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { id },relations: ['collab','cra'] });
  if (!absence) {
    throw new NotFoundException('Absence not found');
  }
  return absence;
  }

  async updateAbsence(
    id: number,
    updateAbsenceDto: UpdateAbsenceDto,
  ): Promise<Absence> {
    const absence = await this.getAbsenceById(id);
    absence.date = updateAbsenceDto.date || absence.date;
    if(updateAbsenceDto.matin!=null)
    {
      absence.matin=updateAbsenceDto.matin;
    }
    absence.raison = updateAbsenceDto.raison || absence.raison;
    absence.collab = updateAbsenceDto.collabId
      ? await this.userService.findById(updateAbsenceDto.collabId)
      : absence.collab;
    absence.cra = updateAbsenceDto.craId
      ? await this.craService.getCRAById(updateAbsenceDto.craId)
      : absence.cra;
  
    return this.absenceRepository.save(absence);
  }



  async getAbsencesByUserAndMonthYear(userId: number, month: number, year: number): Promise<Absence[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const absences = await this.absenceRepository.find({
      where: {
        collab: { id: userId },
        date: Between(startDate, endDate),
      },
    });

    return absences;
  }

  async getAbsencesByDate(date: Date): Promise<Absence[]> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to the start date
  
    return this.absenceRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });
  }


  async getAbsencesByUserAndDate(userId: number, date: Date): Promise<Absence[]> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to the start date
  
    return this.absenceRepository.find({
      where: {
        collab: { id: userId },
        date: Between(startDate, endDate),
      },
    });
  }


}
