import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.enum";
import { Absence } from "src/absence-module/Entities/absence.entity";
import { Activity } from "src/activity-module/Entities/activity.entity";
import { Project } from "src/project-module/Entities/project.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('enum', { default: 'collab', enum: [ 'admin', 'collab'] })
  role: Role;

  @OneToMany(() => Absence,(absence) => absence.collab)
  absences:Absence[];

  @OneToMany(() => Activity,(activity) => activity.collab)
  activities:Activity[];


  @ManyToMany(() => Project)
  projects:Project[];


  
}