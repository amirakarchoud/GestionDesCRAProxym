import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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

async findById(id: number): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });

  if (user) {
    return user;
  }

  throw new HttpException('A user with this username/email does not exist.', HttpStatus.NOT_FOUND);
}

async findByIds(ids: number[]): Promise<User[]> {
  const users= this.userRepository.findBy({id:In(ids)});
  if (users) {
    return users;
  }

  throw new HttpException('A user with this username/email does not exist.', HttpStatus.NOT_FOUND);

}

}



