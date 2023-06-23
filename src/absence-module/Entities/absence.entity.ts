import { User } from "src/user-module/Entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Raison } from "./raison.enum";

@Entity()
export class Absence {
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

  @Column('enum', { default: 'conges', enum: [ 'rtt', 'conges', 'maladie'] })
  raison: Raison;


}