import { Raison } from "../Entities/raison.enum";

export class UpdateAbsenceDto {
 
    date?: Date;
    matin?: boolean;
    collabId?: number;
    raison?: Raison;
    craId?: number;
  }