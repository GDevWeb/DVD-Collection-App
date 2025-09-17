import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { DvdService } from 'src/app/services/dvd.service';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
    FormsModule,
    IonButtons,
    IonBackButton,
    IonInput,
    IonItem,
  ],
})
export class ScannerPage implements OnInit {
  manualEanCode: string = '';

  constructor(private dvdService: DvdService, private router: Router) {}

  ngOnInit() {}

  async startScan() {
    console.log('Attempting to start scan...');
    try {
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        console.log('Barcode scanned:', barcodes[0].displayValue);
        await this.handleScanResult(barcodes[0].displayValue);
      } else {
        console.log('No barcode found during scan.');
        this.router.navigateByUrl('/pages/manual-entry', {
          state: {
            message: 'No barcode found. Please enter details manually.',
          },
        });
      }
    } catch (e) {
      console.error('Scanning error:', e);
      this.router.navigateByUrl('/pages/manual-entry', {
        state: {
          message: 'An error occurred during scanning.',
        },
      });
    }
  }

  async handleManualEntry() {
    console.log('Attempting manual search for EAN:', this.manualEanCode);
    if (this.manualEanCode) {
      await this.handleScanResult(this.manualEanCode);
    }
  }

  async handleScanResult(eanCode: string) {
    console.log('Handling scan result for EAN:', eanCode);
    try {
      const results = await firstValueFrom(this.dvdService.scanDvD(eanCode));
      this.router.navigateByUrl('/pages/search-results', {
        state: { results, eanCode },
      });
    } catch (error: any) {
      console.error('API Scan Error:', error);
      this.router.navigateByUrl('/pages/manual-entry', {
        state: {
          eanCode,
          message: 'No movie found. Please enter details manually.',
        },
      });
    }
  }

  async cancelScan() {
    this.router.navigateByUrl('/pages/dvd-list', { replaceUrl: true });
  }
}
