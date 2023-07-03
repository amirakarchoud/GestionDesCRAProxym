import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Activity } from "./Entities/activity.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "../user-module/user.service";
import { ProjectService } from "../project-module/project.service";
import { CRAService } from "../cramodule/cra.service";
import { HolidayService } from "../holiday-module/holiday.service";
import { CreateActivityDto } from "./DTO/CreateActivityDto";
import { CreateCraDto } from "../cramodule/DTO/CreateCraDto";

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

    // Check if the specified CRA exists
    if (!(await this.craService.checkCRAExists(dateActivity.getMonth(), dateActivity.getFullYear(), createActivityDto.collabId))) {
      console.log('checked cra doesnt exist');
      // Create a new CRA if it doesnt exist
      const createCraDto: CreateCraDto = {
        year: dateActivity.getFullYear(),
        month: dateActivity.getMonth() + 1,
        collab: createActivityDto.collabId,
        date: new Date(),
      };

      console.log('created cra dto =' + createCraDto);

      try {
        const createdCra = await this.craService.createCra(createCraDto);
        craId = createdCra.id;
      } catch (error) {
        console.error('Error creating CRA:', error);
        throw new HttpException('Failed to create CRA', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const activity = new Activity();
    activity.code = createActivityDto.code;
    activity.date = createActivityDto.date;
    activity.matin = createActivityDto.matin;
    activity.collab = await this.userService.findById(createActivityDto.collabId);

    if (craId !== createActivityDto.craId) {
      activity.cra = await this.craService.getCRAById(craId);
    } else {
      activity.cra = await this.craService.getCRAById(createActivityDto.craId);
    }

    // Test in the CRA for the same month and year
    if (activity.cra.month != activity.date.getMonth() + 1 || activity.cra.year != activity.date.getFullYear()) {
      throw new HttpException('Not in this CRA', HttpStatus.BAD_REQUEST);
    }

    // Test if the day is already fully occupied or part of a fully occupied period
    if (this.craService.checkActivityOrAbsenceExists(activity.cra.id, activity.date, activity.matin)) {
      throw new HttpException('FULL day or period', HttpStatus.BAD_REQUEST);
    }

    return this.activityRepository.save(activity);
  }

 


}


