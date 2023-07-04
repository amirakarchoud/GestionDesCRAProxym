import { CRA } from "../../cramodule/Entities/cra.entity";
import { Project } from "../../project-module/Entities/project.entity";
import { User } from "../../user-module/Entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  date: Date;

  @Column()
  matin: boolean;

  @ManyToOne(() => User)
  collab: User;

  @ManyToOne(() => Project)
  project: Project;

  @ManyToOne(() => CRA)
  cra: CRA;



}