import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LlamaService } from './llama.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:3001' } })
export class LlamaGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly llamaService: LlamaService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { message: string; idSession: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { message } = data;

    try {
      const stream = await this.llamaService.generateTextStream(
        message,
        data.idSession,
      );
      stream.on('data', (chunk) => {
        try {
          const data = JSON.parse(chunk.toString('utf-8'));
          if (data.response) {
            client.emit('receiveMessage', { message: data.response });
          }
        } catch (error) {
          console.error('Error al procesar chunk:', error);
        }
      });
      stream.on('end', () => {
        client.emit('completeMessage'); // Emitir señal de finalización
      });

      stream.on('error', (error) => {
        console.error('Error en el stream:', error);
        client.emit('errorMessage', { error: 'Error en el servidor' });
      });
    } catch (error) {
      console.error('Error procesando el mensaje:', error);
      client.emit('errorMessage', { error: 'Error procesando el mensaje' });
    }
  }
}
