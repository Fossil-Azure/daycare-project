import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculation-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './calculation-dialog.component.html',
  styleUrl: './calculation-dialog.component.scss'
})
export class CalculationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
