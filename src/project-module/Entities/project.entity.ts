import { User } from "../../user-module/Entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @ManyToMany(() => User)
  @JoinTable()
  collabs: User[];

 


}