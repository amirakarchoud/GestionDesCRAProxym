import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CRA } from "./Entities/cra.entity";
import { CreateCraDto } from "./DTO/CreateCraDto";
import { UserService } from "../user-module/user.service";
import { HolidayService } from "../holiday-module/holiday.service";
@Injectable()
export class CRAService {

 async findOne(month: number, year: number, collabId: number):Promise<CRA> {
  month++;
    return await this.craRepository.findOne({ where: { month, year,collab: { id: collabId } } });
  }

  
  constructor(
    @InjectRepository(CRA)
    private readonly craRepository: Repository<CRA>,private readonly userService: UserService,private readonly holidayService:HolidayService
  ) {}

  async getCRAById(id: number) {
    const cra = await this.craRepository.findOne({ where: { id } });
    if (!cra) {
      throw new NotFoundException('cra not found');
    }
    return cra;
  }

async getThisMonthsCra(): Promise<CRA[]> {
  const month=new Date().getMonth()+1;
  const year= new Date().getFullYear();
  return this.craRepository.find({ where: { month ,year} ,relations:['collab','activities','absences']});
}


async getThisMonthsUserCra(id:number): Promise<CRA> {
  const month=new Date().getMonth()+1;
  const year= new Date().getFullYear();
  return this.craRepository.findOne({ where: { month ,year,collab:{id}} ,relations:['collab','activities','absences']});
}




formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


async checkActivityOrAbsenceExists(id: number, date: Date, matin: boolean): Promise<boolean> {
  const existingCRA = await this.craRepository.findOne( { where:{id},relations: ['activities', 'absences'] });
  //console.log('existingCRA absence= '+existingCRA.absences);
 // console.log('existingCRA activities= '+existingCRA.activities);

  if (existingCRA) {
    const existingActivity = existingCRA.activities.find((activity) => this.formatDate(activity.date) === this.formatDate(date) && activity.matin === matin);
    console.log('existingActivity= '+existingActivity);
    if (existingActivity) {
      console.log('found activity');
      return true;
    }

    const existingAbsence = existingCRA.absences.find((absence) => this.formatDate(absence.date) === this.formatDate(date) && absence.matin === matin);
    console.log('existingAbsence= '+existingAbsence);
    if (existingAbsence) {
      console.log('found absence');
      
      return true;
    }


    const activities = existingCRA.activities.filter((activity) => this.formatDate(activity.date) === this.formatDate(date) );
    const absences = existingCRA.absences.filter((absence) => this.formatDate(absence.date) === this.formatDate(date) );
  if (activities.length+absences.length>1)
  {
    return true;
  }
    
    
  }

  return false;
}


async checkCRAExists(month: number, year: number,collabId:number): Promise<boolean> {
  console.log('check cra month :'+month);
  console.log('check cra year :'+year);
  console.log('check cra collab id :'+collabId);
  month++;
  const cra = await this.craRepository.findOne({ where: { month, year,collab: { id: collabId } } });
  return !!cra; 
}

async createCra(createCraDto: CreateCraDto): Promise<CRA> {
console.log('craeting cra');
    const { year, month, collab, date } = createCraDto;

    const cra = new CRA();
    cra.year = year;
    cra.month = month;
    cra.date = date || new Date();
    cra.collab = await this.userService.findById(collab);
    cra.absences = [];
    cra.activities = [];

    const createdCra = await this.craRepository.save(cra);
    return createdCra;
  
}


async verifyUserCra(month: number, year: number, collabId: number, id: number): Promise<boolean> {
  const cra = await this.craRepository.findOne({
    where: { id },
    relations: ['collab']
  });

  if (!cra || cra.collab.id !== collabId || cra.month !== month || cra.year !== year) {
    return false;
  }

  return true;
}



async getUserCras(collabId: number):Promise<CRA[]> {
  const cra = await this.craRepository.find({ where: { collab: { id: collabId } },relations: ['activities','absences','collab'] });
  if (!cra) {
    throw new NotFoundException('No cras were found');
  }
  return cra;
}



calculateBusinessDays(year: number, month: number): number {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  let businessDays = 0;

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends (Saturday and Sunday)
          businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}



async getAvailableDatesOfMonth(craId: number): Promise<Date[]> {
  const cra=await this.getCRAById(craId);
  const { month, year } = cra;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const availableDates: Date[] = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const isWeekend = this.isWeekend(currentDate);
    const isHoliday = await this.holidayService.checkDateIsHoliday(currentDate);
    const isActivityOrAbsenceExists = await this.checkDayIsFull(cra.id, currentDate);
    
    if (!isWeekend && !isHoliday && !isActivityOrAbsenceExists) {
      availableDates.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availableDates;
}

isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; 
}


async checkDayIsFull(id: number, date: Date): Promise<boolean> {
  const existingCRA = await this.craRepository.findOne({where:{id},  relations: ['activities', 'absences']});

  if (existingCRA) {
    const existingActivity = await existingCRA.activities.filter((activity) => this.isSameDate(activity.date, date));
    if (existingActivity.length>1) {
      return true;
    }

    const existingAbsence = existingCRA.absences.filter((absence) => this.isSameDate(absence.date, date));
    if (existingAbsence.length>1) {
      return true;
    }

    if(existingAbsence.length+existingActivity.length>1)
    {
      return true;
    }
  }

  return false;
}

isSameDate(date1: Date, date2: Date): boolean {
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const day1 = date1.getDate();
  
  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  return year1 === year2 && month1 === month2 && day1 === day2;
}





}