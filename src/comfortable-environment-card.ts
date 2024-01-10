/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  LovelaceCardEditor,
} from 'custom-card-helpers';
import {
  mdiSunThermometer,
  mdiThermometer,
  mdiThermometerLines,
  mdiWaterPercent
} from '@mdi/js';

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

  public toCelsius(tValue: number): number {
    return (tValue - 32.0) * 5.0 / 9.0 
  }
  
  public toFahrenheit(tValue: number): number {
    return tValue * 9.0 / 5.0 + 32.0;
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
    return { name: localize('configurator.room_name'), temperature_sensor: "sensor.room_temperature", humidity_sensor: "sensor.room_humidity", show_index: "ALL" };
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this.hass) {
      return html``;
    }

    const tempSensorStatus = Number(this.hass.states[this.config.temperature_sensor!].state);
    const humSensorStatus = Number(this.hass.states[this.config.humidity_sensor!].state);
    const tempSensorUnit = this.hass.states[this.config.temperature_sensor!].attributes.unit_of_measurement
    const tempSensorUnitInF = this.hass.states[this.config.temperature_sensor!].attributes.unit_of_measurement==='°F'?true:false
    const showIndex = this.config.show_index

    //Heat Index Equation and constants from https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
    //  The computation of the heat index is a refinement of a result obtained by multiple regression analysis carried out by Lans P. Rothfusz and described in a 1990 National Weather Service (NWS) Technical Attachment (SR 90-23).  The regression equation of Rothfusz is
    //    HI = -42.379 + 2.04901523*T + 10.14333127*RH - .22475541*T*RH - .00683783*T*T - .05481717*RH*RH + .00122874*T*T*RH + .00085282*T*RH*RH - .00000199*T*T*RH*RH
    //  where T is temperature in degrees F and RH is relative humidity in percent.  HI is the heat index expressed as an apparent temperature in degrees F.
    //  If the RH is less than 13% and the temperature is between 80 and 112 degrees F, then the following adjustment is subtracted from HI:
    //    ADJUSTMENT = [(13-RH)/4]*SQRT{[17-ABS(T-95.)]/17}
    //  where ABS and SQRT are the absolute value and square root functions, respectively.
    //  On the other hand, if the RH is greater than 85% and the temperature is between 80 and 87 degrees F, then the following adjustment is added to HI:
    //    ADJUSTMENT = [(RH-85)/10] * [(87-T)/5]
    //  The Rothfusz regression is not appropriate when conditions of temperature and humidity warrant a heat index value below about 80 degrees F. In those cases, a simpler formula is applied to calculate values consistent with Steadman's results:
    //    HI = 0.5 * {T + 61.0 + [(T-68.0)*1.2] + (RH*0.094)}
    //  In practice, the simple formula is computed first and the result averaged with the temperature. If this heat index value is 80 degrees F or higher, the full regression equation along with any adjustment as described above is applied.
    //  The Rothfusz regression is not valid for extreme temperature and relative humidity conditions beyond the range of data considered by Steadman.

    // Compute HI using Farenheit
    const T = tempSensorUnitInF ? tempSensorStatus : this.toFahrenheit(tempSensorStatus)
    const RH = humSensorStatus
    let HI = 0.5 * (T + 61.0 + ((T-68.0)*1.2) + (RH*0.094))
    if (HI >= 80.0) {
      HI = -42.379 + 2.04901523*T + 10.14333127*RH - 0.22475541*T*RH - 0.00683783*T*T - 0.05481717*RH*RH + 0.00122874*T*T*RH + 0.00085282*T*RH*RH - 0.00000199*T*T*RH*RH
      if (RH < 13.0) {
        HI = HI - ((13.0 - RH) / 4.0) * Math.sqrt((17.0 - Math.abs(T - 95.0)) / 17.0)
      } else if (RH > 85.0 && T >= 80.0 && T <= 87.0) {
        HI = HI + ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
      }
    }

    let HIeffects = 0;
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

    // Convert HI back to original unit_of_measurement from sensor
    HI = tempSensorUnitInF ? HI : this.toCelsius(HI)
    HI = parseFloat(HI.toFixed(2))


    // Compute DI using Celsius
    const temperatureValue = tempSensorUnitInF ? this.toCelsius(tempSensorStatus) : tempSensorStatus

    const DI = parseFloat((temperatureValue - 0.55*(1 - 0.01*humSensorStatus) * (temperatureValue - 14.5)).toFixed(2))

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

    if (showIndex == 'HI') {
        return html`
          ${this.renderStyle()}
          <ha-card tabindex="0">

            <div class="header">
              <div class="name">
                ${this.config.room_name}
              </div>
              <div class="header_icons">
                <div class="temp">
                  ${tempSensorStatus}${tempSensorUnit}
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiThermometer}" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div class="hum">
                  ${humSensorStatus}%
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiWaterPercent}" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="info">
              <div class="comfort-env-text">
                <div class="icon">
                  <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                    <g>
                      <path class="primary-path" d="${mdiSunThermometer}" />
                    </g>
                  </svg>
                </div>
                <div class="effects">${localize('common.hi')}: ${HI}${tempSensorUnit} - ${localize('states.hi.'+[HIeffects])}</div>
              </div>
              <div class="color-range-container">
                <div class="color-range-gradient" style="background: linear-gradient(90deg, rgb(254, 240, 217) 0%, rgb(253, 204, 138) 28%, rgb(252, 141, 89) 42%, rgb(227, 74, 51) 66%, rgb(179, 0, 0) 100%);" >
                    <li class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,tempSensorUnitInF?76:23,tempSensorUnitInF?132:57,HI)}% - 46px))">${HI}</li>
                </div>
              </div>
            </div>

          </ha-card>
        `;
    } else if (showIndex == 'DI') {
        return html`
          ${this.renderStyle()}
          <ha-card tabindex="0">

            <div class="header">
              <div class="name">
                ${this.config.room_name}
              </div>
              <div class="header_icons">
                <div class="temp">
                  ${tempSensorStatus}${tempSensorUnit}
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiThermometer}" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div class="hum">
                  ${humSensorStatus}%
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiWaterPercent}" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="info">
              <div class="comfort-env-text">
                <div class="icon">
                  <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                    <g>
                      <path class="primary-path" d="${mdiThermometerLines}" />
                    </g>
                  </svg>
                </div>
                <div class="effects">${localize('common.di')}: ${DI} - ${localize('states.di.'+[DIeffects])}</div>
              </div>
              <div class="color-range-container">
                <div class="color-range-gradient" style="background: linear-gradient(90deg,rgb(5, 112, 176) 0%,rgb(116, 169, 207)12%,rgb(189, 201, 225) 32%,rgb(241, 238, 246) 44%,rgb(254, 240, 217) 56%,rgb(253, 204, 138) 68%,rgb(252, 141, 89) 80%,rgb(227, 74, 51) 88%,rgb(179, 0, 0) 100%);" >
                    <li class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,8,34,DI)}% - 46px))">${DI}</li>
                </div>
              </div>
            </div>

          </ha-card>
        `;
    } else {
        return html`
          ${this.renderStyle()}
          <ha-card tabindex="0">

            <div class="header">
              <div class="name">
                ${this.config.room_name}
              </div>
              <div class="header_icons">
                <div class="temp">
                  ${tempSensorStatus}${tempSensorUnit}
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiThermometer}" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div class="hum">
                  ${humSensorStatus}%
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiWaterPercent}" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="info">
              <div class="comfort-env-text">
                <div class="icon">
                  <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                    <g>
                      <path class="primary-path" d="${mdiSunThermometer}" />
                    </g>
                  </svg>
                </div>
                <div class="effects">${localize('common.hi')}: ${HI}${tempSensorUnit} - ${localize('states.hi.'+[HIeffects])}</div>
              </div>
              <div class="color-range-container">
                <div class="color-range-gradient" style="background: linear-gradient(90deg, rgb(254, 240, 217) 0%, rgb(253, 204, 138) 28%, rgb(252, 141, 89) 42%, rgb(227, 74, 51) 66%, rgb(179, 0, 0) 100%);" >
                    <li class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,tempSensorUnitInF?76:23,tempSensorUnitInF?132:57,HI)}% - 46px))">${HI}</li>
                </div>
              </div>
              <div class="comfort-env-text">
                <div class="icon">
                  <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                    <g>
                      <path class="primary-path" d="${mdiThermometerLines}" />
                    </g>
                  </svg>
                </div>
                <div class="effects">${localize('common.di')}: ${DI} - ${localize('states.di.'+[DIeffects])}</div>
              </div>
              <div class="color-range-container">
                <div class="color-range-gradient" style="background: linear-gradient(90deg,rgb(5, 112, 176) 0%,rgb(116, 169, 207)12%,rgb(189, 201, 225) 32%,rgb(241, 238, 246) 44%,rgb(254, 240, 217) 56%,rgb(253, 204, 138) 68%,rgb(252, 141, 89) 80%,rgb(227, 74, 51) 88%,rgb(179, 0, 0) 100%);" >
                    <li class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,8,34,DI)}% - 46px))">${DI}</li>
                </div>
              </div>
            </div>

          </ha-card>
        `;
    }
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
            padding:5px 0 5px;
            text-align:left;
        }
        .info {
            margin-top: -4px;
        }
        .effects {
            display: inline;
        }
        .header {
            display: flex;
            padding: 8px 10px 0px;
            justify-content: space-between;
            line-height: 40px;
            font-weight: 500;
        }
        .header > .name {
            font-size: 20px;
        }
        .header > .temp, .header > .hum {
            font-size: 14px;
        }
        .header_icons {
            display: flex;
        }
        .icon {
            display: inline-block;
            width: 24px;
            height: 24px;
        }
      </style>
    `;
  }

}
