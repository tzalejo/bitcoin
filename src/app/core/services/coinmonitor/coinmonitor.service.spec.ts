import { TestBed } from '@angular/core/testing';

import { CoinmonitorService } from './coinmonitor.service';

describe('CoinmonitorService', () => {
  let service: CoinmonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoinmonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
