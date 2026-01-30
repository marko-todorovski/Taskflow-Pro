import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { HomeComponent } from './pages/home/home.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { HabitsComponent } from './pages/habits/habits.component';
import { AboutComponent } from './pages/about/about.component';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HomeComponent,
    TasksComponent,
    HabitsComponent,
    AboutComponent
  ],
  providers: [provideRouter(routes)]
})
export class AppModule { }