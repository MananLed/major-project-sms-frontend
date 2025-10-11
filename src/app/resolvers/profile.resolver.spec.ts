import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { ProfileResolver } from './profile.resolver';

describe('ProfileResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => ProfileResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
