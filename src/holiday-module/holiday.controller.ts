import { Controller, Post } from "@nestjs/common";
import { HolidayService } from "./holiday.service";
import { Holiday } from "./Entities/holiday.entity";

@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post('fetch')
  async fetchAndStoreHolidays(): Promise<Holiday[]> {
    const currentYear = new Date().getFullYear();
    return this.holidayService.fetchAndStoreHolidays();
  }
}