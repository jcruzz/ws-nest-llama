import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlamaModule } from './llama/llama.module';

@Module({
  imports: [LlamaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
