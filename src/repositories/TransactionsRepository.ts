import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find();

    const income = allTransactions.reduce((total, transaction) => {
      if (transaction.type === 'income') return total + transaction.value;
      return total;
    }, 0);

    const outcome = allTransactions.reduce((total, transaction) => {
      if (transaction.type === 'outcome') return total + transaction.value;
      return total;
    }, 0);

    const totals = allTransactions.reduce((total, transaction) => {
      if (transaction.type === 'income') return total + transaction.value;
      return total - transaction.value;
    }, 0);

    const balance = {
      income,
      outcome,
      total: totals,
    };

    return balance;
  }
}

export default TransactionsRepository;
