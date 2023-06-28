
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Raison } from "./raison.enum";
import { CRA } from "../../cramodule/Entities/cra.entity";
import { User } from "../../user-module/Entities/user.entity";

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

  @ManyToOne(() => CRA)
  cra: CRA;


}