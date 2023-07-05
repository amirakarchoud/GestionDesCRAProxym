import { Injectable } from "@nestjs/common";
import { environment } from "../environment/environment";
import * as https from 'https';
import { Cron } from "@nestjs/schedule";
import { UserService } from "../user-module/user.service";
import { CRAService } from "../cramodule/cra.service";
import { Etat } from "src/cramodule/Entities/etat.enum";

@Injectable()
export class NotificationService {
  constructor(private readonly userService: UserService, private readonly craService: CRAService) {
  }


  async sendReminders(message: string, emailList: string[]): Promise<void> {
    const url = `${environment.NotificationBot}`;
    const requestData = JSON.stringify({ message, emailList });

    const options: https.RequestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(url, options, (res) => {
      res.on("data", (data) => {
        console.log(data.toString());
      });
    });

    req.on("error", (error) => {
      console.error("Error sending reminders:", error);
    });

    req.write(requestData);
    req.end();
  }

  @Cron('0 0 9 21 * * ')
  async sendRegularReminder(): Promise<void> {
    const users = (await this.userService.getAllUsers());
    const message = "Rappel : Création du compte rendu d'activité";
    const emailList = users.map(user => user.email);

    this.sendReminders(message, emailList)
      .then(() => {
        console.log("Regular reminders sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending regular reminders:", error);
      });
  }

  @Cron('0 0 9 24 * * ')
  async sendDetailedReminder() {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const users = await this.userService.getAllUsers();
    let neverCreated = [];
    let submitted = [];

    await users.forEach(async user => {
      let createdTheirCra = await this.craService.checkCRAExists(month, year, user.id);
      if (!createdTheirCra) {
        neverCreated.push(user.email);
      }
      else {
        let cra = await this.craService.getThisMonthsUserCra(user.id)
        if ((await cra).etat == Etat.submitted) {
          submitted.push(user.email);
        }
        else {
          this.sendEmptyDatesReminder(user.id);
        }

      }


    });

    this.sendReminders("Rappel: still haven't even created ", neverCreated);
    this.sendReminders("Thank you for submitting", submitted)
  }

  async sendEmptyDatesReminder(user: number): Promise<void> {
    const cra = (await this.craService.getThisMonthsUserCra(user));
    let users = [];
    let emptyDates = await this.craService.getAvailableDatesOfMonth(cra.id);

    const message = " Vous avez encore " + emptyDates.length + " jours qui manquent";
    const emailList = users.map(user => user.email);

    this.sendReminders(message, emailList)
      .then(() => {
        console.log(" reminders sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending reminders:", error);
      });
  }



}