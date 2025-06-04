import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SalaryBreakdownDialogComponent } from '../salary-breakdown-dialog/salary-breakdown-dialog.component';

@Component({
  selector: 'app-fossil-daycare',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './fossil-daycare.component.html',
  styleUrl: './fossil-daycare.component.scss',
})
export class FossilDaycareComponent {
  isLoading = true;
  employeeForm!: FormGroup;

  totalCtc = 0;
  employeeBasicSalary = 0;
  employeeLevelFlexi = 0;
  employeeHRA = 0;
  employeeStatutoryBonus = 0;
  employeeLunchAllowance = 0;
  employeeEducationAllowance = 0;
  employeeLta = 0;
  employeeInternet = 0;
  employeeVehical = 0;
  monthlyTotalExceptPfGratuity = 0;
  annualTotalExceptPfGratuity = 0;
  employeePf = 0;
  employeeGratuity = 0;
  employeeFestiveAllowance = 0;
  employeeAnnualSubTotal = 0;
  salesIncentive = 0;

  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder, private dialog: MatDialog) {
    this.spinner.show();
  }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      qualification: ['', Validators.required],
      designation: ['', Validators.required],
      grade: ['', Validators.required],
      location: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
      ctc: ['', [Validators.required, Validators.min(1)]],
    });
    this.spinner.hide();
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;

      this.employeeAnnualSubTotal = formData.ctc / 1.12;
      this.salesIncentive = this.employeeAnnualSubTotal * 0.12;
      this.totalCtc = this.employeeAnnualSubTotal + this.salesIncentive;
      this.employeeBasicSalary = (formData.ctc * 0.4) / 12;
      this.employeeHRA = this.employeeBasicSalary * 0.5;
      this.employeeStatutoryBonus = 21000 * 0.2;
      this.employeeLunchAllowance = 2200;
      this.employeeEducationAllowance = 800;
      this.employeeLta = (this.employeeBasicSalary / 12);
      this.employeeInternet = 1500;
      this.employeeVehical = 3600;
      this.employeePf = (this.employeeBasicSalary * 0.12) * 12;
      this.employeeGratuity = this.employeeBasicSalary * 15 / 26;
      this.employeeFestiveAllowance = 4500;
      this.annualTotalExceptPfGratuity = this.employeeAnnualSubTotal - (this.employeePf + this.employeeGratuity + this.employeeFestiveAllowance);
      this.monthlyTotalExceptPfGratuity = this.annualTotalExceptPfGratuity / 12;
      this.employeeLevelFlexi = this.monthlyTotalExceptPfGratuity - (this.employeeBasicSalary + this.employeeHRA + this.employeeStatutoryBonus + this.employeeLunchAllowance + this.employeeEducationAllowance + this.employeeLta + this.employeeInternet + this.employeeVehical);

      this.dialog.open(SalaryBreakdownDialogComponent, {
        width: '800px',
        height: '90vh',
        data: {
          name: formData.name,
          qualification: formData.qualification,
          designation: formData.designation,
          grade: formData.grade,
          location: formData.location,
          experience: formData.experience,
          basic: Math.round(this.employeeBasicSalary),
          flexi: Math.round(this.employeeLevelFlexi),
          hra: Math.round(this.employeeHRA),
          bonus: Math.round(this.employeeStatutoryBonus),
          lunch: Math.round(this.employeeLunchAllowance),
          education: Math.round(this.employeeEducationAllowance),
          lta: Math.round(this.employeeLta),
          internet: Math.round(this.employeeInternet),
          vehicle: Math.round(this.employeeVehical),
          monthlyTotal: Math.round(this.monthlyTotalExceptPfGratuity),
          annualTotal: Math.round(this.annualTotalExceptPfGratuity),
          pf: Math.round(this.employeePf),
          gratuity: Math.round(this.employeeGratuity),
          festive: Math.round(this.employeeFestiveAllowance),
          subTotal: Math.round(this.employeeAnnualSubTotal),
          incentive: Math.round(this.salesIncentive),
          totalCtc: Math.round(this.totalCtc)
        }
      });
    }
  }
}
