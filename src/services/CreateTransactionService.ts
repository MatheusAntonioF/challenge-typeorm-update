import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);

    const categoryRepository = getRepository(Category);

    const allTransactions = await transactionRepository.find();

    if (type === 'outcome' && allTransactions.length > 0) {
      const balancePositive = allTransactions.reduce((total, transac) => {
        if (transac.type === 'income') return total + transac.value;
        return total;
      }, 0);

      if (balancePositive - value < 0)
        throw new AppError('Your incomes its smaller then outcome', 400);
    }

    let categoryExists;

    categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryExists);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
