import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CourseService } from './service';
import { CourseController } from './controller';
import { CourseRegistrationRepository } from './repository';

@Module({
  imports: [UserModule],
  providers: [CourseService, CourseRegistrationRepository],
  controllers: [CourseController],
})
export class CourseModule {}
