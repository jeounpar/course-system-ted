import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nullable } from '../util';
import { CourseRegistrationEntity } from './course-registration.entity';
import { UserEntity } from './user.entity';

@Entity('course')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: '유저 아이디',
  })
  userId: number;

  @Column({
    type: 'varchar',
    comment: '특강 제목',
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '특강 설명',
  })
  description: Nullable<string>;

  @Column({
    type: 'time',
    comment: '특강 날짜 ex) 2024-12-25',
  })
  courseTime: string;

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

  @ManyToOne(() => UserEntity, (user) => user.courses, {
    createForeignKeyConstraints: false,
  })
  user: UserEntity;

  @OneToMany(
    () => CourseRegistrationEntity,
    (registration) => registration.course,
    {
      createForeignKeyConstraints: false,
    },
  )
  courseRegistrations: CourseRegistrationEntity[];
}
