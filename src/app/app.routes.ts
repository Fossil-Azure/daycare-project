import { Routes } from '@angular/router';
import { FossilDaycareComponent } from './fossil-daycare/fossil-daycare.component';

export const routes: Routes = [
  { path: 'home', component: FossilDaycareComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
