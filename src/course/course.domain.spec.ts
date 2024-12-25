import { CourseDomain } from './course.domain';
import { CourseEntity } from '../entity';

describe('CourseDomain', () => {
  let course: CourseDomain;

  beforeEach(() => {
    const entity = new CourseEntity();
    entity.id = 1;
    entity.totalCount = 30;
    entity.currentCount = 0;
    entity.courseTime = '2024-12-25';
    entity.createDate = new Date();
    entity.updateDate = new Date();

    course = CourseDomain.fromEntity(entity);
  });

  it('특강을 신청할 때 특강의 현재인원수(currentCount)를 하나 증가시킨다.', () => {
    course.increaseCurrentCount();

    expect(course.currentCount).toEqual(1);
  });
});
