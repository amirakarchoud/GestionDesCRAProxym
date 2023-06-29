import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Holiday } from "./Entities/holiday.entity";
import { Between, Repository } from "typeorm";
import * as https from 'https';
import { environment } from "../environment/environment";

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async fetchAndStoreHolidays(): Promise<Holiday[]> {
    const year=new Date().getFullYear();
    const url = `${environment.apiUrl}${year}.json`;
    console.log(url);

    return new Promise<Holiday[]>((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const holidaysData = JSON.parse(data);

          const holidays: Holiday[] = [];

          for (const [dateStr, name] of Object.entries(holidaysData)) {
            const date = new Date(dateStr);
            const holiday = new Holiday();
            holiday.date = date;
            holiday.name = name as string;;
            holidays.push(holiday);
          }

          resolve(this.holidayRepository.save(holidays));
        });
      }).on('error api', (error) => {
        reject(error);
      });
    });
  }


  async getHolidayByDate(date: Date): Promise<Holiday[]> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to the start date
  
    return this.holidayRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });
  }
}