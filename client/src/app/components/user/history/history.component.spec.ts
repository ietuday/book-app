import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { HistoryComponent } from "./history.component";
import { HistoryService } from "../../../services/history.service";
import { Observable } from "rxjs";

describe('HistoryComponent', () => {
  let historyComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        HistoryComponent
      ],
      providers: [
        {
          provide: HistoryService,
          useValue: {
            getHistory: jasmine.createSpy('getHistory').and.callFake(() => {
              return Observable.create(observer => {
                observer.next({
                  userId: 'user123',
                  actions: [
                    { desc: 'Action 1' },
                    { desc: 'Action 2' },
                    { desc: 'Action 3' }
                  ]
                })
              });
            })
          }
        }
      ]
    });
  });

  it('History Component should be defined', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    historyComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(historyComponent).toBeDefined();
  });

  it('should initialize with reversed actions', inject([HistoryService], fakeAsync((historyService) => {
    const fixture = TestBed.createComponent(HistoryComponent);
    historyComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    tick();

    expect(historyService.getHistory).toHaveBeenCalled();
    expect(historyComponent.history[0].desc).toEqual('Action 3');
    expect(historyComponent.history[2].desc).toEqual('Action 1');
  })));
});
