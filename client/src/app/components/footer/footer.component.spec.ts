/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { FooterComponent } from "../footer/footer.component";

describe('Footer Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FooterComponent
      ]
    });
  });

  it('should create the Footer Component', async(() => {
    let fixture = TestBed.createComponent(FooterComponent);
    let footerComponent = fixture.debugElement.componentInstance;
    expect(footerComponent).toBeTruthy();
  }));
});
