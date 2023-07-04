import { Between, Repository } from "typeorm";
import { Absence } from "./Entities/absence.entity";
import { AbsenceService } from "./absence.service";
import { UserService } from "../user-module/user.service";
import { CRAService } from "../cramodule/cra.service";
import { HolidayService } from "../holiday-module/holiday.service";
import { CreateAbsenceDto } from "./DTO/CreateAbsenceDTO";
import { Raison } from "./Entities/raison.enum";
import { User } from "../user-module/Entities/user.entity";
import { CRA } from "../cramodule/Entities/cra.entity";
import { UpdateAbsenceDto } from "./DTO/updateAbsenceDTO";

describe('service des absences', () => {
  let absenceService: AbsenceService;
  let userService: UserService;
  let craService: CRAService;
  let holidayService: HolidayService;

  let absenceRepository: Repository<Absence>;

  beforeEach(async () => {
    absenceRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    } as unknown as Repository<Absence>;
    userService = {
      findById: jest.fn(),
    } as unknown as UserService;

    craService = {
      checkActivityOrAbsenceExists: jest.fn(),
      getCRAById: jest.fn(),
      checkCRAExists: jest.fn(),
      createCra: jest.fn(),
      verifyUserCra: jest.fn(),
      findOne: jest.fn(),
    } as unknown as CRAService;

    holidayService = {
      getHolidayByDate: jest.fn(),
    } as unknown as HolidayService;
    absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);

  });



  it('should return an array of absences', async () => {
    //given
    const abs1 = new Absence();
    abs1.date = new Date();
    abs1.matin = true;
    const abs2 = new Absence();
    abs2.date = new Date();
    abs2.matin = false;

    const expectedAbsences: Absence[] = [
      abs1, abs2
    ];
    //when

    jest.spyOn(absenceRepository, 'find').mockResolvedValue(expectedAbsences);

    const absences = await absenceService.getAllAbsences();
    //then
    expect(absences).toEqual(expectedAbsences);
  });





  describe('createAbsence', () => {
    it('should create and return an absence', async () => {
      //given
      const createAbsenceDto: CreateAbsenceDto = {
        date: new Date('2023-06-18'),
        matin: true,
        collabId: 2,
        raison: Raison.maladie,
        craId: 1,
      };

      const expectedAbsence: Absence = {
        id: 1,
        date: new Date('2023-06-18'),
        matin: true,
        collab: { id: 2 } as User, // Add the user object representing the collaborator
        raison: Raison.maladie,
        cra: { id: 1 } as CRA, // Add the CRA object
      };
      //when
      jest.spyOn(craService, 'findOne').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>); // Mock the CRA service
      jest.spyOn(craService, 'verifyUserCra').mockResolvedValue(true);
      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);
      jest.spyOn(absenceRepository, 'save').mockResolvedValue(expectedAbsence);
      jest.spyOn(userService, 'findById').mockResolvedValue({} as User | Promise<User>); // Mock the user service
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>); // Mock the CRA service
      jest.spyOn(craService, 'createCra').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>);


      const absence = await absenceService.createAbsence(createAbsenceDto);
      //then
      expect(absence).toEqual(expectedAbsence);
    });


    it("should throw an exception when it's a holiday", async () => {
      //given
      const createAbsenceDto: CreateAbsenceDto = {
        date: new Date('2023-06-18'),
        matin: true,
        collabId: 123,
        raison: Raison.maladie,
        craId: 456,
      };

      const holiday = {
        id: 1,
        date: new Date('2023-06-18'),
        name: 'test holiday'
      };
      //when

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([holiday]);

      //then
      await expect(absenceService.createAbsence(createAbsenceDto)).rejects.toThrowError(
        "It's a holiday (" + holiday.name + ")!"
      );
    });



    it('should create a CRA if it does not exist', async () => {
      //given
      const createAbsenceDto: CreateAbsenceDto = {
        date: new Date('2023-08-14'),
        matin: false,
        raison: Raison.maladie,
        collabId: 1,
        craId: 5,
      };
      //when

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);
      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(false);
      jest.spyOn(craService, 'verifyUserCra').mockResolvedValue(false);
      jest.spyOn(craService, 'createCra').mockResolvedValue({ id: 5, month: 8, year: 2023 } as CRA);
      jest.spyOn(userService, 'findById').mockResolvedValue({} as User | Promise<User>);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 5, month: 8, year: 2023 } as CRA | Promise<CRA>);

      const absence = await absenceService.createAbsence(createAbsenceDto);
      //then
      expect(craService.createCra).toBeCalled();
    });


    it('should throw an error if the day is fully occupied', async () => {
      // given
      const createAbsenceDto: CreateAbsenceDto = {
        date: new Date('2023-06-18'),
        matin: true,
        collabId: 2,
        raison: Raison.maladie,
        craId: 1,
      };
      //when
      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);

      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA);
      jest.spyOn(craService, 'findOne').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>); // Mock the CRA service

      jest.spyOn(craService, 'checkActivityOrAbsenceExists').mockResolvedValue(true);

      const absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);

      // then
      await expect(absenceService.createAbsence(createAbsenceDto)).rejects.toThrowError('FULL day or period');
    });


    it('should throw an error if the absence is not in the same year and month', async () => {
      // given
      const createAbsenceDto: CreateAbsenceDto = {
        date: new Date('2023-08-14'),
        matin: false,
        collabId: 1,
        raison: Raison.maladie,
        craId: 1,
      };

      //when

      jest.spyOn(holidayService, 'getHolidayByDate').mockResolvedValue([]);

      jest.spyOn(craService, 'checkCRAExists').mockResolvedValue(true);
      jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA);
      jest.spyOn(craService, 'findOne').mockResolvedValue({ id: 1, month: 6, year: 2023 } as CRA | Promise<CRA>); // Mock the CRA service

      jest.spyOn(craService, 'checkActivityOrAbsenceExists').mockResolvedValue(false);

      const absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);
      //then
      await expect(absenceService.createAbsence(createAbsenceDto)).rejects.toThrowError('Not in this CRA');
    });


  });



  it('should delete an absence', async () => {
    const absenceId = 1;
    const deleteSpy = jest.spyOn(absenceRepository, 'delete');

    const absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);
    await absenceService.deleteAbsence(absenceId);

    expect(deleteSpy).toHaveBeenCalledWith(absenceId);
  });


  it('should return an absence by ID', async () => {
    const absenceId = 1;
    const findOneSpy = jest.spyOn(absenceRepository, 'findOne').mockResolvedValue({ id: absenceId } as Absence);

    const absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);
    const result = await absenceService.getAbsenceById(absenceId);

    expect(findOneSpy).toHaveBeenCalledWith({ where: { id: absenceId }, relations: ['collab', 'cra'] });
    expect(result.id).toEqual(absenceId);
  });


  it('should return absences for a user in a specific month and year', async () => {
    const userId = 1;
    const month = 6;
    const year = 2023;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const findSpy = jest.spyOn(absenceRepository, 'find').mockResolvedValue([{ id: 1 }, { id: 2 }] as Absence[]);

    // const absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);
    const result = await absenceService.getAbsencesByUserAndMonthYear(userId, month, year);

    expect(findSpy).toHaveBeenCalledWith({
      where: {
        collab: { id: userId },
        date: Between(startDate, endDate),
      },
    });
    expect(result.length).toBe(2);
  });



  it('should update an absence', async () => {
    const absenceId = 1;
    const updateAbsenceDto: UpdateAbsenceDto = {
      date: new Date('2023-06-18'),
      matin: true,
      raison: Raison.maladie,
      collabId: 2,
      craId: 3,
    };
    const getAbsenceByIdSpy = jest.spyOn(absenceService, 'getAbsenceById').mockResolvedValue({ id: absenceId } as Absence);
    const saveSpy = jest.spyOn(absenceRepository, 'save').mockResolvedValue({ id: absenceId } as Absence);
    const findByIdSpy = jest.spyOn(userService, 'findById').mockResolvedValue({ id: 2 } as User);
    const getCRAByIdSpy = jest.spyOn(craService, 'getCRAById').mockResolvedValue({ id: 3 } as CRA);

    //const absenceService = new AbsenceService(absenceRepository, userService, craService, holidayService);
    const result = await absenceService.updateAbsence(absenceId, updateAbsenceDto);

    expect(getAbsenceByIdSpy).toHaveBeenCalledWith(absenceId);
    expect(saveSpy).toHaveBeenCalled();
    expect(findByIdSpy).toHaveBeenCalledWith(updateAbsenceDto.collabId);
    expect(getCRAByIdSpy).toHaveBeenCalledWith(updateAbsenceDto.craId);
    expect(result.id).toEqual(absenceId);
  });



  describe('checkAddingUpdatingDate', () => {
    it('should return true if it is allowed to update', () => {
      const month = new Date().getMonth(); // Current month
      const year = new Date().getFullYear();

      const result = absenceService.checkAddingUpdatingDate(month, year);

      expect(result).toBe(true);
    });

    it('should return false if it is not allowed to update', () => {
      const today = new Date();
      const beforeFiveDays = new Date();
      beforeFiveDays.setDate(today.getDate() - 5);

      const month = (today.getMonth() + 1) % 12; // Next month
      const year = today.getFullYear();

      const result = absenceService.checkAddingUpdatingDate(month, year);

      expect(result).toBe(false);
    });
  });




});