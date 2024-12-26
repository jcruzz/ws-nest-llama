import { Body, Controller, Post } from '@nestjs/common';
import { LlamaService } from './llama.service';

@Controller('llama')
export class LlamaController {
  constructor(private readonly llamaService: LlamaService) {}

  @Post('generate')
  async generateText(
    @Body('prompt') prompt: string,
  ): Promise<{ result: string }> {
    const result = await this.llamaService.generateText(prompt);
    return { result };
  }
}
