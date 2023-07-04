import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Activity } from "./Entities/activity.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { UserService } from "../user-module/user.service";
import { ProjectService } from "../project-module/project.service";
import { CRAService } from "../cramodule/cra.service";
import { HolidayService } from "../holiday-module/holiday.service";
import { CreateActivityDto } from "./DTO/CreateActivityDto";
import { CreateCraDto } from "../cramodule/DTO/CreateCraDto";
import { Project } from "../project-module/Entities/project.entity";
import { User } from "../user-module/Entities/user.entity";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly craService: CRAService,private readonly holidayService:HolidayService
  ) {}

  async getAllActivities(): Promise<Activity[]> {
    return this.activityRepository.find();
  }


  async createActivity(createActivityDto: CreateActivityDto): Promise<Activity> {
    console.log('creating activity');
    const dateActivity = new Date(createActivityDto.date);

    // Test holiday
    const holidays = await this.holidayService.getHolidayByDate(dateActivity);
    if (holidays.length > 0) {
      const holidayNames = holidays.map((holiday) => holiday.name).join(', ');
      throw new HttpException(`It's a holiday (${holidayNames})!`, HttpStatus.BAD_REQUEST);
    }

    let craId: number = createActivityDto.craId;
    console.log('cra id before= ' + craId);
    const activity = new Activity();

    // Check if the specified CRA exists
    if (!(await this.craService.checkCRAExists(dateActivity.getMonth(), dateActivity.getFullYear(), createActivityDto.collabId)) )
     {
      console.log('creating cra because it doesnt exist');
      console.log('checked cra doesnt exist');
      // Create a new CRA if it doesnt exist
      const createCraDto: CreateCraDto = {
        year: dateActivity.getFullYear(),
        month: dateActivity.getMonth() + 1,
        collab: createActivityDto.collabId,
        date: new Date(),
      }
      

      console.log('created cra dto =' + createCraDto);

      try {
        const createdCra = await this.craService.createCra(createCraDto);
        craId = createdCra.id;
        activity.cra = await this.craService.getCRAById(craId);
      } catch (error) {
        console.error('Error creating CRA:', error);
        throw new HttpException('Failed to create CRA', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    else
      {
        console.log('searching for the corresponding cra');
        activity.cra= (await this.craService.findOne(dateActivity.getMonth(), dateActivity.getFullYear(), createActivityDto.collabId));
        console.log('cra found '+activity.cra.id);
      }

    
    activity.date = createActivityDto.date;
    activity.matin = createActivityDto.matin;
    activity.collab = await this.userService.findById(createActivityDto.collabId);
    activity.project= await this.projectService.findById(createActivityDto.projectId);

    if(!this.collabInProject(activity.project,activity.collab))
    {
      throw new HttpException('Collab does not belong in the selected project', HttpStatus.BAD_REQUEST);
    }
    
/*
    if (craId !== createActivityDto.craId) {
      activity.cra = await this.craService.getCRAById(craId);
    } else {
      activity.cra = await this.craService.getCRAById(createActivityDto.craId);
    }
    */

    // Test in the CRA for the same month and year
    if (activity.cra.month != dateActivity.getMonth()+1 || activity.cra.year != dateActivity.getFullYear()) {
      throw new HttpException('Not in this CRA', HttpStatus.BAD_REQUEST);
    }

    // Test if the day is already fully occupied or part of a fully occupied period
    console.log('activity.cra.id= '+activity.cra.id);
    console.log('dateActivity= '+dateActivity);
    console.log('activity.matin= '+activity.matin);
    console.log('val retour= '+ await this.craService.checkActivityOrAbsenceExists(activity.cra.id, dateActivity, activity.matin));
    if (await this.craService.checkActivityOrAbsenceExists(activity.cra.id, dateActivity, activity.matin)) {
      throw new HttpException('FULL day or period', HttpStatus.BAD_REQUEST);
    }

    return this.activityRepository.save(activity);
  }

  collabInProject(project: Project, collab: User): boolean {
    const collabIds = project.collabs.map((collab) => collab.id);
    return collabIds.includes(collab.id);
  }




  async deleteActivity(id: number): Promise<void> {
    this.activityRepository.delete(id);
 }

 async getActivityById(id: number): Promise<Activity> {
   const absence = await this.activityRepository.findOne({ where: { id },relations: ['collab','cra','project'] });
 if (!absence) {
   throw new NotFoundException('Activity not found');
 }
 return absence;
 }

 

 async getActivitiesByDate(date: Date): Promise<Activity[]> {
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); 

  return this.activityRepository.find({
    where: {
      date: Between(startDate, endDate),
    },
  });
}


async getActivitiesByUserAndDate(userId: number, date: Date): Promise<Activity[]> {
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); 

  return this.activityRepository.find({
    where: {
      collab: { id: userId },
      date: Between(startDate, endDate),
    },
  });
}


async getActivitiesByUserAndMonthYear(userId: number, month: number, year: number): Promise<Activity[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const activities = await this.activityRepository.find({
    where: {
      collab: { id: userId },
      date: Between(startDate, endDate),
    },
  });

  return activities;
}


}


