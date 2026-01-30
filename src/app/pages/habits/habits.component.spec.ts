import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitsComponent } from './habits.component';

describe('HabitsComponent', () => {
  let component: HabitsComponent;
  let fixture: ComponentFixture<HabitsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
