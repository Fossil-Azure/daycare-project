import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CalculationDialogComponent } from '../calculation-dialog/calculation-dialog.component';

@Component({
  selector: 'app-salary-breakdown-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './salary-breakdown-dialog.component.html',
  styleUrl: './salary-breakdown-dialog.component.scss'
})
export class SalaryBreakdownDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog) { }

  breakdownRows: any[] = [];

  ngOnInit(): void {
    this.breakdownRows = [
      { label: 'Basic', monthly: this.data.basic, annual: this.data.basic * 12 },
      { label: 'Level Flexi', monthly: this.data.flexi, annual: this.data.flexi * 12 },
      { label: 'House Rent Allowance', monthly: this.data.hra, annual: this.data.hra * 12 },
      { label: 'Statutory Bonus/Exgratia', monthly: Math.round(this.data.bonus / 12), annual: this.data.bonus },
      { label: 'Lunch Allowance', monthly: this.data.lunch, annual: this.data.lunch * 12 },
      { label: 'Education Allowance', monthly: this.data.education, annual: this.data.education * 12 },
      { label: 'Leave Travel Allowance', monthly: this.data.lta, annual: this.data.lta * 12 },
      { label: 'Phone/Internet Allowance', monthly: this.data.internet, annual: this.data.internet * 12 },
      { label: 'Vehicle Maintenance', monthly: this.data.vehicle, annual: this.data.vehicle * 12 }
    ];
  }

  downloadAsXML(): void {
    const xmlParts = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<CTCBreakup>',
      `  <Name>${this.data.name}</Name>`,
      `  <Qualification>${this.data.qualification}</Qualification>`,
      `  <Designation>${this.data.designation}</Designation>`,
      `  <Grade>${this.data.grade}</Grade>`,
      `  <Location>${this.data.location}</Location>`,
      `  <Experience>${this.data.experience}</Experience>`,
      `  <CTC>${this.data.totalCtc}</CTC>`,
      '  <Components>',
      `    <Basic>${this.data.basic}</Basic>`,
      `    <Flexi>${this.data.flexi}</Flexi>`,
      `    <HRA>${this.data.hra}</HRA>`,
      `    <Bonus>${this.data.bonus}</Bonus>`,
      `    <Lunch>${this.data.lunch}</Lunch>`,
      `    <Education>${this.data.education}</Education>`,
      `    <LTA>${this.data.lta}</LTA>`,
      `    <Internet>${this.data.internet}</Internet>`,
      `    <Vehicle>${this.data.vehicle}</Vehicle>`,
      `    <MonthlyTotal>${this.data.monthlyTotal}</MonthlyTotal>`,
      `    <AnnualTotal>${this.data.annualTotal}</AnnualTotal>`,
      `    <PF>${this.data.pf}</PF>`,
      `    <Gratuity>${this.data.gratuity}</Gratuity>`,
      `    <Festive>${this.data.festive}</Festive>`,
      `    <SubTotal>${this.data.subTotal}</SubTotal>`,
      `    <SalesIncentive>${this.data.incentive}</SalesIncentive>`,
      `    <TotalCTC>${this.data.totalCtc}</TotalCTC>`,
      '  </Components>',
      '</CTCBreakup>',
    ];

    const xmlContent = xmlParts.join('\n');
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `CTC_Breakup_${this.data.name?.replace(/\s+/g, '_')}.xml`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  openCalculationDialog(): void {
    this.dialog.open(CalculationDialogComponent, {
      width: '90vw',
      maxWidth: '90vw',
      height: 'auto',
      data: {
        ctc: this.data.totalCtc,
        annualSubTotal: this.data.subTotal,
        salesIncentive: this.data.incentive,
        totalCtc: this.data.totalCtc,
        basicSalary: this.data.basic,
        hra: this.data.hra,
        bonus: this.data.bonus,
        lta: this.data.lta,
        pf: this.data.pf,
        gratuity: this.data.gratuity,
        festive: this.data.festive,
        annualTotalExcl: this.data.annualTotal,
        monthlyTotalExcl: this.data.monthlyTotal,
        levelFlexi: this.data.flexi
      }
    });
  }
}
