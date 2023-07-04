import { Absence } from "./Entities/absence.entity";
import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRAService } from "../cramodule/cra.service";
import { UserService } from "../user-module/user.service";
import { Between, Repository } from "typeorm";
import { CreateAbsenceDto } from "./DTO/CreateAbsenceDTO";
import { UpdateAbsenceDto } from "./DTO/updateAbsenceDTO";
import { HolidayService } from "../holiday-module/holiday.service";
import { CreateCraDto } from "../cramodule/DTO/CreateCraDto";
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
    console.log('creating absence');
    //console.log(createAbsenceDto.date);
    const dateAbs=new Date(createAbsenceDto.date);
    //Test holiday
    const holidays = this.holidayService.getHolidayByDate(dateAbs);

    if ((await holidays).length > 0) {
      const holidayNames = (await holidays).map((holiday) => holiday.name).join(', ');
      throw new HttpException(`It's a holiday (${holidayNames})!`, HttpStatus.BAD_REQUEST);
    }

    let craId: number = createAbsenceDto.craId;
    console.log('cra id before= '+craId);

    const absence = new Absence();

    // Check if the specified CRA exists
    if (!(await this.craService.checkCRAExists(dateAbs.getMonth(), dateAbs.getFullYear(),createAbsenceDto.collabId))) {
      console.log('checked cra doesnt exist');
      // Create a new CRA if it doesnt exist
      const createCraDto: CreateCraDto = {
        year: dateAbs.getFullYear(),
        month: dateAbs.getMonth()+1,
        collab: createAbsenceDto.collabId,
        date: new Date(),
      };

      console.log('created cra dto ='+ createCraDto);
  
      try {
        const createdCra = await this.craService.createCra(createCraDto);
        craId = createdCra.id;
        absence.cra = await this.craService.getCRAById(craId);
     
      } catch (error) {
        console.error('Error creating CRA:', error);
        throw new HttpException('Failed to create CRA', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    else
    {
      console.log('searching for the corresponding cra');
      absence.cra= (await this.craService.findOne(dateAbs.getMonth(), dateAbs.getFullYear(), createAbsenceDto.collabId));
    }
    
  
    
    absence.date = createAbsenceDto.date;
    absence.matin = createAbsenceDto.matin;
    absence.raison = createAbsenceDto.raison;
    absence.collab = await this.userService.findById(createAbsenceDto.collabId);
    
    // Test in the CRA for the same month and year
    if(absence.cra.month!=dateAbs.getMonth()+1 || absence.cra.year!=dateAbs.getFullYear())
    {
      throw new HttpException('Not in this CRA', HttpStatus.BAD_REQUEST);
    }

    // Test if the day is already fully occupied or part of a fully occupied period
    if(await this.craService.checkActivityOrAbsenceExists(absence.cra.id,dateAbs,absence.matin))
    {
      throw new HttpException('FULL day or period', HttpStatus.BAD_REQUEST);
    }
    
  
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


  //to add later to the logic
  //testing if we are currently in the same month or only 5 days after the end of the last month
  checkAddingUpdatingDate(month:number,year:number):boolean{
    const today=new Date();
    let beforeFiveDays = new Date(); //fel CRA
    beforeFiveDays.setDate(today.getDate()-5);
    
    if ( (month!=today.getMonth() && beforeFiveDays.getMonth() != month))

       { //throw new ForbiddenException('Not allowed to update at this time !');
        return false;}
        return true;
  }


}
