import { Component, OnInit, ViewChild } from '@angular/core';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { BehaviorSubject } from 'rxjs';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';

@Component({
  selector: 'app-crdt',
  templateUrl: './crdt.component.html',
  styleUrls: ['./crdt.component.css']
})
export class CrdtComponent implements OnInit {
  @ViewChild('clientName') clientName: any;
  ymsg: any;
  ydoc: any;
  messageSubject = new BehaviorSubject<string>('');
  clients = [{
    clientID: 0,
    clientName: ''
  }];
  awareness: any;

  editor: any;
  status: any;
  currentUser: any;
  users: any;

  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!) || { name: this.getRandomName(), color: this.getRandomColor() };
  }

  ngOnInit(): void {
    const ydoc = new Y.Doc();

    const websocketProvider = new WebsocketProvider(
      'wss://demos.yjs.dev', 'mycena', ydoc
    );

    // this.awareness = websocketProvider.awareness;

    // this.awareness.on('change', (changes: any) => {
    //   this.clients = Array.from(this.awareness.getStates().entries()).map((value: any) => {
    //     return {
    //       clientID: value[0],
    //       clientName: value[1]
    //     }
    //   });
    //   console.log('awareness', Array.from(this.awareness.getStates().entries()));
    // });

    // this.awareness.setLocalState('Guest');

    // this.ymsg = ydoc.getText('msg');

    // this.ymsg.observe((event: any) => {
    //   console.log('ymsg was modified', event.changes.delta[0]);
    //   console.log(event.target._length);
    //   console.log(this.ymsg.toString().length);
    //   this.messageSubject.next(this.ymsg.toString());
    // });

    websocketProvider.on('status', (event: any) => {
      this.status = event.status;
      if (this.status === 'connected') {
        this.editor = new Editor({
          element: document.querySelector('.element')!,
          extensions: [
            StarterKit.configure({
              history: false,
            }),
            Highlight,
            TaskList,
            TaskItem,
            Collaboration.configure({
              document: ydoc
            }),
            CollaborationCursor.configure({
              provider: websocketProvider,
              user: this.currentUser,
              onUpdate: users => {
                this.users =  users;
              },
            }),
            CharacterCount.configure({
              limit: 10000,
            })
          ],
        });
      }
    });
  }

  onChangeValue(value: string) {
    const currentStringLength = this.ymsg.toString().length;
    this.ymsg.delete(0, currentStringLength);
    this.ymsg.insert(0, value);
  }

  onChangeName(value: string) {
    this.clientName.nativeElement.value = '';
    this.awareness.setLocalState(value);
  }

  setName() {
    const name = (window.prompt('Name') || '').trim().substring(0, 32)
    if (name) this.updateCurrentUser({ name });
  }

  updateCurrentUser(attributes: any) {
    this.currentUser = { ...this.currentUser, ...attributes }
    this.editor.chain().focus().user(this.currentUser).run();

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  getRandomElement(list: any) {
    return list[Math.floor(Math.random() * list.length)]
  }

  getRandomColor() {
    return this.getRandomElement(['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']);
  }

  getRandomName() {
    return this.getRandomElement([
      'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
    ]);
  }

}
