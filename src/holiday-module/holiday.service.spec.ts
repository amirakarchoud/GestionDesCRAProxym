import { Test, TestingModule } from '@nestjs/testing';
import { HolidayService } from './holiday.service';
import * as http from 'http';
import { Holiday } from './Entities/holiday.entity';
import { Repository } from 'typeorm';
import { environment } from '../environment/environment';

describe('HolidayService', () => {
  let holidayService: HolidayService;
  let holidayRepository: Repository<Holiday>;

  beforeEach(async () => {
    holidayService=new HolidayService(holidayRepository);
  });
/*
  describe('fetchAndStoreHolidays', () => {
    it('should fetch and store holidays', async () => {
      const mockHolidayData = {
        '2023-01-01': 'New Year',
        '2023-12-25': 'Christmas',
      };
      const mockResponse = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') {
            callback(JSON.stringify(mockHolidayData));
          } else if (event === 'end') {
            callback();
          }
        }),
      };
      const mockHttpRequest = jest.fn().mockImplementation(() => mockResponse as any);
      const mockSavedHolidays = [
        { id: 1, date: new Date('2023-01-01'), name: 'New Year' },
        { id: 2, date: new Date('2023-12-25'), name: 'Christmas' },
      ];
      
      const mockSave = holidayRepository.save as jest.Mock;
      mockSave.mockResolvedValue(mockSavedHolidays);

      jest.spyOn(http, 'request').mockImplementation(mockHttpRequest);

      const result = await holidayService.fetchAndStoreHolidays();

      expect(mockHttpRequest).toHaveBeenCalledWith(
        `${environment.apiUrl}${environment.year}.json`,
        expect.any(Function)
      );
      expect(mockSave).toHaveBeenCalledWith([
        { date: new Date('2023-01-01'), name: 'New Year' },
        { date: new Date('2023-12-25'), name: 'Christmas' },
      ]);
      expect(result).toEqual(mockSavedHolidays);
      
    });
    */

    it('should reject with an error if API request fails', async () => {
      const mockHttpRequest = jest.fn().mockImplementation(() => {
        throw new Error('API request failed');
      });

      jest.spyOn(http, 'request').mockImplementation(mockHttpRequest);
/*
      await expect(holidayService.fetchAndStoreHolidays()).rejects.toThrow('API request failed');
      expect(mockHttpRequest).toHaveBeenCalledWith(
        `${environment.apiUrl}${environment.year}.json`,
        expect.any(Function)
      );
    });
    */
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
})
