import { Component } from '@angular/core';
import { Constants } from '../../../shared/constants';

@Component({
  selector: 'app-access-denied',
  imports: [],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss'
})
export class AccessDeniedComponent {
  readonly constants = Constants;
}
