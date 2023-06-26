import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "./Entities/project.entity";
import { User } from "../user-module/Entities/user.entity";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.find();
  }

 

addCollab(project:Project,collab: User) {
    project.collabs.push(collab);
}

}
