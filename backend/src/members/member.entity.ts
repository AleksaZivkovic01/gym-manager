import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { SessionRegistration } from '../sessions/session-registration.entity';
import { User } from '../user/user.entity';
import { Package } from '../packages/package.entity';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

  @Column({ type: 'enum', enum: ['beginner', 'medium', 'expert'], default: 'beginner' })
  level: 'beginner' | 'medium' | 'expert';

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @ManyToOne(() => Package, { nullable: true })
  @JoinColumn()
  package?: Package;

  @Column({ nullable: true })
  packageId?: number;

  @OneToMany(() => SessionRegistration, (registration) => registration.member)
  sessionRegistrations: SessionRegistration[];

  @OneToOne(() => User, (user) => user.member)
  @JoinColumn() 
  user: User;

}
