import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Package } from '../../../shared/models/package.model';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private apiUrl = 'http://localhost:3000/packages';

  constructor(private http: HttpClient) {}

  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(this.apiUrl);
  }

  getPackage(id: number): Observable<Package> {
    return this.http.get<Package>(`${this.apiUrl}/${id}`);
  }

  addPackage(packageData: Package): Observable<Package> {
    return this.http.post<Package>(this.apiUrl, packageData);
  }

  updatePackage(id: number, packageData: Package): Observable<Package> {
    return this.http.put<Package>(`${this.apiUrl}/${id}`, packageData);
  }

  deletePackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

