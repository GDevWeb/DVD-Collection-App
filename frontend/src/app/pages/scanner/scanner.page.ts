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
  ],
})
export class ScannerPage implements OnInit {
  isScanning = false;
  scanResult: string = '';

  constructor(private dvdService: DvdService, private router: Router) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.startScan();
  }

  ionViewWillLeave() {
    this.stopScan();
  }

  async startScan() {
    try {
      this.isScanning = true;
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        this.scanResult = barcodes[0].displayValue;
        this.stopScan();
        await this.handleScanResult(this.scanResult);
      } else {
        // Handle case where no barcode is found
        this.stopScan();
        this.router.navigateByUrl('/pages/manual-entry', {
          state: {
            message: 'No barcode found. Please enter details manually.',
          },
        });
      }
    } catch (e) {
      console.error('Scanning error:', e);
      this.stopScan();
    }
  }

  async stopScan() {
    this.isScanning = false;
  }

  async handleScanResult(eanCode: string) {
    try {
      const results = await firstValueFrom(this.dvdService.scanDvD(eanCode));
      this.router.navigateByUrl('/pages/search-results', {
        state: { results, eanCode },
      });
    } catch (error: any) {
      this.router.navigateByUrl('/pages/manual-entry', {
        state: {
          eanCode,
          message: 'No movie found. Please enter details manually.',
        },
      });
    }
  }

  async cancelScan() {
    this.stopScan();
    this.router.navigateByUrl('/pages/dvd-list', { replaceUrl: true });
  }
}
