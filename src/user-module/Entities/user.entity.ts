import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.enum";
import { Absence } from "../../absence-module/Entities/absence.entity";
import { Activity } from "../../activity-module/Entities/activity.entity";
import { Project } from "../../project-module/Entities/project.entity";
import { CRA } from "../../cramodule/Entities/cra.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('enum', { default: 'collab', enum: [ 'admin', 'collab'] })
  role: Role;

  @OneToMany(() => Absence,(absence) => absence.collab)
  absences:Absence[]=[];

  @OneToMany(() => Activity,(activity) => activity.collab)
  activities:Activity[]=[];


  @ManyToMany(() => Project)
  projects:Project[]=[];

  @OneToMany(() => CRA,(cra) => cra.collab)
  cras:CRA[]=[];


  
}