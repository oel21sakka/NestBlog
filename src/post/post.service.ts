import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../user/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(userId: number, createPostDto: any): Promise<Post[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const post = this.postRepository.create({ ...createPostDto, user });
    return this.postRepository.save(post);
  }

  async getPost(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id }, relations: ['user'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getFeed(userId: number): Promise<Post[]> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }, 
      relations: ['following'] 
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const followingIds = user.following.map(followingUser => followingUser.id);
    
    const posts = await this.postRepository.find({
      where: { user: { id: In(followingIds) } },
      relations: ['user'],
    });

    return posts;
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.find({ relations: ['user'] });
  }

  async updatePost(userId: number, postId: number, updatePostDto: any): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['user'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.user.id !== userId) {
      throw new UnauthorizedException('You are not authorized to update this post');
    }
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['user'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.user.id !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this post');
    }
    await this.postRepository.delete(postId);
  }
}
