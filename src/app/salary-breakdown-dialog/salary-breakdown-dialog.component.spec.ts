import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryBreakdownDialogComponent } from './salary-breakdown-dialog.component';

describe('SalaryBreakdownDialogComponent', () => {
  let component: SalaryBreakdownDialogComponent;
  let fixture: ComponentFixture<SalaryBreakdownDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryBreakdownDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryBreakdownDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
