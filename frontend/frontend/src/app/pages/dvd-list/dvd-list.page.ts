import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DvdService } from 'src/app/services/dvd.service';
import { DVD } from 'types/dvd.type';

@Component({
  selector: 'app-dvd-list',
  templateUrl: './dvd-list.page.html',
  styleUrls: ['./dvd-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class DvdListPage implements OnInit {
  dvds: DVD[] = [];
  isLoading = false;
  constructor(private dvdService: DvdService) {}

  ngOnInit() {
    this.loadDVDs();
  }

  loadDVDs() {
    this.isLoading = true;
    this.dvdService.getAllDVDs().subscribe(
      (data) => {
        this.dvds = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching DVDs:', error);
        this.isLoading = false;
      }
    );
  }
}
