import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FossilDaycareComponent } from './fossil-daycare.component';

describe('FossilDaycareComponent', () => {
  let component: FossilDaycareComponent;
  let fixture: ComponentFixture<FossilDaycareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FossilDaycareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FossilDaycareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
