import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { Project } from "./Entities/project.entity";
import { ProjectDTO } from "./DTO/ProjectDTO";
@Controller('project')
export class ProjectController
{
    constructor(private readonly projectService: ProjectService) {}

    @Post()
    async addProject(@Body() projectDTO: ProjectDTO): Promise<Project> {
      return this.projectService.addProject(projectDTO);
    }

    @Get('user/:userId')
  async getProjectsByUserId(@Param('userId') userId: number): Promise<Project[]> {
    return this.projectService.getProjectsByUserId(userId);
  }

  @Get('get/:id')
  async getProjectId(@Param('id') id: number): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Get()
  async getAllProjects(): Promise<Project[]> {
    return this.projectService.getAllProjects();
  }

  @Delete(':id')
  async deleteProjectById(@Param('id') projectId: number): Promise<void> {
    await this.projectService.deleteProjectById(projectId);
  }

  @Put(':id')
  async updateProject(
    @Param('id') projectId: number,
    @Body() projectDto: ProjectDTO,
  ): Promise<Project> {
    return this.projectService.updateProject(projectId, projectDto);
  }
}