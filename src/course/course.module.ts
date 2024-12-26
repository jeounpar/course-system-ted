import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CourseService } from './service';
import { CourseController } from './controller';
import { CourseRegistrationRepository, CourseRepository } from './repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity, CourseRegistrationEntity } from '../entity';
import { CourseFacade } from './facade';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, CourseRegistrationEntity]),
    UserModule,
  ],
  providers: [
    CourseFacade,
    CourseService,
    CourseRepository,
    CourseRegistrationRepository,
  ],
  controllers: [CourseController],
})
export class CourseModule {}
