import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CRA } from "./Entities/cra.entity";
import { CreateCraDto } from "./DTO/CreateCraDto";
import { UserService } from "../user-module/user.service";
import e from "express";
@Injectable()
export class CRAService {

 async findOne(month: number, year: number, collabId: number):Promise<CRA> {
  month++;
    return await this.craRepository.findOne({ where: { month, year,collab: { id: collabId } } });
  }
  
  
  constructor(
    @InjectRepository(CRA)
    private readonly craRepository: Repository<CRA>,private readonly userService: UserService
  ) {}

  async getCRAById(id: number) {
    const cra = await this.craRepository.findOne({ where: { id } });
    if (!cra) {
      throw new NotFoundException('cra not found');
    }
    return cra;
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



}