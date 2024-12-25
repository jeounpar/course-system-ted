import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class CourseService {
  constructor(private readonly UserService: UserService) {}
}
