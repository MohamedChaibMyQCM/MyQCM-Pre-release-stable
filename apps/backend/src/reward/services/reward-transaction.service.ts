import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { RewardTransaction } from "../entities/reward-transaction.entity";

@Injectable()
export class RewardTransactionService {
  constructor(
    @InjectRepository(RewardTransaction)
    private readonly transactionRepository: Repository<RewardTransaction>,
  ) {}

  async findUserTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string[];
    },
  ) {
    const where: FindOptionsWhere<RewardTransaction> = {
      user: { id: userId },
    };

    const whereClause = { ...where } as FindOptionsWhere<RewardTransaction>;

    if (options?.status?.length) {
      whereClause.status = In(options.status);
    }

    return this.transactionRepository.find({
      where: whereClause,
      take: options?.limit ?? 25,
      skip: options?.offset ?? 0,
      order: { createdAt: "DESC" },
      relations: ["perk", "auction"],
    });
  }
}
