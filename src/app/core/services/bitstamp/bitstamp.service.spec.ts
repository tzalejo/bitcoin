import { TestBed } from '@angular/core/testing';

import { BitstampService } from './bitstamp.service';

describe('BitstampService', () => {
  let service: BitstampService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitstampService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
