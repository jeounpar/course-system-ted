import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CourseFacade } from '../facade';
import { FindAvailableCourseDTO, RegisterCourseDTO } from './dto';

@Controller('course')
export class CourseController {
  constructor(
    @Inject(CourseFacade) private readonly _courseFacade: CourseFacade,
  ) {}

  @Get('/history/user/:userId')
  public async findRegistrationHistory(
    @Req() req: Request,
    @Param('userId') userId: number,
  ) {
    const history = await this._courseFacade.findRegistrationHistory({
      userId,
    });

    return history;
  }

  @Get('/available')
  public async findAvailableCourse(
    @Req() req: Request,
    @Query() dto: FindAvailableCourseDTO,
  ) {
    const { courseTime } = dto;
    const available = await this._courseFacade.findAvailableCourse({
      courseTime,
    });

    return available;
  }

  @Post('/register')
  public async registerCourse(
    @Req() req: Request,
    @Body() dto: RegisterCourseDTO,
  ) {
    const { userId, courseId } = dto;
    const register = await this._courseFacade.registerCourse({
      userId,
      courseId,
    });

    return register;
  }
}
