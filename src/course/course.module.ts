import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';

@Module({
  imports: [UserModule],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
