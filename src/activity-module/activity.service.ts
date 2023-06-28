import { Injectable } from "@nestjs/common";
import { Activity } from "./Entities/activity.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async getAllActivities(): Promise<Activity[]> {
    return this.activityRepository.find();
  }

 


}
