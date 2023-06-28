import { Project } from "../project-module/Entities/project.entity";
import { User } from "./Entities/user.entity";
import { UserService } from "./user.service";
import { Activity } from "../activity-module/Entities/activity.entity";
import { Absence } from "../absence-module/Entities/absence.entity";
import { Repository } from "typeorm";

describe('Collaborateur ',()=>{
    let userService:UserService;
    let userRepository: Repository<User>;

    beforeEach(() => {
        userService = new UserService(userRepository);
      });
    
    it('peut creer une activite ',()=>{
        //given
        const collab= new User();
        const myProject =new Project();
        collab.activities=[];
 
        //when
        //myProject.addCollab(collab);
        userService.addActivity(collab,new Activity());
        //then
        expect(collab.activities).toHaveLength(1);


    });

    it('peut creer une absence ',()=>{
        //given
        const collab= new User();
        collab.absences=[];
        //when
        userService.addAbsence(collab,new Absence());
        //then
        expect(collab.absences).toHaveLength(1);


    });



})