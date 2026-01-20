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

  @Column({ 
    type: 'enum', 
    enum: ['pending_package', 'active', 'expired'],
    nullable: true,
    default: null
  })
  packageStatus?: 'pending_package' | 'active' | 'expired';

  @Column({ type: 'date', nullable: true })
  membershipStartDate?: Date;

  @Column({ type: 'date', nullable: true })
  membershipEndDate?: Date;

  @OneToMany(() => SessionRegistration, (registration) => registration.member)
  sessionRegistrations: SessionRegistration[];

  @OneToOne(() => User, (user) => user.member, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  user: User;




}