import { TestBed } from '@angular/core/testing';

import { ProveService } from './prove.service';

describe('ProveService', () => {
  let service: ProveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
