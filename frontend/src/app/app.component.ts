import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoreLayoutComponent } from "./core/components/core-layout/core-layout.component";


@Component({
  selector: 'app-root',
  imports: [CoreLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
