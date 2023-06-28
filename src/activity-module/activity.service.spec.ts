import { Repository } from "typeorm";
import { Activity } from "./Entities/activity.entity";
import { ActivityService } from "./activity.service";

describe('activite ',()=>{
    let activityService:ActivityService;
    let activityRepository: Repository<Activity>;

    beforeEach(() => {
        activityService = new ActivityService(activityRepository);
      });
    
    it('test ',()=>{
       

    });
})