import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, closeCircleOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { DvdService } from 'src/app/services/dvd.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.page.html',
  styleUrls: ['./search-results.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonButton,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonAlert,
  ],
})
export class SearchResultsPage implements OnInit {
  results: any[] = [];
  eanCode: string = '';
  isAdding: boolean = false;
  alertButtons = ['OK'];
  showAlert = false;
  alertMessage = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dvdService: DvdService
  ) {
    addIcons({ checkmarkDoneOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(() => {
      const state = this.router.currentNavigation()?.extras.state;
      if (state) {
        this.results = state['results'];
        this.eanCode = state['eanCode'];
      } else {
        this.router.navigate(['/pages/dvd-list']);
      }
    });
  }

  async addDVD(result: any) {
    this.isAdding = true;
    try {
      await firstValueFrom(
        this.dvdService.addDVDFromTMDB(result.tmdbId, this.eanCode)
      );
      this.alertMessage = 'DVD added successfully!';
      this.showAlert = true;
    } catch (error: any) {
      this.alertMessage = error.error.message || 'Error adding DVD.';
      this.showAlert = true;
      console.error('Error adding DVD:', error);
    } finally {
      this.isAdding = false;
    }
  }

  async onAlertDismiss() {
    if (this.alertMessage === 'DVD added successfully!') {
      this.router.navigate(['/pages/dvd-list'], { replaceUrl: true });
    }
    this.showAlert = false;
  }

  onBack() {
    this.router.navigate(['/pages/dvd-list']);
  }
}
