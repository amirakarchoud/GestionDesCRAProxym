import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  name: string;
  
}