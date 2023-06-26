import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./Entities/user.entity";
import { Absence } from "src/absence-module/Entities/absence.entity";
import { Activity } from "src/activity-module/Entities/activity.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  addAbsence(user:User,arg0: Absence) {
    user.absences.push(arg0);
}
addActivity(user:User,arg0: Activity) {
    user.activities.push(arg0);
}

}