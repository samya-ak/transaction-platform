import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    // 1. Check if user already exists
    const exists = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (exists) {
      throw new BadRequestException('Email already exists');
    }
    // 2. Create user
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }
}
