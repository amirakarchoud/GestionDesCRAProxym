import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { Project } from "./Entities/project.entity";
import { ProjectDTO } from "./DTO/ProjectDTO";
import { AuthGuard } from "../auth-module/auth.guard";
import { Roles } from "../auth-module/decorators/roles.decorator";
import { Role } from "../user-module/Entities/role.enum";
import { RolesGuard } from "../auth-module/guards/roles.guard";
@UseGuards(AuthGuard,RolesGuard)
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
  @Roles(Role.admin)
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