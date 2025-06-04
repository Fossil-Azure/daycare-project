import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationDialogComponent } from './calculation-dialog.component';

describe('CalculationDialogComponent', () => {
  let component: CalculationDialogComponent;
  let fixture: ComponentFixture<CalculationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
