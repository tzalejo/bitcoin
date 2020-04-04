import { TestBed } from '@angular/core/testing';

import { CoinmarketcapService } from './coinmarketcap.service';

describe('CoinmarketcapService', () => {
  let service: CoinmarketcapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoinmarketcapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
