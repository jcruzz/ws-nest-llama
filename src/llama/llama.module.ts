import { Module } from '@nestjs/common';
import { LlamaService } from './llama.service';
import { LlamaController } from './llama.controller';
import { LlamaGateway } from './llama.gateway';

@Module({
  providers: [LlamaService, LlamaGateway],
  controllers: [LlamaController],
})
export class LlamaModule {}
