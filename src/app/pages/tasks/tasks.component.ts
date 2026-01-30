import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService, Task } from '../../services/task';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskForm: FormGroup;
  editingId: string | number | null = null;
  searchQuery = '';
  filterStatus = 'all'; // all, completed, pending
  showForm = false;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder,
    private viewportScroller: ViewportScroller
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium'],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.applyFilters();
    });
  }

  addTask(): void {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    const newTask = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
      completed: false
    };

    this.taskService.addTask(newTask).subscribe();
    this.taskForm.reset({ priority: 'medium' });
    this.showForm = false;
  }

  updateTask(): void {
    if (!this.editingId || this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    this.taskService.updateTask(this.editingId, {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined
    }).subscribe();

    this.resetForm();
  }

  deleteTask(id: string | number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe();
    }
  }

  toggleTask(id: string | number): void {
    this.taskService.toggleTask(id).subscribe();
  }

  editTask(task: Task): void {
    this.editingId = task.id || null;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate
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
    this.taskForm.reset({ priority: 'medium' });
    this.editingId = null;
    this.showForm = false;
  }

  search(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  setFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.tasks;

    // Apply search filter
    if (this.searchQuery) {
      this.taskService.searchTasks(this.searchQuery).subscribe(results => {
        this.applyStatusFilter(results);
      });
    } else {
      this.applyStatusFilter(filtered);
    }
  }

  private applyStatusFilter(tasks: Task[]): void {
    let filtered = tasks;
    // Apply status filter
    if (this.filterStatus === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (this.filterStatus === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    }
    this.filteredTasks = filtered;
  }

  getCompletedCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  getTotalCount(): number {
    return this.tasks.length;
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  }
}
