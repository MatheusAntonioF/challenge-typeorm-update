import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column()
  value: number;

  @OneToOne(() => Category, category => category.id)
  @JoinColumn({ name: 'category_id' })
  category_id: string;

  created_at: Date;

  updated_at: Date;
}

export default Transaction;
