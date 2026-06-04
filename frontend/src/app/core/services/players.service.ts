import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player, PlayerListResponse } from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  private readonly API_URL = '/api/players';

  constructor(private http: HttpClient) {}

  getPlayers(filters: any): Observable<PlayerListResponse> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    });
    return this.http.get<PlayerListResponse>(this.API_URL, { params });
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.API_URL}/${id}`);
  }

  createPlayer(player: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(this.API_URL, player);
  }

  updatePlayer(id: number, player: Partial<Player>): Observable<Player> {
    return this.http.patch<Player>(`${this.API_URL}/${id}`, player);
  }

  getSkillTimeline(
    id: number,
    skillName: string,
  ): Observable<{ version: number; value: number }[]> {
    return this.http.get<{ version: number; value: number }[]>(
      `${this.API_URL}/${id}/skill/${skillName}/timeline`,
    );
  }

  importCsv(file: File): Observable<{ importedCount: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ importedCount: number }>(
      `${this.API_URL}/import`,
      formData,
    );
  }
}
