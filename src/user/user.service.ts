import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Post } from '../post/post.entity';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async create(user: any): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findOneByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.userRepository.save({ ...user, password: hashedPassword });
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async followUser(userId: number, followUserId: number): Promise<{}> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['following'] });
    const followUser = await this.userRepository.findOne({ where: { id: followUserId } });

    if (!user || !followUser) {
      throw new NotFoundException('User not found');
    }

    if (user.following.some(followingUser => followingUser.id === followUserId)) {
      throw new ConflictException('You are already following this user');
    }

    user.following.push(followUser);
    await this.userRepository.save(user);
    return { message: 'User followed successfully' };
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['posts'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.posts;
  }

  async getUserDetails(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['following', 'followers', 'posts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userId: number, id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    if (userId !== id) {
      throw new ForbiddenException('You are not authorized to update this user');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.username = updateUserDto.username;
    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;
    return result;
  }

  async deleteUser(userId: number, id: number): Promise<void> {
    if (userId !== id) {
      throw new ForbiddenException('You are not authorized to delete this user');
    }
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }
}
