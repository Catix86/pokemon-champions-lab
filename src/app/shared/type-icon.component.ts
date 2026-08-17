import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PokemonType } from '../core/models';

const TYPE_ICONS: Record<PokemonType, string> = {
  Normale: 'circle', Fuoco: 'local_fire_department', Acqua: 'water_drop', Elettro: 'bolt',
  Erba: 'eco', Ghiaccio: 'ac_unit', Lotta: 'fitness_center', Veleno: 'science', Terra: 'landscape',
  Volante: 'air', Psico: 'psychology', Coleottero: 'pest_control', Roccia: 'diamond',
  Spettro: 'blur_on', Drago: 'storm', Buio: 'dark_mode', Acciaio: 'shield', Folletto: 'auto_awesome',
};

@Component({
  selector: 'app-type-icon',
  template: '<span class="material-symbols-rounded" [attr.aria-label]="type()">{{ icon() }}</span>',
  styles: [':host{display:inline-grid;place-items:center}.material-symbols-rounded{font-size:16px;line-height:1;font-variation-settings:"FILL" 1,"wght" 600,"GRAD" 0,"opsz" 20}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeIconComponent {
  readonly type = input.required<PokemonType>();
  readonly icon = computed(() => TYPE_ICONS[this.type()]);
}
