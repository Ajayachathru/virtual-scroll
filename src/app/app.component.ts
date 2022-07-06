import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { NzMessageService } from 'ng-zorro-antd/message';

interface ItemData {
  gender: string;
  name: Name;
  email: string;
}

interface Name {
  title: string;
  first: string;
  last: string;
}

@Component({
  selector: 'nz-demo-list-infinite-load',
  template: `
    <div>
    <a nz-dropdown [nzDropdownMenu]="menu">
      <i nz-icon nzType="table" nzTheme="outline"></i>
    </a>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu nzSelectable>
        <li nz-menu-item (click)="changeLayout(4)">4 items</li>
        <li nz-menu-item (click)="changeLayout(6)">6 items</li>
        <li nz-menu-item (click)="changeLayout(8)">8 items</li>
      </ul>
    </nz-dropdown-menu>

      <cdk-virtual-scroll-viewport itemSize="10" class="demo-infinite-container">
        <nz-list nzGrid>
          <div nz-row [nzGutter]="24">
            <nz-list-item nz-col [nzSpan]="colSpan" *cdkVirtualFor="let item of ds">
                <nz-card style="width:300px;" [nzTitle]="item.label">
                  <p>Card content</p>
                  <p>Card content</p>
                  <p>Card content</p>
                </nz-card>
            </nz-list-item>
          </div>
        </nz-list>
      </cdk-virtual-scroll-viewport>
    </div>
  `,
  styles: [
    `
      .demo-infinite-container {
        height: 100vh;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
      }

      nz-card {
        background-color: #7ae1c6;
      }

      nz-list {
        padding: 24px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NzDemoListInfiniteLoadComponent {
  ds: Array<{
    label: string;
  }> = [];

  colSpan: number = 8; // default

  constructor() {
    // this.ds = new MyDataSource(this.http);
    this.ds = Array.from({ length: 100000 }, (v, i) => ({
      label: `Card ${i + 1}`,
    }));
  }

  changeLayout(nzSpan: number) {
    this.colSpan = 24 / nzSpan;
  }
}
