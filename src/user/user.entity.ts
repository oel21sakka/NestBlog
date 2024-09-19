import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Post } from '../post/post.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  username: string;

  @ManyToMany(() => User, user => user.following)
  @JoinTable()
  followers: User[];

  @ManyToMany(() => User, user => user.followers)
  following: User[];

  @OneToMany(() => Post, post => post.user)
  posts: Post[];
}
