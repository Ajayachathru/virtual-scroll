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
      <cdk-virtual-scroll-viewport itemSize="10" class="demo-infinite-container">
        <nz-list nzGrid>
          <div nz-row [nzGutter]="16">
            <nz-list-item nz-col [nzSpan]="6" *cdkVirtualFor="let item of ds">
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
export class NzDemoListInfiniteLoadComponent implements OnInit, OnDestroy {
  ds: Array<{
    label: string;
  }> = [];

  private destroy$ = new Subject();
  constructor(private http: HttpClient, private nzMessage: NzMessageService) {
    // this.ds = new MyDataSource(this.http);
    this.ds = Array.from({ length: 100000 }, (i, v) => ({
      label: `Card ${v + 1}`,
    }));
    console.log('this.ds', this.ds);
  }

  ngOnInit(): void {
    // this.ds
    //   .completed()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.nzMessage.warning('Infinite List loaded all');
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

class MyDataSource extends DataSource<ItemData> {
  private pageSize = 10;
  private cachedData: ItemData[] = [];
  private fetchedPages = new Set<number>();
  private dataStream = new BehaviorSubject<ItemData[]>(this.cachedData);
  private complete$ = new Subject<void>();
  private disconnect$ = new Subject<void>();

  constructor(private http: HttpClient) {
    super();
  }

  completed(): Observable<void> {
    return this.complete$.asObservable();
  }

  connect(collectionViewer: CollectionViewer): Observable<ItemData[]> {
    this.setup(collectionViewer);
    return this.dataStream;
  }

  disconnect(): void {
    this.disconnect$.next();
    this.disconnect$.complete();
  }

  private setup(collectionViewer: CollectionViewer): void {
    this.fetchPage(0);
    collectionViewer.viewChange
      .pipe(takeUntil(this.complete$), takeUntil(this.disconnect$))
      .subscribe((range) => {
        if (this.cachedData.length >= 50) {
          this.complete$.next();
          this.complete$.complete();
        } else {
          const endPage = this.getPageForIndex(range.end);
          this.fetchPage(endPage + 1);
        }
      });
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(page: number): void {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.fetchedPages.add(page);

    this.http
      .get<{ results: ItemData[] }>(
        `https://randomuser.me/api/?results=${this.pageSize}&inc=name,gender,email,nat&noinfo`
      )
      .pipe(catchError(() => of({ results: [] })))
      .subscribe((res) => {
        this.cachedData.splice(
          page * this.pageSize,
          this.pageSize,
          ...res.results
        );
        this.dataStream.next(this.cachedData);
      });
  }
}
