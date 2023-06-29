export class ProjectDTO {
  code: string;
  collabs: number[]; //a verifier
  constructor() {
    this.collabs = []; // Initialize the collabs property with an empty array
  }
}
