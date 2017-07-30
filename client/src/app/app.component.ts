import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Http, Response}       from '@angular/http';
import { Observable }     from 'rxjs/Observable';
// import {TimerWrapper} from '@angular/core/src/facade/async';
import {interval} from 'rxjs/observable/interval';
import {StudiesComponent} from './studies.component';
import 'rxjs/add/operator/map';
import 'rxjs';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl:'opp.component.html'
})

export class AppComponent implements OnInit {
  public data : string;
  public studyData : Array<object>;
  private studiesUrl : string;
  
  constructor(private _http: Http, private _temp: StudiesComponent) {   
    this.data = "Hello World";
    this.studyData = [];
    this.studiesUrl = 'assets/studiesList.json';
  }

  ngOnInit() {
    let dataList: Array<object>;
    setInterval(()=>{
      this._http.get(this.studiesUrl)
                .map(response => response.json())
                .subscribe(
                    function(response) {
                      dataList = response.studyList;
                    },
                    function(error) { console.log("Error happened" + error)},
                    function() { console.log("the subscription is completed")}
                );
        if(this.studyData == undefined) {
          this.studyData =  dataList;
        } else if(JSON.stringify(this.studyData) != JSON.stringify(dataList))
        {
          this.studyData = dataList;
        }
      },1000);
  }
}
