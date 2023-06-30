import { Repository } from "typeorm";
import { Project } from "./Entities/project.entity";
import { ProjectService } from "./project.service";
import { User } from "../user-module/Entities/user.entity";
import { UserService } from "../user-module/user.service";
import { HttpException, NotFoundException } from "@nestjs/common";

describe('Collaborateur ', () => {
  let projectService: ProjectService;
  let userService: UserService;
  let projectRepository: Repository<Project>;

  beforeEach(() => {
    projectRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    } as unknown as Repository<Project>;
    userService = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    } as unknown as UserService;
    projectService = new ProjectService(projectRepository, userService);
  });



  it('peut contenir des collaborateurs', () => {

    //given
    const projet = new Project();
    const collab = new User();
    projet.collabs = [];
    //when
    projectService.addCollab(projet, collab);

    //then 
    expect(projet.collabs).toHaveLength(1);


  });




  describe('getAllProjects', () => {
    it('should return an array of projects', async () => {
      //given
      const projects: Project[] = [
        { id: 1, code: 'project1' } as Project,
        { id: 2, code: 'project2' } as Project,
      ];

      //when
      jest.spyOn(projectRepository, 'find').mockResolvedValue(projects);

      const result = await projectService.getAllProjects();
      //then
      expect(result).toEqual(projects);
      expect(projectRepository.find).toHaveBeenCalled();
    });
  });


  it('should add the collab to the project', () => {
    //given
    const project: Project = { id: 1, code: 'project1', collabs: [] } as Project;
    const collab: User = { id: 1, name: 'John Doe' } as User;
    //when

    projectService.addCollab(project, collab);
    //then

    expect(project.collabs).toEqual([collab]);
  });




  describe('addProject', () => {
    //given
    const projectDTO = {
      code: 'project1',
      collabs: [1, 2, 3],
    };

    it('should add a project with collabs', async () => {
      const project = new Project();
      project.code = projectDTO.code;

      const collabs = [
        { id: 1, name: 'John Doe' } as User,
        { id: 2, name: 'Jane Smith' } as User,
        { id: 3, name: 'Bob Johnson' } as User,
      ];
      //when

      jest.spyOn(userService, 'findByIds').mockResolvedValue(collabs);
      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);

      const result = await projectService.addProject(projectDTO);
      //then
      expect(result).toBe(project);
      expect(userService.findByIds).toHaveBeenCalledWith(projectDTO.collabs);
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: projectDTO.code,
          collabs,
        }),
      );
    });
  });

  describe('findById', () => {
    //given
    const projectId = 1;

    it('should return the project if it exists', async () => {
      const project: Project = { id: projectId, code: 'project1', collabs: [] } as Project;
      //when

      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(project);

      const result = await projectService.findById(projectId);
      //then

      expect(result).toEqual(project);
      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId },
        relations: ['collabs'],
      });
    });

    it('should throw HttpException if the project does not exist already', async () => {
      //when
      jest.spyOn(projectRepository, 'findOne').mockResolvedValue(null);

      //then
      await expect(projectService.findById(projectId)).rejects.toThrow(HttpException);
      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId },
        relations: ['collabs'],
      });
    });
  });



  describe('delete Project with that id', () => {
    //given
    const projectId = 1;

    it('should delete the project', async () => {
      //when
      await projectService.deleteProjectById(projectId);
      //then
      expect(projectRepository.delete).toHaveBeenCalledWith(projectId);
    });
  });

  describe('update a Project given by its ip', () => {
    //given
    const projectId = 1;
    const projectDTO = {
      code: 'project2',
      collabs: [2, 3],
    };

    it('should update and return the project with updated fields', async () => {
      const project: Project = { id: projectId, code: 'project1', collabs: [] } as Project;
      const collabs: User[] = [
        { id: 2, name: 'Jane Smith' } as User,
        { id: 3, name: 'Alice Johnson' } as User,
      ];
      //when

      jest.spyOn(projectService, 'findById').mockResolvedValue(project);
      jest.spyOn(userService, 'findByIds').mockResolvedValue(collabs);
      jest.spyOn(projectRepository, 'save').mockResolvedValue({ id: projectId, ...projectDTO, collabs } as Project);

      const result = await projectService.updateProject(projectId, projectDTO);

      //then

      expect(result).toEqual({ id: projectId, ...projectDTO, collabs });
      expect(projectService.findById).toHaveBeenCalledWith(projectId);
      expect(userService.findByIds).toHaveBeenCalledWith(projectDTO.collabs);
      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: projectId,
          code: projectDTO.code,
          collabs: collabs,
        }),
      );
    });


    it('should throw NotFoundException if the project does not exist', async () => {
      jest.spyOn(projectService, 'findById').mockResolvedValue(null);

      await expect(projectService.updateProject(projectId, projectDTO)).rejects.toThrow(NotFoundException);
      expect(projectService.findById).toHaveBeenCalledWith(projectId);
    });
  });
});