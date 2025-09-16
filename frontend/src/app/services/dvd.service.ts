import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { DVD } from 'types/dvd.type';

@Injectable({
  providedIn: 'root',
})
export class DvdService {
  private backendURL = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getAllDVDs(): Observable<DVD[]> {
    const dvds = this.http.get<any[]>(`${this.backendURL}/api/dvds`);
    console.log(dvds);

    return this.http.get<any[]>(`${this.backendURL}/api/dvds`);
  }

  scanDvD(eanCode: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.backendURL}/api/dvds/scan`, {
      eanCode,
    });
  }
}
