import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TaskService } from '../../services/task';
import { HabitService } from '../../services/habit';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  totalTasks = 0;
  completedTasks = 0;
  taskProgress = 0;

  totalHabits = 0;
  completedHabitsToday = 0;
  habitsProgress = 0;

  constructor(
    private taskService: TaskService,
    private habitService: HabitService
  ) {}

  ngOnInit(): void {
    this.taskService.getTotalTasksCount().subscribe(total => {
      this.totalTasks = total;
      this.updateTaskProgress();
    });

    this.taskService.getCompletedTasksCount().subscribe(completed => {
      this.completedTasks = completed;
      this.updateTaskProgress();
    });

    this.habitService.getTotalHabits().subscribe(total => {
      this.totalHabits = total;
      this.updateHabitsProgress();
    });

    this.habitService.getCompletedTodayCount().subscribe(completed => {
      this.completedHabitsToday = completed;
      this.updateHabitsProgress();
    });
  }

  private updateTaskProgress(): void {
    this.taskProgress = this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 100 : 0;
  }

  private updateHabitsProgress(): void {
    this.habitsProgress = this.totalHabits > 0 ? (this.completedHabitsToday / this.totalHabits) * 100 : 0;
  }
}
