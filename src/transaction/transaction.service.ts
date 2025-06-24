import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateCreditTransactionDto,
  CreateWithdrawTransactionDto,
} from "./dto/create-transaction.dto";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { TransactionStatus, TransactionType } from "./dto/transaction.type";
import { WalletService } from "src/wallet/wallet.service";
import { FreelancerService } from "src/freelancer/freelancer.service";
import { UpdateTransactionStatus } from "./dto/update-transaction.dto";

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletService: WalletService,
    private readonly freelancerService: FreelancerService,
  ) {}
  async createCreditTransaction(
    freelancerId: string,
    createCreditTransactionDto: CreateCreditTransactionDto,
    transactionalManager?: EntityManager,
  ) {
    const { amount, mcq } = createCreditTransactionDto;
    const transaction = this.transactionRepository.create({
      amount,
      mcq,
      status: createCreditTransactionDto.status || TransactionStatus.completed,
      type: TransactionType.credit,
      freelancer: { id: freelancerId },
    });

    const savedTransaction = transactionalManager
      ? await transactionalManager.save(transaction)
      : await this.transactionRepository.save(transaction);

    // Update wallet balance within the same transaction
    await this.walletService.addBalance(
      { amount, freelancer: freelancerId },
      transactionalManager,
    );

    return savedTransaction;
  }
  async createWithdrawTransaction(
    freelancer: Freelancer,
    createWithdrawTransactionDto: CreateWithdrawTransactionDto,
  ) {
    if (freelancer.wallet.balance < createWithdrawTransactionDto.amount)
      throw new ConflictException("Insufficient balance");
    await this.transactionRepository.manager.transaction(
      async (transactionalManager) => {
        const transaction = this.transactionRepository.create({
          amount: createWithdrawTransactionDto.amount,
          status: TransactionStatus.pending,
          type: TransactionType.withdrawal,
          freelancer,
        });
        await transactionalManager.save(transaction);
        await this.walletService.subtractBalance(
          {
            amount: createWithdrawTransactionDto.amount,
            freelancer: freelancer.id,
          },
          transactionalManager,
        );
      },
    );
  }
  async findAllPendingWithdrawal(page: number = 1, limit: number = 20) {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: {
          status: TransactionStatus.pending,
          type: TransactionType.withdrawal,
        },
        skip: (page - 1) * limit,
        take: limit,
      },
    );
    return {
      transactions,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
  }
  async findAll(freelancer: Freelancer, page: number = 1, limit: number = 20) {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: {
          freelancer: {
            id: freelancer.id,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return {
      transactions,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async findOne(transactionId: string, freelancer: Freelancer) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
        freelancer: {
          id: freelancer.id,
        },
      },
    });
    if (!transaction) throw new NotFoundException("Transaction not found");
    return transaction;
  }
  async findTransaction(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
      },
    });
    if (!transaction) throw new NotFoundException("Transaction not found");
    return transaction;
  }
  async updateTransactionStatus(
    transactionId: string,
    updateTransactionStatus: UpdateTransactionStatus,
  ) {
    const transaction = await this.findTransaction(transactionId);
    transaction.status = updateTransactionStatus.status;
    await this.transactionRepository.save(transaction);
    return transaction;
  }
}
