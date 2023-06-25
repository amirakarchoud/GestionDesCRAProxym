import { User } from "src/user-module/Entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Raison } from "./raison.enum";
import { CRA } from "src/cramodule/Entities/cra.entity";

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