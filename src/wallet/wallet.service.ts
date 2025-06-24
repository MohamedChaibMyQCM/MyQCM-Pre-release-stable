import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "./entities/wallet.entity";
import { BalanceOperationType } from "./dto/wallet.type";
import { AddBalanceDto, SubtractBalance } from "./dto/add-balance.dto";

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async initWallet(freelancer: Freelancer, transactionManager?: EntityManager) {
    const wallet = this.walletRepository.create({
      freelancer,
    });
    return transactionManager
      ? await transactionManager.save(wallet)
      : await this.walletRepository.save(wallet);
  }

  async setWalletBalance(freelancer: string, balance: number) {
    const wallet = await this.findOne(freelancer);
    wallet.balance = balance;
    return await this.walletRepository.save(wallet);
  }

  async addBalance(
    addBalanceDto: AddBalanceDto,
    transactionManager: EntityManager,
  ) {
    const { freelancer, amount } = addBalanceDto;

    // Fetch wallet and lock row to prevent concurrent updates
    const wallet = await transactionManager.findOne(Wallet, {
      where: { freelancer: { id: freelancer } },
      lock: { mode: "pessimistic_write" },
    });

    if (!wallet) throw new NotFoundException("Wallet not found");

    wallet.balance = this.calculateWalletNewBalance(
      wallet.balance,
      amount,
      BalanceOperationType.add,
    );

    return transactionManager.save(wallet);
  }

  async subtractBalance(
    subtractBalanceDto: SubtractBalance,
    transactionManager?: EntityManager,
  ) {
    const { freelancer, amount } = subtractBalanceDto;
    const wallet = await this.findOne(freelancer);
    const new_balance = this.calculateWalletNewBalance(
      wallet.balance,
      amount,
      BalanceOperationType.subtract,
    );
    wallet.balance = new_balance;
    return transactionManager
      ? await transactionManager.save(wallet)
      : await this.walletRepository.save(wallet);
  }

  calculateWalletNewBalance(
    balance: number,
    amount: number,
    operation: BalanceOperationType,
  ) {
    const parsed_current_balance = Number(balance);
    const parsed_amount_to_add = Number(amount);

    if (isNaN(parsed_current_balance) || isNaN(parsed_amount_to_add)) {
      throw new InternalServerErrorException("Invalid number format");
    }
    let new_balance: number;
    if (balance < amount && operation === BalanceOperationType.subtract)
      throw new ConflictException("Not enough balance for this operation");
    switch (operation) {
      case BalanceOperationType.add:
        new_balance = parsed_current_balance + parsed_amount_to_add;
        break;
      case BalanceOperationType.subtract:
        new_balance = parsed_current_balance - parsed_amount_to_add;
        break;
      default:
        throw new InternalServerErrorException("Invalid operation");
    }
    return parseFloat(new_balance.toFixed(2));
  }

  async findOne(freelancerId: string) {
    const wallet = await this.walletRepository.findOne({
      where: {
        freelancer: {
          id: freelancerId,
        },
      },
    });
    if (!wallet) throw new InternalServerErrorException("Wallet not Found");
    return wallet;
  }
}
