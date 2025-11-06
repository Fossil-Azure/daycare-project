import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Entity,
  ENTITY_DATA,
  FACTORY_RULES,
  FGSI_RULES,
  FIPL_RULES,
} from '../data/salary-rules';

export interface SalaryRule {
  grade: string | number;
  designation: string;
  hraMultiplier: number;
  carMaintenance: number;
  driver: number;
  education: number;
  lunch: number;
  telephoneInternet: number;
  statBonus: number; // monthly
  ltaMultiplier: number; // of Basic (annual)
  festivalPerAnnum: number; // annual
}

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
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './fossil-daycare.component.html',
  styleUrl: './fossil-daycare.component.scss',
})
export class FossilDaycareComponent implements OnInit {
  isLoading = true;
  employeeForm!: FormGroup;

  showResults = false;
  editPercentagesMode = false;
  calculationValid = false;

  breakdownData: {
    name: string;
    qualification: string;
    designation: string;
    entity: string;
    grade: string | number;
    location: string;
    experience: string | number;
    displayRows: Array<{
      label: string;
      monthly: number | null;
      annual: number | null;
      isTotal?: boolean;
    }>;
  } | null = null;

  fgsiSalaryRules: SalaryRule[] = FGSI_RULES;
  fiplSalaryRules: SalaryRule[] = FIPL_RULES;
  factorySalaryRules: SalaryRule[] = FACTORY_RULES;
  entityData = ENTITY_DATA;

  entities: string[] = [];
  designations: string[] = [];
  grades: string[] = [];

  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder) {
    this.spinner.show();
  }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      qualification: ['', Validators.required],
      entity: ['', Validators.required],
      designation: ['', Validators.required],
      grade: ['', Validators.required],
      location: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
      ctc: ['', [Validators.required, Validators.min(1)]],
      bonus: [0, [Validators.required, Validators.min(0), Validators.max(100)]],

      // store as PERCENT (0–100)
      basicPct: [50, [Validators.min(20), Validators.max(100)]], // 50% of CTC
      hraPct: [50, [Validators.min(0), Validators.max(100)]], // % of Basic
    });

    this.entities = Object.keys(this.entityData);
    this.setupFormListeners();
    this.spinner.hide();
  }

  toggleEditPercentages() {
    this.editPercentagesMode = !this.editPercentagesMode;
  }

  private nz(v?: number) {
    return Number.isFinite(v as number) ? (v as number) : 0;
  }

  private fileBase(): string {
    const name =
      this.breakdownData?.name?.toString().trim().replace(/\s+/g, '_') ||
      'Employee';
    const dt = new Date();
    const stamp = `${dt.getFullYear()}-${(dt.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`;
    return `Salary_Breakup_${name}_${stamp}`;
  }

  private async renderCardToCanvas(
    node: HTMLElement
  ): Promise<HTMLCanvasElement> {
    return await html2canvas(node, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
    });
  }

  setupFormListeners() {
    this.employeeForm.get('entity')?.valueChanges.subscribe((entity) => {
      this.employeeForm.get('designation')?.reset('');
      this.employeeForm.get('grade')?.reset('');
      this.grades = [];

      if (entity) {
        const ent = entity as Entity;
        this.designations = Object.keys(ENTITY_DATA[ent]) as string[];
      } else {
        this.designations = [];
      }
    });

    this.employeeForm
      .get('designation')
      ?.valueChanges.subscribe((designation) => {
        const selectedEntity = this.employeeForm.get('entity')?.value;
        const gradeControl = this.employeeForm.get('grade');

        if (selectedEntity && designation) {
          const ent = selectedEntity as Entity;
          const des = designation as keyof (typeof ENTITY_DATA)[typeof ent];

          const gradeList = ENTITY_DATA[ent][des];
          this.grades = gradeList ? [...gradeList] : [];
        } else {
          this.grades = [];
        }

        if (this.grades && this.grades.length === 1) {
          gradeControl?.setValue(this.grades[0]);
        } else {
          gradeControl?.reset('');
        }
      });

    // When grade changes, update default HRA % from rule (only if not in edit mode)
    this.employeeForm.get('grade')?.valueChanges.subscribe(() => {
      if (this.editPercentagesMode) return;
      const { rule } = this.pickRule();
      if (rule) {
        const hraPct = +(this.nz(rule.hraMultiplier) * 100).toFixed(2);
        // Default Basic=50%; HRA based on rule
        this.employeeForm.patchValue(
          { basicPct: 50, hraPct },
          { emitEvent: false }
        );
      }
    });
  }

  /** Pick the selected rule based on form selections */
  private pickRule(): { rules: SalaryRule[] | null; rule: SalaryRule | null } {
    const form = this.employeeForm.getRawValue();
    const RULESETS: Record<string, SalaryRule[]> = {
      FGSI: this.fgsiSalaryRules,
      'Fossil India': this.fiplSalaryRules,
      Factory: this.factorySalaryRules,
    };
    const rules = RULESETS[form.entity] ?? null;
    const rule =
      rules?.find((r) => String(r.grade) === String(form.grade)) ?? null;
    return { rules, rule };
  }

  onSubmit(): void {
    if (!this.employeeForm.valid) return;

    const formData = this.employeeForm.getRawValue();
    const { rule } = this.pickRule();
    if (!rule) {
      console.error('Salary rules not found for selected entity/grade.');
      return;
    }

    // Inputs & sanity
    const inputCTC = Number(formData.ctc);
    if (!Number.isFinite(inputCTC) || inputCTC < 280000) {
      console.error('CTC is below the minimum threshold or invalid.');
      return;
    }
    const bonusPct = Math.min(Math.max(Number(formData.bonus ?? 0), 0), 100);
    const bonusDecimal = bonusPct / 100;

    // ---------- Basic & HRA ----------
    // If edit mode: use user-entered percents; else: Basic=50% of CTC, HRA=rule.hraMultiplier
    let annualBasic = 0;
    let annualHRA = 0;
    {
      if (this.editPercentagesMode) {
        const basicPctDec = (Number(formData.basicPct) || 50) / 100; // percent → decimal
        const hraPctDec = (Number(formData.hraPct) || 50) / 100; // percent → decimal
        annualBasic = inputCTC * basicPctDec;
        annualHRA = annualBasic * hraPctDec;
      } else {
        const hraMultiplier = this.nz(rule.hraMultiplier); // 0.33 / 0.5 / etc.
        annualBasic = inputCTC * 0.5;
        annualHRA = annualBasic * hraMultiplier;

        // Reflect defaults back into the edit inputs as percents
        this.employeeForm.patchValue(
          {
            basicPct: +((annualBasic / inputCTC) * 100).toFixed(2),
            hraPct: +((annualHRA / annualBasic) * 100).toFixed(2),
          },
          { emitEvent: false }
        );
      }
    }

    const monthlyBasic = annualBasic / 12;
    const monthlyHRA = annualHRA / 12;

    // ---------- Rule-driven monthly values ----------
    const carMaintenanceMonthly = this.nz(rule.carMaintenance);
    const driverMonthly = this.nz(rule.driver);
    const educationMonthly = this.nz(rule.education);
    const lunchMonthly = this.nz(rule.lunch);
    const telephoneInternetMonthly = this.nz(rule.telephoneInternet);

    // Annuals
    const statBonusAnnual = this.nz(rule.statBonus) * 12;
    const festivalAnnual = this.nz(rule.festivalPerAnnum);
    const ltaAnnual = annualBasic * this.nz(rule.ltaMultiplier);

    // PF (uncapped; flip to cap if needed)
    const PF_CAP_ENABLED = false;
    const pfBaseMonthly = PF_CAP_ENABLED
      ? Math.min(monthlyBasic, 15000)
      : monthlyBasic;
    const annualPf = pfBaseMonthly * 12 * 0.12;

    // Gratuity (≈ 4.8077% of annual basic)
    const annualGratuity = (monthlyBasic * 15) / 26;

    // ---------- Flexi / sub totals ----------
    const targetFixedCTC = inputCTC / (1 + bonusDecimal);
    const knownAnnual =
      annualBasic +
      annualHRA +
      (carMaintenanceMonthly +
        driverMonthly +
        educationMonthly +
        lunchMonthly +
        telephoneInternetMonthly) *
        12 +
      statBonusAnnual +
      ltaAnnual +
      annualPf +
      annualGratuity +
      festivalAnnual;

    const annualFlexi = Math.max(targetFixedCTC - knownAnnual, 0);
    const monthlyFlexi = annualFlexi / 12;
    const monthlyStatBonus = statBonusAnnual / 12;

    const subTotalMonthly =
      monthlyBasic +
      monthlyFlexi +
      monthlyHRA +
      educationMonthly +
      lunchMonthly +
      carMaintenanceMonthly +
      driverMonthly +
      telephoneInternetMonthly +
      monthlyStatBonus;

    const subTotalAnnual = subTotalMonthly * 12;

    const fixedCTC =
      subTotalAnnual + annualPf + annualGratuity + festivalAnnual + ltaAnnual;
    const performanceBonus = fixedCTC * bonusDecimal;
    const totalCTC = fixedCTC + performanceBonus;

    // ---------- Validity check with tiny tolerance ----------
    const TOL = 1; // rupee tolerance after rounding
    this.calculationValid =
      Math.abs(Math.round(totalCTC) - Math.round(inputCTC)) <= TOL;

    // ---------- Display rows ----------
    const R = (n: number | null) =>
      n == null ? null : Math.round(n + Number.EPSILON);
    const rows = [
      { label: 'Basic', monthly: monthlyBasic, annual: null },
      { label: 'Level Flexi', monthly: monthlyFlexi, annual: null },
      { label: 'Housing Allowance', monthly: monthlyHRA, annual: null },

      {
        label: 'Car Maintenance',
        monthly: carMaintenanceMonthly,
        annual: null,
      },
      { label: 'Driver Allowance', monthly: driverMonthly, annual: null },
      { label: 'Education Allowance', monthly: educationMonthly, annual: null },
      { label: 'Lunch Allowance', monthly: lunchMonthly, annual: null },
      {
        label: 'Telephone/Internet',
        monthly: telephoneInternetMonthly,
        annual: null,
      },
      {
        label: 'Statutory bonus/Exgratia',
        monthly: monthlyStatBonus,
        annual: null,
      },

      {
        label: 'Sub Total',
        monthly: subTotalMonthly,
        annual: subTotalAnnual,
        isTotal: true,
      },

      {
        label: 'Provident Fund - Company Contribution',
        monthly: null,
        annual: annualPf,
      },
      { label: 'Gratuity', monthly: null, annual: annualGratuity },
      { label: 'LTA', monthly: null, annual: ltaAnnual },
      { label: 'Festival Allowance', monthly: null, annual: festivalAnnual },

      {
        label: 'Fixed CTC (Annual Base Pay)',
        monthly: null,
        annual: fixedCTC,
        isTotal: true,
      },
      {
        label: `Bonus-Company Performance (maximum @ ${bonusPct}%)`,
        monthly: null,
        annual: performanceBonus,
      },
      { label: 'Total CTC', monthly: null, annual: totalCTC, isTotal: true },
    ]
      .filter(
        (row) => row.isTotal || (row.monthly ?? 0) > 0 || (row.annual ?? 0) > 0
      )
      .map((row) => ({
        ...row,
        monthly: R(row.monthly as number | null),
        annual: R(row.annual as number | null),
      }));

    this.breakdownData = {
      name: formData.name,
      qualification: formData.qualification,
      designation: formData.designation,
      entity: formData.entity,
      grade: formData.grade,
      location: formData.location,
      experience: formData.experience,
      displayRows: rows,
    };

    this.showResults = true;
  }

  onReset() {
    this.employeeForm.reset({
      bonus: 0,
      basicPct: 50,
      hraPct: 50,
    });
    this.designations = [];
    this.grades = [];
    this.showResults = false;
    this.breakdownData = null;
    this.calculationValid = false;
    this.editPercentagesMode = false;
  }

  async downloadAsJPEG(cardRef: ElementRef | HTMLElement) {
    if (!this.calculationValid) return;
    const node = (cardRef as any).nativeElement ?? cardRef;
    const canvas = await this.renderCardToCanvas(node);
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${this.fileBase()}.jpg`;
    link.click();
  }

  async downloadAsPDF(cardRef: ElementRef | HTMLElement) {
    if (!this.calculationValid) return;
    const node = (cardRef as any).nativeElement ?? cardRef;
    const canvas = await this.renderCardToCanvas(node);
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
    } else {
      // Multi-page
      let remainingHeight = imgHeight;
      let position = 0;

      const canvasPage = document.createElement('canvas');
      const ctx = canvasPage.getContext('2d')!;
      const pageCanvasHeight = Math.floor(
        ((pageHeight - margin * 2) * canvas.width) / imgWidth
      );
      canvasPage.width = canvas.width;
      canvasPage.height = pageCanvasHeight;

      while (remainingHeight > 0) {
        ctx.clearRect(0, 0, canvasPage.width, canvasPage.height);
        ctx.drawImage(
          canvas,
          0,
          position,
          canvas.width,
          pageCanvasHeight,
          0,
          0,
          canvasPage.width,
          canvasPage.height
        );

        const pageData = canvasPage.toDataURL('image/jpeg', 1.0);
        if (position === 0) {
          pdf.addImage(
            pageData,
            'JPEG',
            margin,
            margin,
            imgWidth,
            pageHeight - margin * 2
          );
        } else {
          pdf.addPage();
          pdf.addImage(
            pageData,
            'JPEG',
            margin,
            margin,
            imgWidth,
            pageHeight - margin * 2
          );
        }

        position += pageCanvasHeight;
        remainingHeight -= pageHeight - margin * 2;
      }
    }

    pdf.save(`${this.fileBase()}.pdf`);
  }

  changeInputs(): void {
    this.showResults = false;
  }
}
