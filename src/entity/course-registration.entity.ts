import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nullable } from '../util';
import { UserEntity } from './user.entity';
import { CourseEntity } from './course.entity';

@Entity('course_registration')
export class CourseRegistrationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
  })
  courseId: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '유저 아이디',
  })
  userId: Nullable<number>;

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

  @ManyToOne(() => UserEntity, (user) => user.registrations, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  user: Nullable<UserEntity>;

  @ManyToOne(() => CourseEntity, (course) => course.courseRegistrations, {
    createForeignKeyConstraints: false,
  })
  course: CourseEntity;
}
