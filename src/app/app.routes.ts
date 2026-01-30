import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { HabitsComponent } from './pages/habits/habits.component';
import { AboutComponent } from './pages/about/about.component';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'habits', component: HabitsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: Login },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
