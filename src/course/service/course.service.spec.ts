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

  it('특정 날짜에 특강 신청이 가능한 특강을 조회한다.', async () => {
    const userRepository = dataSource.getRepository(UserEntity);
    const courseRepository = dataSource.getRepository(CourseEntity);
    const courseRegistrationRepository = dataSource.getRepository(
      CourseRegistrationEntity,
    );

    const COACH_02 = await userRepository.save({
      name: 'COACH_02',
      type: 'COACH',
    });
    const COACH_03 = await userRepository.save({
      name: 'COACH_03',
      type: 'COACH',
    });

    const COURSE_02 = await courseRepository.save({
      userId: COACH_02.id,
      title: 'TEST_COURSE_TITLE_02',
      description: 'TEST_COURSE_DESCRIPTION_02',
      courseTime: '2024-12-25',
    });
    const COURSE_03 = await courseRepository.save({
      userId: COACH_03.id,
      title: 'TEST_COURSE_TITLE_03',
      description: 'TEST_COURSE_DESCRIPTION_03',
      courseTime: '2024-12-25',
    });

    await courseRegistrationRepository.save([
      ...Array.from({ length: 30 }, () => {
        const courseRegistration = new CourseRegistrationEntity();
        courseRegistration.courseId = COURSE_02.id;

        return courseRegistration;
      }),
      ...Array.from({ length: 30 }, () => {
        const courseRegistration = new CourseRegistrationEntity();
        courseRegistration.courseId = COURSE_03.id;

        return courseRegistration;
      }),
    ]);

    const 잘못된_날짜로_조회 = await courseService.findAvailable({
      courseTime: '2024-12-24',
    });

    const 올바른_날짜로_조회 = await courseService.findAvailable({
      courseTime: '2024-12-25',
    });

    expect(잘못된_날짜로_조회.length).toEqual(0);

    expect(올바른_날짜로_조회.length).toEqual(3);
    expect(
      올바른_날짜로_조회.map((e) => e.toResponse()).map((e) => e.totalCount),
    ).toEqual([30, 30, 30]);
    expect(
      올바른_날짜로_조회.map((e) => e.toResponse()).map((e) => e.currentCount),
    ).toEqual([0, 0, 0]);
  });

  it('특강 신청 히스토리를 조회한다.', async () => {
    const userRepository = dataSource.getRepository(UserEntity);
    const courseRepository = dataSource.getRepository(CourseEntity);
    const courseRegistrationRepository = dataSource.getRepository(
      CourseRegistrationEntity,
    );

    const COACH_02 = await userRepository.save({
      name: 'COACH_02',
      type: 'COACH',
    });
    const COURSE_02 = await courseRepository.save({
      userId: COACH_02.id,
      title: 'TEST_COURSE_TITLE_02',
      description: 'TEST_COURSE_DESCRIPTION_02',
      courseTime: '2024-12-25',
    });
    await courseRegistrationRepository.save([
      ...Array.from({ length: 30 }, () => {
        const courseRegistration = new CourseRegistrationEntity();
        courseRegistration.courseId = COURSE_02.id;

        return courseRegistration;
      }),
    ]);

    const userId = 유저_배열_40명.map((e) => e.id)[0];

    const COURSE_01_ID = 특강.id;
    const COURSE_02_ID = COURSE_02.id;

    await Promise.all([
      dataSource.transaction(async (entityManager) => {
        await courseService.register({
          userId,
          courseId: COURSE_01_ID,
          entityManager,
        });
      }),
      dataSource.transaction(async (entityManager) => {
        await courseService.register({
          userId,
          courseId: COURSE_02_ID,
          entityManager,
        });
      }),
    ]);

    const history = await courseService.findHistory({ userId });

    expect(history.length).toEqual(2);
    expect(
      history
        .map((e) => e.toHistory())
        .map((e) => e.courseId)
        .sort(),
    ).toEqual([COURSE_01_ID, COURSE_02_ID]);
    expect(
      history
        .map((e) => e.toHistory())
        .map((e) => e.description)
        .sort(),
    ).toEqual(['TEST_COURSE_DESCRIPTION', 'TEST_COURSE_DESCRIPTION_02']);
    expect(
      history
        .map((e) => e.toHistory())
        .map((e) => e.instructorName)
        .sort(),
    ).toEqual(['COACH_01', 'COACH_02']);
  });
});
