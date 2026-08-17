import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

type Mode = 'login' | 'register' | 'reset';
@Component({ selector:'app-login', imports:[FormsModule], templateUrl:'./login.component.html', styleUrl:'./login.component.scss', changeDetection:ChangeDetectionStrategy.OnPush })
export class LoginComponent {
  readonly auth=inject(AuthService);private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);
  readonly mode=signal<Mode>('login');readonly email=signal('');readonly password=signal('');readonly confirmPassword=signal('');readonly showPassword=signal(false);readonly notice=signal('');
  async submit():Promise<void>{this.notice.set('');if(!this.email().trim()){this.notice.set('Inserisci la tua email.');return;}if(this.mode()==='reset'){try{await this.auth.resetPassword(this.email());this.notice.set('Email di ripristino inviata. Controlla la posta.');}catch{return;}return;}if(this.password().length<6){this.notice.set('La password deve contenere almeno 6 caratteri.');return;}if(this.mode()==='register'&&this.password()!==this.confirmPassword()){this.notice.set('Le password non coincidono.');return;}try{if(this.mode()==='login')await this.auth.login(this.email(),this.password());else await this.auth.register(this.email(),this.password());const target=this.route.snapshot.queryParamMap.get('returnUrl')??'/pokedex';await this.router.navigateByUrl(target);}catch{return;}}
  setMode(mode:Mode):void{this.mode.set(mode);this.notice.set('');this.auth.error.set('');}
}
