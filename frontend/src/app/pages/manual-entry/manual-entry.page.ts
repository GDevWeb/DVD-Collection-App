import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-manual-entry',
  templateUrl: './manual-entry.page.html',
  styleUrls: ['./manual-entry.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ManualEntryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
