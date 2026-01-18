import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { CoreLayoutComponent } from "./core/components/core-layout/core-layout.component";
import { loadUserFromStorage } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  title = 'frontend';

  ngOnInit() {
    this.store.dispatch(loadUserFromStorage());
  }
}
