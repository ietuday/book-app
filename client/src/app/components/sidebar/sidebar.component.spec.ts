/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { UserService } from "../../services/user.service";
import { RouterTestingModule } from "@angular/router/testing";
import { BehaviorSubject } from "rxjs";
import { User } from "../../models/User";
import { HistoryService } from "../../services/history.service";

describe('Sidebar Component', () => {
  let sidebarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SidebarComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject<User>(null)
          }
        },
        {
          provide: HistoryService,
          useValue: {
            userHistory: new BehaviorSubject<any>(
              [
                { desc: 'Action 1', committed_at: Date.now() },
                { desc: 'Action 2', committed_at: Date.now() + 2000 },
                { desc: 'Action 3', committed_at: Date.now() + 5000 },
                { desc: 'Action 4', committed_at: Date.now() + 6000 }
              ]
            )
          }
        }
      ]
    });
  });

  it('should create the Sidebar Component', async(() => {
    let fixture = TestBed.createComponent(SidebarComponent);
    let sidebarComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(sidebarComponent).toBeTruthy();
    expect(sidebarComponent.userSub).toBeDefined();
    expect(sidebarComponent.historySub).toBeDefined();
  }));

  it('should reverse action and slice to 3 items', inject([], fakeAsync(() => {
    let fixture = TestBed.createComponent(SidebarComponent);
    sidebarComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    tick();

    expect(sidebarComponent.userHistory.length).toEqual(3);
    expect(sidebarComponent.userHistory[0].desc).toEqual('Action 4');
    expect(sidebarComponent.userHistory[2].desc).toEqual('Action 2');
  })));
});
