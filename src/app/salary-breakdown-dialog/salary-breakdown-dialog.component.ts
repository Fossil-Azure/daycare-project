import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { CalculationDialogComponent } from '../calculation-dialog/calculation-dialog.component';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

@Component({
  selector: 'app-salary-breakdown-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './salary-breakdown-dialog.component.html',
  styleUrl: './salary-breakdown-dialog.component.scss',
})
export class SalaryBreakdownDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  breakdownRows: any[] = [];

  ngOnInit(): void {
    this.breakdownRows = [
      {
        label: 'Basic',
        monthly: this.data.basic,
        annual: this.data.basic * 12,
      },
      {
        label: 'Level Flexi',
        monthly: this.data.flexi,
        annual: this.data.flexi * 12,
      },
      {
        label: 'House Rent Allowance',
        monthly: this.data.hra,
        annual: this.data.hra * 12,
      },
      {
        label: 'Statutory Bonus/Exgratia',
        monthly: Math.round(this.data.bonus / 12),
        annual: this.data.bonus,
      },
      {
        label: 'Lunch Allowance',
        monthly: this.data.lunch,
        annual: this.data.lunch * 12,
      },
      {
        label: 'Education Allowance',
        monthly: this.data.education,
        annual: this.data.education * 12,
      },
      {
        label: 'Leave Travel Allowance',
        monthly: this.data.lta,
        annual: this.data.lta * 12,
      },
      {
        label: 'Phone/Internet Allowance',
        monthly: this.data.internet,
        annual: this.data.internet * 12,
      },
      {
        label: 'Vehicle Maintenance',
        monthly: this.data.vehicle,
        annual: this.data.vehicle * 12,
      },
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
        levelFlexi: this.data.flexi,
      },
    });
  }

  async generatePDF() {
    const doc = new jsPDF();
    const logoBase64 = await this.getBase64ImageFromURL(
      'assets/fossil_logo.png'
    );
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo and Title
    const logoWidth = 50;
    doc.addImage(
      logoBase64,
      'PNG',
      (pageWidth - logoWidth) / 2,
      10,
      logoWidth,
      20
    );
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FOSSIL SALARY STRUCTURE', pageWidth / 2, 40, { align: 'center' });

    // User Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const yStart = 50;
    const infoLines = [
      `Name: ${this.data.name}`,
      `Qualification: ${this.data.qualification}`,
      `Designation: ${this.data.designation}`,
      `Grade: ${this.data.grade}`,
      `Location: ${this.data.location}`,
      `Total Years of Experience: ${this.data.experience}`,
      `CTC: INR ${this.data.totalCtc.toLocaleString()}`,
    ];
    let y = yStart;
    for (const line of infoLines) {
      doc.text(line, 20, y);
      y += 8;
    }

    // Prepare table data
    const tableBody: RowInput[] = [
      ['Basic', this.data.basic],
      ['Level Flexi', this.data.flexi],
      ['House Rent Allowance', this.data.hra],
      ['Statutory Bonus/Exgratia', this.data.bonus],
      ['Lunch Allowance', this.data.lunch],
      ['Education Allowance', this.data.education],
      ['Leave Travel Allowance', this.data.lta],
      ['Phone/Internet Allowance', this.data.internet],
      ['Vehicle Maintenance', this.data.vehicle],
      [
        { content: 'Sub Total', styles: { fontStyle: 'bold' } },
        {
          content: `${this.data.monthlyTotal.toLocaleString()}`,
          styles: { fontStyle: 'bold', halign: 'right' },
        },
        {
          content: `${this.data.annualTotal.toLocaleString()}`,
          styles: { fontStyle: 'bold', halign: 'right' },
        },
      ],
      [`Provident Fund - Company Contribution`, , this.data.pf],
      [`Gratuity`, , this.data.gratuity],
      [`Festival Allowance`, , this.data.festive],
      [
        { content: 'Sub Total CTC', styles: { fontStyle: 'bold' } },
        ,
        {
          content: `${this.data.subTotal.toLocaleString()}`,
          styles: { fontStyle: 'bold', halign: 'right' },
        },
      ],
      [`Sales Incentive @ 100% Achievement`, , this.data.incentive],
      [
        // `Total CTC`, , this.data.totalCtc,
        { content: 'Total CTC', styles: { fontStyle: 'bold', textColor: 255, fillColor: [22, 160, 133] } },
        { content: ``, styles: { fillColor: [22, 160, 133] } },
        {
          content: `${this.data.totalCtc.toLocaleString()}`,
          styles: { fontStyle: 'bold', halign: 'right', textColor: 255, fillColor: [22, 160, 133] },
        },
      ],
    ].map((row: any[]) => [
      row[0],
      typeof row[1] === 'number' ? `${row[1].toLocaleString()}` : row[1],
      typeof row[2] === 'number' ? `${row[2].toLocaleString()}` : row[2],
    ]);

    // Generate table with 3 columns
    const table = autoTable(doc, {
      startY: y + 5,
      head: [['Component', 'Per Month', 'Per Annum']],
      body: tableBody,
      styles: {
        halign: 'left',
        valign: 'middle',
        fontSize: 10,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 50, halign: 'right' },
      },
    });

    doc.setFont('helvetica', 'normal');

    doc.save(`CTC_Breakdown_${this.data.name.replace(/\s/g, '_')}.pdf`);
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (err) => reject(err);
    });
  }
}
