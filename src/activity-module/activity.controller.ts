import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { Activity } from "./Entities/activity.entity";
import { CreateActivityDto } from "./DTO/CreateActivityDto";
@Controller('activity')
export class ActivityController{
    constructor(private readonly activityService: ActivityService) {}

    @Get()
    async getAllActivities(): Promise<Activity[]> {
      return this.activityService.getAllActivities();
    }
  
    @Post()
    async createActivity(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
      return this.activityService.createActivity(createActivityDto);
    }
  
    @Delete(':id')
    async deleteActivity(@Param('id') id: number): Promise<void> {
      return this.activityService.deleteActivity(id);
    }
  
    @Get(':id')
    async getActivityById(@Param('id') id: number): Promise<Activity> {
      return this.activityService.getActivityById(id);
    }
  
  
    @Get(':userId/month/:month/year/:year')
    async getActivitiesByUserAndMonthYear(
      @Param('userId') userId: number,
      @Param('month') month: number,
      @Param('year') year: number,
    ): Promise<Activity[]> {
      return this.activityService.getActivitiesByUserAndMonthYear(userId, month, year);
    }
  
  
    @Get('date/:date')
    async getActivitiesByDate(@Param('date') date: string): Promise<Activity[]> {
      const parsedDate = new Date(date);
  
      return this.activityService.getActivitiesByDate(parsedDate);
    }
  
    @Get('userDate/:id/:date')
    async getActivitiesByDateandUser(@Param('date') date: string,@Param('id') userId: number): Promise<Activity[]> {
      const parsedDate = new Date(date);
      console.log(parsedDate);
  
      return this.activityService.getActivitiesByUserAndDate(userId,parsedDate);
    }
}