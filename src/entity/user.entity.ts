import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nullable } from '../util';
import { CourseRegistrationEntity } from './course-registration.entity';
import { CourseEntity } from './course.entity';

export enum UserTypeEnum {
  MANAGER = 'MANAGER',
  COACH = 'COACH',
  STUDENT = ' STUDENT',
}

export type UserType = keyof typeof UserTypeEnum;

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserTypeEnum,
    nullable: false,
  })
  type: UserType;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '유저 이름',
  })
  name: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createDate: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  updateDate: Nullable<Date>;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  deleteDate: Nullable<Date>;

  @OneToMany(() => CourseEntity, (course) => course.user, {
    createForeignKeyConstraints: false,
  })
  courses: CourseEntity[];

  @OneToMany(
    () => CourseRegistrationEntity,
    (registration) => registration.user,
    {
      createForeignKeyConstraints: false,
    },
  )
  registrations: CourseRegistrationEntity[];
}