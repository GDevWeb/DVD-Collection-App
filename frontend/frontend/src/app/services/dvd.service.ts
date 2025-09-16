import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class DvdService {
  private backendURL = environment.backendUrl; // This line is causing the error

  constructor(private http: HttpClient) {}

  getAllDVDs(): Observable<any[]> {
    const dvds = this.http.get<any[]>(`${this.backendURL}/api/dvds`);
    console.log(dvds);

    return this.http.get<any[]>(`${this.backendURL}/api/dvds`);
  }
}
