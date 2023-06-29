import { Raison } from "../Entities/raison.enum";

export class CreateAbsenceDto {

    date: Date;
    matin: boolean;
    collabId: number;
    raison: Raison;
    craId: number;
  }