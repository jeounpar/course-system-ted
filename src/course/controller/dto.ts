import { IsDefined, IsNumber, IsString } from 'class-validator';

export class FindAvailableCourseDTO {
  @IsDefined()
  @IsString()
  courseTime: string;
}

export class RegisterCourseDTO {
  @IsDefined()
  @IsNumber()
  userId: number;

  @IsDefined()
  @IsNumber()
  courseId: number;
}
