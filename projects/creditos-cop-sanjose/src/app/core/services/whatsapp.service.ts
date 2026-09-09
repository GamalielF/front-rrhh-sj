import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@lumen/http';
import { environment } from '@environments/environment';
import { WhatsappRequestFull, WhatsappResponse } from '@models';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private api = inject(ApiService);

  sendNotifications(
    requests: WhatsappRequestFull,
  ): Observable<WhatsappResponse> {
    return this.api.post<WhatsappResponse>(environment.whatsappUrl, requests, {
      headers: { 'x-api-key': environment.apiKey }
    });
  }
}
