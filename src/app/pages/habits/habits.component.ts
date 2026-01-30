import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HabitService, Habit } from '../../services/habit';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.css',
})
export class HabitsComponent implements OnInit {
  habits: Habit[] = [];
  habitForm: FormGroup;
  editingId: string | number | null = null;
  showForm = false;
  completedToday = 0;
  totalHabits = 0;
  averageStreak = 0;

  constructor(
    private habitService: HabitService,
    private fb: FormBuilder,
    private viewportScroller: ViewportScroller
  ) {
    this.habitForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      frequency: ['daily', Validators.required],
      color: ['#667eea']
    });
  }

  ngOnInit(): void {
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
      this.updateStats();
    });
  }

  addHabit(): void {
    if (this.habitForm.invalid) return;

    const formValue = this.habitForm.value;
    this.habitService.addHabit({
      name: formValue.name,
      description: formValue.description,
      frequency: formValue.frequency,
      color: formValue.color
    }).subscribe();

    this.habitForm.reset({ frequency: 'daily', color: '#667eea' });
    this.showForm = false;
  }

  updateHabit(): void {
    if (!this.editingId || this.habitForm.invalid) return;

    const formValue = this.habitForm.value;
    this.habitService.updateHabit(this.editingId, {
      name: formValue.name,
      description: formValue.description,
      frequency: formValue.frequency,
      color: formValue.color
    }).subscribe();

    this.resetForm();
  }

  deleteHabit(id: string | number): void {
    if (confirm('Are you sure you want to delete this habit?')) {
      this.habitService.deleteHabit(id).subscribe();
    }
  }

  completeHabit(id: string | number): void {
    // Prevent double-clicks by checking if already completed today
    const habit = this.habits.find(h => h.id === id);
    if (habit && this.isCompletedToday(habit)) {
      return;
    }
    this.habitService.completeHabit(id).subscribe();
  }

  editHabit(habit: Habit): void {
    this.editingId = habit.id || null;
    this.habitForm.patchValue({
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      color: habit.color
    });
    this.showForm = true;
    // Scroll to top so the edit form is visible
    setTimeout(() => {
      const mainContainer = document.querySelector('.app-main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  resetForm(): void {
    this.habitForm.reset({ frequency: 'daily', color: '#667eea' });
    this.editingId = null;
    this.showForm = false;
  }

  isCompletedToday(habit: Habit): boolean {
    if (!habit.lastCompletedDate) return false;
    const today = new Date();
    const lastCompleted = new Date(habit.lastCompletedDate);
    return (
      today.getFullYear() === lastCompleted.getFullYear() &&
      today.getMonth() === lastCompleted.getMonth() &&
      today.getDate() === lastCompleted.getDate()
    );
  }

  private updateStats(): void {
    this.habitService.getTotalHabits().subscribe(total => {
      this.totalHabits = total;
    });

    this.habitService.getCompletedTodayCount().subscribe(completed => {
      this.completedToday = completed;
    });

    this.habitService.getAverageStreak().subscribe(avg => {
      this.averageStreak = avg;
    });
  }

  getStreakColor(streak: number): string {
    if (streak === 0) return '#f44336';
    if (streak < 7) return '#ff9800';
    if (streak < 30) return '#2196f3';
    return '#4caf50';
  }
}
