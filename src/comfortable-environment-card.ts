/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  LovelaceCardEditor,
} from 'custom-card-helpers';

import type { ComfortableEnvironmentCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

console.info(
  `%c  COMFORTABLE-ENVIRONMENT-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "comfortable-environment-card",
  name: "Comfortable Environment Card",
  preview: true,
  description: localize('common.description'),
});

@customElement('comfortable-environment-card')
class ComfortableEnvironmentCard extends LitElement {

  public getCardSize(): number {
    return 3;
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: ComfortableEnvironmentCardConfig;

  public setConfig(config: ComfortableEnvironmentCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    this.config = {
      ...config,
    };
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement("comfortable-environment-card-editor");
  }
  
  public static getStubConfig(): Record<string, unknown> {
    return { name: localize('configurator.room_name'), temperature_sensor: "sensor.room_temperature", humidity_sensor: "sensor.room_humidity", degree_fahrenheit: false };
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this.hass) {
      return html``;
    }

    const tempSensorStatus = Number(this.hass.states[this.config.temperature_sensor!].state);
    const humSensorStatus = Number(this.hass.states[this.config.humidity_sensor!].state);

    //Heat Index Equation and constants from https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
    // Formula from https://en.wikipedia.org/wiki/Heat_index#Formula
    
    const lowRH = 13
    const minTLowRH = 26.6
    const maxTLowRH = 44.4
    const highRH = 85
    const minTHighRH = 26.6 
    const maxTHighRH = 30.5

    let ADJ = 0
    let HI = 0
    let DI = 0

    let c1 = 0
    let c2 = 0
    let c3 = 0
    let c4 = 0
    let c5 = 0
    let c6 = 0
    let c7 = 0
    let c8 = 0
    let c9 = 0

    const degree_fahrenheit = this.config.degree_fahrenheit

    if (degree_fahrenheit === false) {
        //Celsius wins, okay maybe Kelvin but...
        c1 = -8.78469475556
        c2 = 1.61139411
        c3 = 2.33854883889
        c4 = -0.14611605
        c5 = -0.012308094
        c6 = -0.0164248277778
        c7 = 2.211732*Math.pow(10,-3)
        c8 = 7.2546*Math.pow(10,-4)
        c9 = -3.582*Math.pow(10,-6)

        // Rothfusz regression
        if ((humSensorStatus < lowRH) && (minTLowRH < tempSensorStatus) && (tempSensorStatus < maxTLowRH)) { // Adjustment for low RH
            ADJ = ((13-humSensorStatus)/4)*Math.sqrt((17-Math.abs(tempSensorStatus-35.))/17)
        }

        if ((humSensorStatus > highRH) && (minTHighRH < tempSensorStatus) && (tempSensorStatus < maxTHighRH)) { // Adjustment for high RH
            ADJ = ((humSensorStatus-85)/10) * ((30.5-tempSensorStatus)/5)
        }

    } else {
        c1 = -42.379
        c2 = 2.04901523
        c3 = 10.14333127
        c4 = -0.22475541
        c5 = -6.3783*Math.pow(10,-3)
        c6 = -5.481717*Math.pow(10,-2)
        c7 = 1.22874*Math.pow(10,-3)
        c8 = 8.5282*Math.pow(10,-4)
        c9 = -1.99*Math.pow(10,-6)

        if ((humSensorStatus < lowRH) && (minTLowRH < tempSensorStatus) && (tempSensorStatus < maxTLowRH)) { // Adjustment for low RH
            ADJ = ((13-humSensorStatus)/4)*Math.sqrt((17-Math.abs(tempSensorStatus-95.))/17)
        }

        if ((humSensorStatus > highRH) && (minTHighRH < tempSensorStatus) && (tempSensorStatus < maxTHighRH)) { // Adjustment for high RH
            ADJ = ((humSensorStatus-85)/10) * ((87-tempSensorStatus)/5)
        }
    }

    HI = (c1 + c2*tempSensorStatus + c3*humSensorStatus + c4*tempSensorStatus*humSensorStatus + c5*tempSensorStatus*tempSensorStatus + c6*humSensorStatus*humSensorStatus + c7*tempSensorStatus*tempSensorStatus*humSensorStatus + c8*tempSensorStatus*humSensorStatus*humSensorStatus + c9*tempSensorStatus*tempSensorStatus*humSensorStatus*humSensorStatus) - ADJ

    HI = parseFloat(HI.toFixed(2))
    let HIeffects = 0;
    
    if (degree_fahrenheit === false) {
        switch(true) {
            case HI>=27.0 && HI<=32.0:
                HIeffects = 1
                break;
            case HI>32.0 && HI<=41.0:
                HIeffects = 2
                break;
            case HI>41.0 && HI<=54.0:
                HIeffects = 3
                break;
            case HI>54.0:
                HIeffects = 4
                break;
        }
    } else {
        switch(true) {
            case HI>=80 && HI<=90.0:
                HIeffects = 1
                break;
            case HI>90.0 && HI<=105.0:
                HIeffects = 2
                break;
            case HI>105.0 && HI<=130.0:
                HIeffects = 3
                break;
            case HI>130.0:
                HIeffects = 4
                break;
        }
    }

    const temperatureValue = degree_fahrenheit?(tempSensorStatus-32)*5/9:tempSensorStatus

    DI = parseFloat((temperatureValue - 0.55*(1 - 0.01*humSensorStatus) * (temperatureValue - 14.5)).toFixed(2))

    let DIeffects = 0;
    
    switch(true) {
        case DI>10.0 && DI<=15.0:
            DIeffects = 1
            break;
        case DI>15.0  &&  DI<=18.0:
            DIeffects = 2
            break;
        case DI>18.0  &&  DI<=21.0:
            DIeffects = 3
            break;
        case DI>21.0  &&  DI<=24.0:
            DIeffects = 4
            break;
        case DI>24.0  &&  DI<=27.0:
            DIeffects = 5
            break;
        case DI>27.0  &&  DI<=29.0:
            DIeffects = 6
            break;
        case DI>29.0  &&  DI<=32.0:
            DIeffects = 7
            break;
        case DI>32.0:
            DIeffects = 8
            break;
    }

    return html`
      ${this.renderStyle()}
      <ha-card .header="${this.config.room_name}">

        <div id="card" style="filter: saturate(100%");>

          <div class="comfort-env-text" >
            <div>${localize('common.temperature')}: ${tempSensorStatus}°${degree_fahrenheit?'F':'C'}</div>
            <div>${localize('common.humidity')}: ${humSensorStatus}%</div>
          </div>

          <div class="comfort-env-text" >
            <div>${localize('common.hi')}: ${HI}°${degree_fahrenheit?'F':'C'} - ${localize('states.hi.'+[HIeffects])}</div>
          </div>
          <div class="color-range-container">
            <div class="color-range-gradient" style="background: linear-gradient(90deg, rgb(254, 240, 217) 0%, rgb(253, 204, 138) 28%, rgb(252, 141, 89) 42%, rgb(227, 74, 51) 66%, rgb(179, 0, 0) 100%);" >
              <li  class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,degree_fahrenheit?76:23,degree_fahrenheit?132:57,HI)}% - 46px))">${HI}</li>
            </div>
          </div>

          <div class="comfort-env-text" >
            <div>${localize('common.di')}: ${DI} - ${localize('states.di.'+[DIeffects])}</div>
          </div>
          <div class="color-range-container">
            <div class="color-range-gradient" style="background: linear-gradient(90deg,rgb(5, 112, 176) 0%,rgb(116, 169, 207)12%,rgb(189, 201, 225) 32%,rgb(241, 238, 246) 44%,rgb(254, 240, 217) 56%,rgb(253, 204, 138) 68%,rgb(252, 141, 89) 80%,rgb(227, 74, 51) 88%,rgb(179, 0, 0) 100%);" >
              <li  class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,8,34,DI)}% - 46px))">${DI}</li>
            </div>
          </div>
        </div>

      </ha-card>
    `;
  }

    protected calcRange(target_start: number, target_end: number, current_start: number, current_end: number, value: number): number {
    const value_target = Number(target_start + ((target_end - target_start) / (current_end - current_start)) * (value - current_start));
    if (value_target > 100) {
        return 100;
    } else if (value_target < 0) {
        return 0;
    } else {
        return value_target;
    }
  }

  protected renderStyle(): TemplateResult | void {
    return html`
      <style>
        .color-range-container{
            display:grid;
            grid-template-columns:50px auto 100px auto 50px;
            margin-bottom: 10px;
        }
        .color-range-gradient{
            grid-column:1/6;
            display:flex;
            flex-flow:row wrap;
            border-radius:5px;
            padding:0;
            margin:0 10px;
            list-style:none;
            box-shadow:5px 5px 7px inset rgba(0,0,0,.5),-5px -5px 7px inset rgba(0,0,0,.5);
        }
        .value-box{
            background:0 0;
            border:solid 3px #fff;
            border-radius:10px;
            padding:3px;
            width:32px;
            color:#fff;
            font-size:.9em;
            text-align:center;
            margin:2px 0;
            box-shadow:-1px 2px 4px rgba(0,0,0,.5),1px 1px 3px rgba(0,0,0,.5),-1px 2px 4px inset rgba(0,0,0,.5),1px 1px 3px inset rgba(0,0,0,.5);
            text-shadow:-1px 2px 4px rgba(0,0,0,.5),1px 1px 3px rgba(0,0,0,.5);
        }
       .comfort-env-text{
          margin:0 10px 0;
          padding:10px 0 5px;
          text-align:left;
        }
      </style>
    `;
  }

}
