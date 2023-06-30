import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CRA } from "./Entities/cra.entity";
import { CreateCraDto } from "./DTO/CreateCraDto";
import { UserService } from "../user-module/user.service";
@Injectable()
export class CRAService {

  
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

  if (existingCRA) {
    const existingActivity = existingCRA.activities.find((activity) => activity.date === date && activity.matin === matin);
    if (existingActivity) {
      return true;
    }

    const existingAbsence = existingCRA.absences.find((absence) => absence.date === date && absence.matin === matin);
    if (existingAbsence) {
      return true;
    }
  }

  return false;
}


async checkCRAExists(month: number, year: number,collabId:number): Promise<boolean> {
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


}