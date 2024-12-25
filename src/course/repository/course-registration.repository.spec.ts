import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CourseRegistrationRepository } from './course-registration.repository';
import { CourseRegistrationDomain } from '../domain/course-registration.domain';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { getAllEntities } from '../../config/typeorm-factory';

describe('CourseRegistrationRepository', () => {
  jest.setTimeout(30000);
  let repository: CourseRegistrationRepository;
  let dataSource: DataSource;
  let container: StartedMySqlContainer;

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
        }),
        TypeOrmModule.forFeature(getAllEntities()),
      ],
      providers: [CourseRegistrationRepository],
    }).compile();

    repository = module.get<CourseRegistrationRepository>(
      CourseRegistrationRepository,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`DELETE FROM \`${entity.tableName}\``);
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('courseRegistration 엔티티를 데이터베이스에 저장 후 조회한다', async () => {
    const courseRegistration = new CourseRegistrationDomain();
    courseRegistration.courseId = 1;

    await repository.save({ domain: [courseRegistration] });

    const withoutLock = await repository.findOneBy().courseId(1);

    expect(withoutLock).not.toBeNull();
    expect(withoutLock.courseId).toEqual(1);
  });

  it('courseRegistration 엔티티를 데이터베이스에 저장 후 lock을 걸어서 조회한다', async () => {
    const domain = new CourseRegistrationDomain();
    domain.courseId = 1;

    await repository.save({ domain: [domain] });

    await dataSource.transaction(async (entityManager) => {
      const saved = await repository
        .findOneBy(entityManager)
        .courseIdWithLock(1);

      expect(saved).not.toBeNull();
      expect(saved.courseId).toEqual(1);
    });
  });
});
