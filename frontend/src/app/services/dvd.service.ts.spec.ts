import { TestBed } from '@angular/core/testing';

import { DvdServiceTs } from './dvd.service.ts';

describe('DvdServiceTs', () => {
  let service: DvdServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DvdServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
