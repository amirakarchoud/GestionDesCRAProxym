import { User } from "../../user-module/Entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @ManyToMany(() => User)
  collabs: User[];

 


}