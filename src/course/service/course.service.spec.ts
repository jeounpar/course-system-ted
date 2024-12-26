import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { getAllEntities } from '../../config';
import { CourseRegistrationRepository, CourseRepository } from '../repository';
import { CourseService } from './course.service';
import {
  CourseEntity,
  CourseRegistrationEntity,
  UserEntity,
} from '../../entity';

describe('CourseService', () => {
  jest.setTimeout(30000);
  let courseService: CourseService;
  let dataSource: DataSource;
  let container: StartedMySqlContainer;

  let 유저_배열_40명: UserEntity[];
  let 특강: CourseEntity;

  beforeAll(async () => {
    container = await new MySqlContainer('mysql')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withUserPassword('test_password')
      .start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getUserPassword(),
          database: container.getDatabase(),
          entities: getAllEntities(),
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature(getAllEntities()),
      ],
      providers: [
        CourseService,
        CourseRepository,
        CourseRegistrationRepository,
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`DELETE FROM \`${entity.tableName}\``);
    }

    const userRepository = dataSource.getRepository(UserEntity);
    const courseRepository = dataSource.getRepository(CourseEntity);
    const courseRegistrationRepository = dataSource.getRepository(
      CourseRegistrationEntity,
    );

    const coach = new UserEntity();
    coach.name = 'COACH_01';
    coach.type = 'COACH';
    const coachEntity = await userRepository.save(coach);

    유저_배열_40명 = await userRepository.save(
      Array.from({ length: 40 }, (_, index) => {
        const student = new UserEntity();
        student.name = 'STUDENT_USER_' + index.toString();
        student.type = 'STUDENT';

        return student;
      }),
    );

    const courseEntity = new CourseEntity();
    courseEntity.userId = coachEntity.id;
    courseEntity.title = 'TEST_COURSE_TITLE';
    courseEntity.description = 'TEST_COURSE_DESCRIPTION';
    courseEntity.courseTime = '2024-12-25';

    특강 = await courseRepository.save(courseEntity);

    await courseRegistrationRepository.save(
      Array.from({ length: 30 }, () => {
        const courseRegistration = new CourseRegistrationEntity();
        courseRegistration.courseId = 특강.id;

        return courseRegistration;
      }),
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('30개 자리가 있는 특강에 동시에 40명이 신청한다.', async () => {
    const userIds = 유저_배열_40명.map((e) => e.id);
    const courseId = 특강.id;

    const 특강신청에_성공한_유저아이디_배열: number[] = [];

    await Promise.allSettled(
      userIds.map((userId) =>
        dataSource.transaction(async (entityManager) => {
          const success = await courseService.register({
            userId,
            courseId,
            entityManager,
          });
          특강신청에_성공한_유저아이디_배열.push(success.userId);
        }),
      ),
    );

    const 데이터베이스에_저장된_특강신청_목록 = await dataSource
      .getRepository(CourseRegistrationEntity)
      .find({ where: { courseId } });

    expect(특강신청에_성공한_유저아이디_배열.length).toEqual(30);
    expect(
      데이터베이스에_저장된_특강신청_목록.filter((e) => e.userId !== null)
        .length,
    ).toEqual(30);
    expect(
      데이터베이스에_저장된_특강신청_목록.map((e) => e.userId).sort(),
    ).toEqual(특강신청에_성공한_유저아이디_배열.sort());
  });

  it('같은 사용자가 동일한 특강에 5번 신청하면 한번만 성공한다.', async () => {
    const userId = 유저_배열_40명[0].id;
    const courseId = 특강.id;

    const 특강신청에_성공한_유저아이디_배열: number[] = [];

    await Promise.allSettled(
      Array(5)
        .fill(null)
        .map(() =>
          dataSource.transaction(async (entityManager) => {
            const success = await courseService.register({
              userId,
              courseId,
              entityManager,
            });
            특강신청에_성공한_유저아이디_배열.push(success.userId);
          }),
        ),
    );

    const 데이터베이스에_저장된_특강신청_목록 = await dataSource
      .getRepository(CourseRegistrationEntity)
      .find({ where: { courseId } });

    const 데이터베이스에_저장된_수강신청_유저아이디_배열 =
      데이터베이스에_저장된_특강신청_목록
        .filter((e) => e.userId !== null)
        .map((e) => e.userId);

    expect(특강신청에_성공한_유저아이디_배열.length).toEqual(1);
    expect(데이터베이스에_저장된_수강신청_유저아이디_배열.length).toEqual(1);
    expect(데이터베이스에_저장된_수강신청_유저아이디_배열.sort()).toEqual(
      특강신청에_성공한_유저아이디_배열.sort(),
    );
  });
});
