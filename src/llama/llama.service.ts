import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ConversationHistory = Message[];

@Injectable()
export class LlamaService {
  private readonly llamaEndPoint = 'http://localhost:11434/api';

  private conversationHistories: Map<string, ConversationHistory> = new Map();

  private getHistory(sessionId: string): ConversationHistory {
    return this.conversationHistories.get(sessionId) || [];
  }

  private saveHistory(sessionId: string, history: ConversationHistory): void {
    this.conversationHistories.set(sessionId, history);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.llamaEndPoint}/generate`,
        {
          model: 'llama3',
          prompt,
        },
        {
          responseType: 'stream',
        },
      );

      const stream = response.data; // Esto ahora será un stream
      let fullResponse = '';

      return new Promise<string>((resolve, reject) => {
        stream.on('data', (chunk) => {
          try {
            const data = JSON.parse(chunk.toString('utf-8'));
            if (data.response) {
              fullResponse += data.response;
            }
          } catch (err) {
            console.error('Error al procesar el chunk:', err);
          }
        });

        stream.on('end', () => {
          console.log('Stream finalizado. Respuesta completa:', fullResponse);
          resolve(fullResponse);
        });

        stream.on('error', (err) => {
          console.error('Error en el stream:', err);
          reject(err);
        });
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateTextStream(prompt: string, sessionId: string): Promise<any> {
    try {
      const history = this.getHistory(sessionId);
      const context =
        history.map((msg) => `${msg.role}: ${msg.content}`).join('\n') +
        `\nuser: ${prompt}`;
      const response = await axios.post(
        `${this.llamaEndPoint}/generate`,
        { model: 'llama3.2', prompt: context },
        { responseType: 'stream' },
      );

      const responseAssistant = response.data;

      history.push({ role: 'user', content: prompt });
      history.push({ role: 'assistant', content: responseAssistant });
      this.saveHistory(sessionId, history);

      return responseAssistant;
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      throw new HttpException(
        error.response?.data || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
