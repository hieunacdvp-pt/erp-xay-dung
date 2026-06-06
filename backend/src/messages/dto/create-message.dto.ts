export class CreateMessageDto {
  senderId: number;
  receiverId?: number;
  receiverRole?: string;
  title: string;
  content: string;
  attachmentUrl?: string;
  type?: string; // MESSAGE, TASK, SYSTEM_ALERT
}
