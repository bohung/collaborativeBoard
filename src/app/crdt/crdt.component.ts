import { Component, OnInit, ViewChild } from '@angular/core';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { BehaviorSubject } from 'rxjs';

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

  constructor() {

  }

  ngOnInit(): void {
    this.ydoc = new Y.Doc();

    const websocketProvider = new WebsocketProvider(
      'wss://demos.yjs.dev', 'mycena', this.ydoc
    );

    this.awareness = websocketProvider.awareness;

    this.awareness.on('change', (changes: any) => {
      this.clients = Array.from(this.awareness.getStates().entries()).map((value: any) => {
        return {
          clientID: value[0],
          clientName: value[1]
        }
      });
      console.log('awareness', Array.from(this.awareness.getStates().entries()));
    });

    this.awareness.setLocalState('Guest');

    this.ymsg = this.ydoc.getText('msg');

    this.ymsg.observe((event: any) => {
      console.log('yarray was modified', event.changes.delta[0]);
      // console.log(event.target._length);
      // console.log(this.ymsg.toString().length);
      // console.log(event);
      this.messageSubject.next(this.ymsg.toString());
    });

    websocketProvider.on('status', (event: any) => {
      console.log('websocketProvider', event);
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

}
