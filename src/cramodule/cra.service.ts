import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CRA } from "./Entities/cra.entity";
@Injectable()
export class CRAService {
  constructor(
    @InjectRepository(CRA)
    private readonly CRARepository: Repository<CRA>,
  ) {}

}