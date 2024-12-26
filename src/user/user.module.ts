import { Module } from '@nestjs/common';
import { UserService } from './service';
import { UserController } from './controller';
import { UserRepository } from './repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, UserRepository],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
