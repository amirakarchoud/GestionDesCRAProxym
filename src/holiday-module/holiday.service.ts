import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Holiday } from "./Entities/holiday.entity";
import { Repository } from "typeorm";
import * as http from 'http';
import { environment } from "../environment/environment";

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async fetchAndStoreHolidays(): Promise<Holiday[]> {
    const url = `${environment.apiUrl}${environment.year}.json`;

    return new Promise<Holiday[]>((resolve, reject) => {
      http.get(url, (res) => {
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
}