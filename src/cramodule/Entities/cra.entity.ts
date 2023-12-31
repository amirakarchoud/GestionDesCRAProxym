import { Absence } from "../../absence-module/Entities/absence.entity";
import { Activity } from "../../activity-module/Entities/activity.entity";
import { User } from "../../user-module/Entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Etat } from "./etat.enum";

@Entity()
export class CRA {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;
  @Column()
  month: number;
  @Column()
  year: number;
  @Column()
  etat:Etat;


  @ManyToOne(() => User)
  collab: User;

  @OneToMany(() => Absence,(absence)=>absence.cra)
  absences: Absence[];

  @OneToMany(() => Activity,(activity)=>activity.cra)
  activities: Activity[];




}