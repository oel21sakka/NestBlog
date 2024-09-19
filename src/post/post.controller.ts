import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, Patch, Delete, Put, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(req.user.userId, createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPosts(@Request() req, @Query('feed') feed: string) {
    if (feed) {
      return this.postService.getFeed(req.user.userId);
    }
    return this.postService.getAllPosts();
  }

  @Get(':id')
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.updatePost(req.user.userId, id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.postService.deletePost(req.user.userId, id);
    return { message: 'Post deleted successfully' };
  }
}
