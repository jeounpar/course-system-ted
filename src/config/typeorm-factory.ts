import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DatabaseConfig } from './config.database';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CourseEntity, CourseRegistrationEntity, UserEntity } from '../entity';

export async function dataSourceFactory(
  options: DataSourceOptions,
): Promise<DataSource> {
  const initialized = await new DataSource(options).initialize();
  await inspectConnection(initialized);
  return addTransactionalDataSource(initialized);
}

async function inspectConnection(datasource: DataSource) {
  await datasource.query('SELECT 1');
}

function getAllEntities() {
  return [CourseEntity, CourseRegistrationEntity, UserEntity];
}

export function dataSourceOptionsFactory(
  config: DatabaseConfig,
): DataSourceOptions {
  const { host, port, user, password, database, poolSize } = config;
  return {
    type: 'mysql',
    timezone: '+00:00',
    entityPrefix: 'hhplus_',
    extra: {
      decimalNumbers: true,
    },
    host,
    port,
    username: user,
    password,
    database,
    poolSize,
    entities: getAllEntities(),
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    logging: false,
  };
}
