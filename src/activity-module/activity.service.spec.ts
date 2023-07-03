import { Between, Repository } from "typeorm";
import { Activity } from "./Entities/activity.entity";
import { ActivityService } from "./activity.service";
import { UserService } from "../user-module/user.service";
import { CRAService } from "../cramodule/cra.service";
import { HolidayService } from "../holiday-module/holiday.service";
import { ProjectService } from "../project-module/project.service";
import { User } from "../user-module/Entities/user.entity";
import { Project } from "../project-module/Entities/project.entity";
import { CRA } from "../cramodule/Entities/cra.entity";
import { CreateActivityDto } from "./DTO/CreateActivityDto";

describe('Activity Service', () => {
  let activityService: ActivityService;
  let userService: UserService;
  let craService: CRAService;
  let holidayService: HolidayService;
  let projectService:ProjectService;

  let activityRepository: Repository<Activity>;

  beforeEach(async () => {
    activityRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    } as unknown as Repository<Activity>;
    userService = {
      findById: jest.fn(),
    } as unknown as UserService;
    projectService = {
      findById: jest.fn(),
    } as unknown as ProjectService;

    craService = {
      checkActivityOrAbsenceExists: jest.fn(),
      getCRAById: jest.fn(),
      checkCRAExists: jest.fn(),
      createCra: jest.fn(),
    } as unknown as CRAService;

    holidayService = {
      getHolidayByDate: jest.fn(),
    } as unknown as HolidayService;
    activityService = new ActivityService(activityRepository, userService,projectService, craService, holidayService);
  });


    it('should return an array of activities', async () => {
      //When
      const activity1: Activity = {
        id: 1,
        code: 'ACT001',
        date: new Date(),
        matin: true,
        collab: {} as User,
        project: {} as Project,
        cra: {} as CRA,
      };

      const activity2: Activity = {
        id: 2,
        code: 'ACT002',
        date: new Date(),
        matin: false,
        collab: {} as User,
        project: {} as Project,
        cra: {} as CRA,
      };

      const expectedActivities: Activity[] = [activity1, activity2];
      //when

      jest.spyOn(activityRepository, 'find').mockResolvedValue(expectedActivities);

      const activities = await activityService.getAllActivities();
      //then

      expect(activities).toEqual(expectedActivities);
    });


  describe('create Activity', () => {
    it('should create and return an activity', async () => {
      // given
      const createActivityDto: CreateActivityDto = {
        code: 'ACT001',
        date: new Date('2023-06-18'),
        matin: true,
        collabId: 2,
        projectId: 1,
        craId: 1,
      };
    
      const expectedActivity: Activity = {
        id: 1,
        code: 'ACT001',
        date: new Date('2023-06-18'),
        matin: true,
        collab: { id: 2 } as User, // Add the user object representing the collaborator
        project: { id: 1, collabs: [{ id: 2 }] } as Project, // Add the project object with collaborator
        cra: { id: 1 } as CRA, // Add the CRA object
      };
    
      const mockProject = { id: 1, code: '123', collabs: [{ id: 2 } as User, { id: 3 }as User] } as Project;
      jest.spyOn(projectService, 'findById').mockResolvedValue(mockProject);
    
      // when
      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);
      jest.spyOn(activityRepository, 'save').mockResolvedValue(expectedActivity);
      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(userService, 'findById').mockResolvedValue({ id: 2 } as User | Promise<User>); // Mock the user service
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>); // Mock the CRA service
    
      const activity = await activityService.createActivity(createActivityDto);
    
      // then
      expect(activity).toEqual(expectedActivity);
      expect(projectService.findById).toBeCalledWith(createActivityDto.projectId);
    });
    

    it("should throw an exception when it's a holiday", async () => {
      //given
      const createActivityDto: CreateActivityDto = {
        code: 'ACT001',
        date: new Date('2023-06-18'), // Provide a date that is a holiday
        matin: true,
        collabId: 123,
        projectId: 456,
        craId: 789,
      };

      const holiday = {
        id: 1,
        date: new Date('2023-06-18'),
        name: 'test holiday',
      };

      //when

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([holiday]);
      //then

      await expect(activityService.createActivity(createActivityDto)).rejects.toThrowError(
        "It's a holiday (" + holiday.name + ")!"
      );
    });

    it('should create a CRA if it does not exist', async () => {
      //given
      const createActivityDto: CreateActivityDto = {
        code: 'ACT001',
        date: new Date('2023-08-14'),
        matin: false,
        collabId: 1,
        projectId: 2,
        craId: 5,
      };

      //when
      jest.spyOn(activityService, 'collabInProject').mockReturnValue(true);

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);
      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(false); // Mock that CRA does not exist
      jest.spyOn(craService, 'createCra').mockResolvedValue({ id: 10, month: 8, year: 2023 } as CRA); // Mock the created CRA with id 10
      jest.spyOn(userService, 'findById').mockResolvedValue({} as User | Promise<User>); // Mock the user service
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 5, month: 8, year: 2023 } as CRA | Promise<CRA>); // Mock the existing CRA

      const activity = await activityService.createActivity(createActivityDto);

      //then

      expect(craService.createCra).toBeCalled(); // Ensure the created CRA is assigned to the activity
    });

    it('should throw an error if the day is fully occupied', async () => {
      // given
      const createActivityDto: CreateActivityDto = {
        code: 'ACT001',
        date: new Date('2023-06-18'),
        matin: true,
        collabId: 2,
        projectId: 1,
        craId: 1,
      };
      jest.spyOn(activityService, 'collabInProject').mockReturnValue(true);

      // when
      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);

      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA);

      jest.spyOn(craService, 'checkActivityOrAbsenceExists').mockResolvedValue(true);

      // then
      await expect(activityService.createActivity(createActivityDto)).rejects.toThrowError('FULL day or period');
    });

    it('should throw an error if the activity is not in the same year and month of the cra', async () => {
      // given
      const createActivityDto: CreateActivityDto = {
        code: 'ACT001',
        date: new Date('2023-08-14'),
        matin: false,
        collabId: 1,
        projectId: 2,
        craId: 1,
      };

      // when
      jest.spyOn(activityService, 'collabInProject').mockReturnValue(true);
      
      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);

      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA);

      jest.spyOn(craService, 'checkActivityOrAbsenceExists').mockResolvedValue(false);


      // then
      await expect(activityService.createActivity(createActivityDto)).rejects.toThrowError('Not in this CRA');
    });
  });



  it('should return true if the collaborator is in the project', () => {
    // given
    const project: Project = {
      id: 1,
      collabs: [
        { id: 1, name: 'Collaborator 1' } as User,
        { id: 2, name: 'Collaborator 2' } as User,
      ],
    } as Project;
  
    const collab: User = { id: 2, name: 'Collaborator 2' } as User;
  
    // when
    const result = activityService.collabInProject(project, collab);
  
    // then
    expect(result).toBe(true);
  });
  
  it('should return false if the collaborator is not in the project', () => {
    // given
    const project: Project = {
      id: 1,
      collabs: [
        { id: 1, name: 'Collaborator 1' } as User,
        { id: 2, name: 'Collaborator 2' } as User,
      ],
    } as Project;
  
    const collab: User = { id: 3, name: 'Collaborator 2' } as User;
  
    // when
    const result = activityService.collabInProject(project, collab);
  
    // then
    expect(result).toBe(false);
  });





  it('should delete an activity', async () => {
    const actId = 1;
    const deleteSpy = jest.spyOn(activityRepository, 'delete');
  
    await activityService.deleteActivity(actId);
  
    expect(deleteSpy).toHaveBeenCalledWith(actId);
  });


  it('should return an absence by ID', async () => {
    const actId = 1;
    const findOneSpy = jest.spyOn(activityRepository, 'findOne').mockResolvedValue({ id: actId } as Activity);
    const result = await activityService.getActivityById(actId);
  
    expect(findOneSpy).toHaveBeenCalledWith({ where: { id: actId }, relations: ['collab', 'cra','project'] });
    expect(result.id).toEqual(actId);
  });


  it('should return absences for a user in a specific month and year', async () => {
    const userId = 1;
    const month = 6;
    const year = 2023;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const findSpy = jest.spyOn(activityRepository, 'find').mockResolvedValue([{ id: 1 }, { id: 2 }] as Activity[]);
  
  const result = await activityService.getActivitiesByUserAndMonthYear(userId, month, year);
  
    expect(findSpy).toHaveBeenCalledWith({
      where: {
        collab: { id: userId },
        date: Between(startDate, endDate),
      },
    });
    expect(result.length).toBe(2);
  });
  


  
});
