import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatService } from '../../supabase/chat.service';
import { IChat } from '../../interface/chat-response';
import { DatePipe } from '@angular/common';
import { DeleteModalComponent } from '../../layout/delete-modal/delete-modal.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DeleteModalComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  private auth = inject(AuthService);
  private chat_service = inject(ChatService);

  private router = inject(Router);
  private fd = inject(FormBuilder);
  chatForm!: FormGroup;
  chats = signal<IChat[]>([]);

  constructor() {
    this.chatForm = this.fd.group({
      chat_message: ['', Validators.required],
    });

    effect(() => {
      this.onListChat();
    });
  }

  async logout() {
    this.auth
      .signOut()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  onSubmit() {
    const formValue = this.chatForm.value.chat_message;
    this.chat_service
      .chatMessage(formValue)
      .then((res) => {
        console.log(res);
        this.chatForm.reset();
        this.onListChat();
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  onListChat() {
    // console.log('chats', this.chats);

    this.chat_service
      .listChat()
      .then((res: IChat[] | null) => {
        console.log('res', res);

        if (res != null) {
          this.chats.set(res);
        } else {
          console.log('No message found');
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  openDropDown(msg: IChat) {
    console.log(msg);
    this.chat_service.selectedChats(msg);
  }
}
