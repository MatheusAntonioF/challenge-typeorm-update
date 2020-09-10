import fs from 'fs';
import csvParse from 'csv-parse';

import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  file: string;
}

class ImportTransactionsService {
  async execute({ file }: RequestDTO): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const readCSVStream = fs.createReadStream(file);

    const parseStream = csvParse({ fromLine: 2, ltrim: true, rtrim: true });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: Transaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      transactions.push({
        title,
        type,
        value,
        category,
      } as Transaction);

      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoriesExists = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const categoriesTitles = categoriesExists.map(category => category.title);

    const categoriesNonExists = Array.from(
      new Set(
        categories.filter(category => {
          if (categoriesTitles.includes(category)) return null;
          return category;
        }),
      ),
    );
    const newCategories = categoryRepository.create(
      categoriesNonExists.map(category => {
        return {
          title: category,
        };
      }),
    );

    const totalCategories = [...categoriesExists, ...newCategories];

    await categoryRepository.save(newCategories);

    const createdTransactions = transactionRepository.create(
      transactions.map((transaction: Transaction) => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: totalCategories.find(
          category => category.title === String(transaction.category),
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(file);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
