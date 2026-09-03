import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { Credit, CreditsResponse } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private http = inject(HttpClient);
  private apiUrl = environment.creditsUrl;

  getCredits(
    token: string,
    page: number = 0,
    size: number = 20,
    daysPastDue: number = 1
  ): Observable<CreditsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('daysPastDue', daysPastDue.toString());

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const mockCreditsResponse: CreditsResponse = {
      content: [
        {
          "creditCode" : "066210047498",
          "advisorCode" : "esilva",
          "officeName" : "MATRIZ CHIMBO",
          "fullName" : "GUILLIN VARGAS MERCY MARIA",
          "dueDate" : "2037-07-29",
          "telephone" : "0993265309",
          "cellphone" : "032988655",
          "daysPastDue" : 1,
          "guarantor1FullName" : "PEREZ TRUJILLO MANUEL MESIAS",
          "guarantor1Cellphone" : "0986066607",
          "guarantor1Telephone" : null,
          "guarantor2FullName" : "TORO CHAVEZ XAVIER ROLANDO",
          "guarantor2Cellphone" : "0994914709",
          "guarantor2Telephone" : "032550576"
        },
        {
          "creditCode" : "066210050262",
          "advisorCode" : "mtenesaca",
          "officeName" : "AGENCIA QUITO NORTE",
          "fullName" : "CAGUANA RODRIGUEZ ANGEL MOISES",
          "dueDate" : "2027-03-29",
          "telephone" : "0979429449",
          "cellphone" : null,
          "daysPastDue" : 1,
          "guarantor1FullName" : "CAGUANA CAGUANA SEGUNDO MOISES",
          "guarantor1Cellphone" : "0991191118",
          "guarantor1Telephone" : null,
          "guarantor2FullName" : null,
          "guarantor2Cellphone" : null,
          "guarantor2Telephone" : null
        },
        {
          "creditCode" : "066220002479",
          "advisorCode" : "gchamorro",
          "officeName" : "AGENCIA GUARANDA",
          "fullName" : "ROBAYO BORJA CRISTIAN DANILO",
          "dueDate" : "2028-10-29",
          "telephone" : "0968751541",
          "cellphone" : null,
          "daysPastDue" : 1,
          "guarantor1FullName" : null,
          "guarantor1Cellphone" : null,
          "guarantor1Telephone" : null,
          "guarantor2FullName" : null,
          "guarantor2Cellphone" : null,
          "guarantor2Telephone" : null
        },
        {
          "creditCode" : "066410068490",
          "advisorCode" : "jsolis",
          "officeName" : "AGENCIA MONTALVO",
          "fullName" : "DUCHE ZURITA ROSA ELENA",
          "dueDate" : "2027-02-28",
          "telephone" : "0968502908",
          "cellphone" : null,
          "daysPastDue" : 1,
          "guarantor1FullName" : "DUCHE ZURITA EDGAR ALFREDO",
          "guarantor1Cellphone" : "0990791048",
          "guarantor1Telephone" : "052953800",
          "guarantor2FullName" : null,
          "guarantor2Cellphone" : null,
          "guarantor2Telephone" : null
        },
        {
          "creditCode" : "066410069074",
          "advisorCode" : "sbayas",
          "officeName" : "MATRIZ CHIMBO",
          "fullName" : "GAIBOR VARGAS ADAN RODRIGO",
          "dueDate" : "2029-03-29",
          "telephone" : "0989592477",
          "cellphone" : "052718033",
          "daysPastDue" : 1,
          "guarantor1FullName" : "SANTANA GAIBOR FANNY AIDE",
          "guarantor1Cellphone" : "0981491679",
          "guarantor1Telephone" : "032988573",
          "guarantor2FullName" : null,
          "guarantor2Cellphone" : null,
          "guarantor2Telephone" : null
        }
      ].slice(page * size, (page + 1) * size),
      "empty": false,
      "first": true,
      "last": false,
      "number": 0,
      "numberOfElements": 5,
      "pageable": {
        "offset": 0,
        "pageNumber": 1,
        "pageSize": 2,
        "paged": true,
        "sort": {
          "empty": false,
          "sorted": false,
          "unsorted": true
        },
        "unpaged": false
      },
      "size": 2,
      "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
      },
      "totalElements": 5,
      "totalPages": 2
    };

    return of(mockCreditsResponse);

    return this.http.get<CreditsResponse>(this.apiUrl, { params, headers });
  }
}
