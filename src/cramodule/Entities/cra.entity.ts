import { Absence } from "src/absence-module/Entities/absence.entity";
import { Activity } from "src/activity-module/Entities/activity.entity";
import { User } from "src/user-module/Entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CRA {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  date: Date;

  @Column()
  matin: boolean;

  @ManyToOne(() => User)
  collab: User;

  @OneToMany(() => Absence,(absence)=>absence.cra)
  absences: Absence[];

  @OneToMany(() => Activity,(activity)=>activity.cra)
  activities: Activity[];



}