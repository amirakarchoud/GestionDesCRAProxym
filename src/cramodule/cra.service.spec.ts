import { Test } from '@nestjs/testing';
import { CRAService } from './cra.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CRA } from './Entities/cra.entity';
import { UserService } from '../user-module/user.service';
import { Role } from '../user-module/Entities/role.enum';
import { User } from '../user-module/Entities/user.entity';

describe('CRAService', () => {
    let craService: CRAService;
    let craRepository: Repository<CRA>;
    let userService: UserService;

    beforeEach(async () => {

        craRepository = {
            find: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
        } as unknown as Repository<CRA>;
        userService = {
            findById: jest.fn(),
        } as unknown as UserService;
        craService = new CRAService(craRepository, userService);
    });

    describe('getCRAById', () => {
        //given
        const craId = 1;
        const foundCRA = { id: craId } as CRA;

        it('should return the CRA when found', async () => {
            //when
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(foundCRA);

            const result = await craService.getCRAById(craId);
            //then

            expect(result).toBe(foundCRA);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { id: craId } });
        });
        it('should throw NotFoundException when CRA is not found', async () => {
            //when
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(undefined);
            //then

            await expect(craService.getCRAById(craId)).rejects.toThrowError(NotFoundException);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { id: craId } });
        });
    });




    describe('formatDate', () => {
        it('should format the date correctly', () => {
            //given
            const date = new Date(2023, 5, 30);
            //when
            const formattedDate = craService.formatDate(date);
            //then
            expect(formattedDate).toBe('2023-06-30');
        });
    });

    describe('checkActivityOrAbsenceExists', () => {
        //given
        const craId = 1;
        const date = new Date(2023, 5, 30);
        const matin = true;
        const existingActivity = { date, matin };
        const existingAbsence = { date, matin };
        const existingCRA = { id: craId, activities: [existingActivity], absences: [existingAbsence] } as CRA;

        it('should return true if activity exists for the given date and matin', async () => {
            //when
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(existingCRA);

            const result = await craService.checkActivityOrAbsenceExists(craId, date, matin);
            //then

            expect(result).toBe(true);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { id: craId }, relations: ['activities', 'absences'] });
        });

        it('should return true if absence exists for the given date and matin', async () => {
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(existingCRA);

            const result = await craService.checkActivityOrAbsenceExists(craId, date, matin);

            expect(result).toBe(true);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { id: craId }, relations: ['activities', 'absences'] });
        });

        it('should return false if no activity or absence exists for the given date and boolean matin for the period', async () => {
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(existingCRA);

            const result = await craService.checkActivityOrAbsenceExists(craId, new Date(2023, 5, 29), false);

            expect(result).toBe(false);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { id: craId }, relations: ['activities', 'absences'] });
        });

        it('should return false if CRA is not found', async () => {
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(undefined);

            const result = await craService.checkActivityOrAbsenceExists(craId, date, matin);

            expect(result).toBe(false);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { id: craId }, relations: ['activities', 'absences'] });
        });
    });

    describe('checkCRAExists', () => {
        const month = 6;
        const year = 2023;
        const collabId = 1;
        const existingCRA = {} as CRA;

        it('should return true if CRA exists for the given month, year, and collabId', async () => {
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(existingCRA);

            const result = await craService.checkCRAExists(month, year, collabId);

            expect(result).toBe(true);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { month, year, collab: { id: collabId } } });
        });

        it('should return false if CRA is not found', async () => {
            jest.spyOn(craRepository, 'findOne').mockResolvedValue(undefined);

            const result = await craService.checkCRAExists(month, year, collabId);

            expect(result).toBe(false);
            expect(craRepository.findOne).toHaveBeenCalledWith({ where: { month, year, collab: { id: collabId } } });
        });
    });

    describe('createCra', () => {
        const createCraDto = { year: 2023, month: 6, collab: 1, date: new Date() };

        it('should create and return the CRA', async () => {
            const collabId = createCraDto.collab;
            const createdCRA = { id: 1 } as CRA;
            const collab = { id: collabId, name: 'John Doe', role: Role.collab } as User;

            jest.spyOn(userService, 'findById').mockResolvedValue(collab);
            jest.spyOn(craRepository, 'save').mockResolvedValue(createdCRA);

            const result = await craService.createCra(createCraDto);

            expect(result).toBe(createdCRA);
            expect(userService.findById).toHaveBeenCalledWith(collabId);
            expect(craRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    year: createCraDto.year,
                    month: createCraDto.month,
                    collab,
                    date: createCraDto.date,
                    absences: [],
                    activities: [],
                }),
            );
        });
    });

});
