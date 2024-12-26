import { Test, TestingModule } from '@nestjs/testing';
import { LlamaGateway } from './llama.gateway';

describe('LlamaGateway', () => {
  let gateway: LlamaGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlamaGateway],
    }).compile();

    gateway = module.get<LlamaGateway>(LlamaGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
