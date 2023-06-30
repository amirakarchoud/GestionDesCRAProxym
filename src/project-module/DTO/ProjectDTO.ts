export class ProjectDTO {
  code: string;
  collabs: number[]; 
  constructor() {
    this.collabs = []; 
  }
}
