import { Repository } from "typeorm";
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
      //given
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
        collab: {} as User, // Add the user object representing the collaborator
        project: {} as Project, // Add the project object
        cra: { id: 1 } as CRA, // Add the CRA object
      };
      //when

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);
      jest.spyOn(activityRepository, 'save').mockResolvedValue(expectedActivity);
      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(userService, 'findById').mockResolvedValue({} as User | Promise<User>); // Mock the user service
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>); // Mock the CRA service

      const activity = await activityService.createActivity(createActivityDto);
      //then

      expect(activity).toEqual(expectedActivity);
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

      // when
      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);

      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA);

      jest.spyOn(craService, 'checkActivityOrAbsenceExists').mockResolvedValue(true);

      const activityService = new ActivityService(activityRepository, userService,projectService, craService, holidayService);

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
      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);

      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA);

      jest.spyOn(craService, 'checkActivityOrAbsenceExists').mockResolvedValue(false);

      const activityService = new ActivityService(activityRepository, userService,projectService, craService, holidayService);

      // then
      await expect(activityService.createActivity(createActivityDto)).rejects.toThrowError('Not in this CRA');
    });
  });
});
