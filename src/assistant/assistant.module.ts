import { Module } from "@nestjs/common";
import { AssistantService } from "./assistant.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
