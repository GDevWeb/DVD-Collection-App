import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DvdListPage } from './dvd-list.page';

describe('DvdListPage', () => {
  let component: DvdListPage;
  let fixture: ComponentFixture<DvdListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DvdListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
