import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HttpModule} from '@angular/http';
import {StudiesComponent} from './studies.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [StudiesComponent],
  bootstrap: [AppComponent]
})

export class AppModule { }
