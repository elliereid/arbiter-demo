import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { DemoComponent } from './pages/demo/demo';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'demo', component: DemoComponent },
  { path: '**', redirectTo: '' },
];
