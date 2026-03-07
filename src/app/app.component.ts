import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TuiRootModule } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TuiRootModule
  ],
  template: `
    <tui-root>
      <div class="app-layout">
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </tui-root>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }

    .app-layout {
      display: flex;
      height: 100vh;
      width: 100vw;
    }

    .main-content {
      flex: 1;
      overflow: auto;
    }
  `]
})
export class AppComponent {
  title = 'system-architect-opencode';
}
