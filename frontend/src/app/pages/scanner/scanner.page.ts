import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
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
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class ScannerPage implements OnInit {
  isScanning = false;
  scanResult: string = '';
  showScanResult = false;

  constructor(private dvdService: DvdService, private router: Router) {}

  ngOnInit() {
    this.checkPermissions();
  }

  ionViewWillEnter() {
    this.startScan();
  }

  ionViewWillLeave() {
    this.stopScan();
  }

  async checkPermissions() {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') {
      this.startScan();
    } else {
      const { camera: newPermission } =
        await BarcodeScanner.requestPermissions();
      if (newPermission === 'granted') {
        this.startScan();
      } else {
        console.error('Camera permission denied');
      }
    }
  }

  async startScan() {
    try {
      this.isScanning = true;
      document.querySelector('body')?.classList.add('scanner-active');
      await BarcodeScanner.removeAllListeners();

      await BarcodeScanner.addListener('barcodesScanned', async (result) => {
        if (result.barcodes && result.barcodes.length > 0) {
          this.scanResult = result.barcodes[0].displayValue;
          this.stopScan();
          await this.handleScanResult(this.scanResult);
        }
      });
      await BarcodeScanner.startScan();
    } catch (err) {
      console.error('Scanning error:', err);
      this.stopScan();
    }
  }

  async stopScan() {
    try {
      this.isScanning = false;
      document.querySelector('body')?.classList.remove('scanner-active');
      await BarcodeScanner.stopScan();
      await BarcodeScanner.removeAllListeners();
    } catch (err) {
      console.error('Error stopping scan:', err);
    }
  }

  async handleScanResult(eanCode: string) {
    try {
      const results = await firstValueFrom(this.dvdService.scanDvD(eanCode));

      if (results && results.length > 0) {
        this.router.navigateByUrl('/pages/search-results', {
          state: { results, eanCode },
        });
      } else {
        this.router.navigateByUrl('/pages/manual-entry', {
          state: {
            eanCode,
            message: 'No movie found. Please enter details manually.',
          },
        });
      }
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
    await this.stopScan();
  }
}
