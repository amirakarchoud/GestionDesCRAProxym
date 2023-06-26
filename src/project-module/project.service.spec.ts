import { Repository } from "typeorm";
import { Project } from "./Entities/project.entity";
import { ProjectService } from "./project.service";
import { User } from "../user-module/Entities/user.entity";

describe('Collaborateur ',()=>{
    let projectService:ProjectService;
    let projectRepository: Repository<Project>;

    beforeEach(() => {
        projectService = new ProjectService(projectRepository);
      });



      it('peut contenir des collaborateurs',()=>{

        //given
        const projet=new Project();
        const collab=new User();
        //when
        projectService.addCollab(projet,collab);

        //then 
        expect(projet.collabs).toHaveLength(1);


    });

})