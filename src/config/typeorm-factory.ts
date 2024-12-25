import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseConfig } from './config.database';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CourseEntity, CourseRegistrationEntity, UserEntity } from '../entity';
import { Nullable } from '../util';

let dataSource: Nullable<DataSource> = null;

export function getDataSource(): DataSource {
  if (!dataSource) throw new Error('dataSource is not initialized');
  return dataSource;
}

export async function dataSourceFactory(
  options: DataSourceOptions,
): Promise<DataSource> {
  dataSource = await new DataSource(options).initialize();
  await inspectConnection(dataSource);

  return dataSource;
}

async function inspectConnection(datasource: DataSource) {
  await datasource.query('SELECT 1');
}

export function getAllEntities() {
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
