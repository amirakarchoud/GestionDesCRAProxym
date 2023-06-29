import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "./Entities/project.entity";
import { User } from "../user-module/Entities/user.entity";
import { ProjectDTO } from "./DTO/ProjectDTO";
import { UserService } from "../user-module/user.service";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,private readonly userService: UserService,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.find();
  }

 

addCollab(project:Project,collab: User) {
  if(!project.collabs)
  {project.collabs=[];}
    project.collabs.push(collab);
}

async addProject(projectDTO: ProjectDTO): Promise<Project> {
  const project = new Project();
  project.code = projectDTO.code;
  const collabs = await this.userService.findByIds(projectDTO.collabs);
  collabs.forEach((collab) => this.addCollab(project, collab));

  return this.projectRepository.save(project);
}

async findById(id: number): Promise<Project> {
  const user = await this.projectRepository.findOne({ where: { id },relations: ['collabs'] });
  if (user) {
    return user;
  }

  throw new HttpException('The project does not exist', HttpStatus.NOT_FOUND);
}



async getProjectsByUserId(userId: number): Promise<Project[]> {
  return this.projectRepository
    .createQueryBuilder('project')
    .innerJoin('project.collabs', 'collab')
    .where('collab.id = :userId', { userId })
    .getMany();
}


async deleteProjectById(projectId: number): Promise<void> {
  await this.projectRepository.delete(projectId);
}

async updateProject(projectId: number, projectDto: ProjectDTO): Promise<Project> {
  const project = await this.findById(projectId);
  if (!project) {
    throw new NotFoundException('Project not found');
  }
  if(projectDto.code)
  {project.code = projectDto.code;}
  if (projectDto.collabs)
  {const collabs = await this.userService.findByIds(projectDto.collabs);
    collabs.forEach((collab) => this.addCollab(project, collab));}

  return this.projectRepository.save(project);
}

}
