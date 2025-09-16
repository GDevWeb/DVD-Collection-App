import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualEntryPage } from './manual-entry.page';

describe('ManualEntryPage', () => {
  let component: ManualEntryPage;
  let fixture: ComponentFixture<ManualEntryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
