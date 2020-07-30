export class SwadeSocketHandler {
  SWADE = 'system.swade';

  constructor() {
    //register socket listeners
    this.registerSocketListeners();
  }

  /**
   * registers all the socket listeners
   */
  registerSocketListeners(): void {
    game.socket.on(this.SWADE, (data) => {
      switch (data.type) {
        case 'deleteConvictionMessage':
          this._onDeleteConvictionMessage(data);
          break;
        case 'newRound':
          this._onNewRound();
          break;
        default:
          this._onUnknownSocket();
          break;
      }
    });
  }

  deleteConvictionMessage(messageId: string) {
    game.socket.emit(this.SWADE, {
      type: 'deleteConvictionMessage',
      messageId,
      userId: game.userId,
    });
  }

  private _onDeleteConvictionMessage(data: any) {
    const message = game.messages.get(data.messageId) as ChatMessage;
    //only delete the message if the user is a GM and the event emitter is one of the recipients
    if (game.user.isGM && message.data['whisper'].includes(data.userId)) {
      message.delete();
    }
  }

  newRound() {
    game.socket.emit(this.SWADE, {
      type: 'newRound',
    });
  }

  private _onNewRound() {}

  private _onUnknownSocket() {
    console.warn(new Error('This socket event is not supported'));
  }
}
