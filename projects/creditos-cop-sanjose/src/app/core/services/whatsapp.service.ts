import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { WhatsappTemplate, WhatsappRequestFull, WhatsappResponse } from '@models';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private http = inject(HttpClient);
  private apiUrl = environment.whatsappUrl;

  sendNotifications(
    requests: WhatsappRequestFull,
    token: string
  ): Observable<WhatsappResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-api-key': environment.apiKey
    });

    console.log('wsp: ', requests);
    return this.http.post<WhatsappResponse>(this.apiUrl, requests, { headers });
    return of({
      "status": "200",
      "message": "NotificationSubmissionResult[batchId=15, status=PROCESSING]",
      "timestamp": "2026-08-05T12:32:10.5615514",
      "success": true
    });
  }
}
