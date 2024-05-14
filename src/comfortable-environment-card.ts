/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult } from 'lit';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ComfortableEnvironmentCard extends LitElement {

  public getCardSize(): number {
    return 3;
  }

  // Temperature Conversion
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
    return { name: localize('configurator.room_name'), temperature_sensor: "sensor.room_temperature", humidity_sensor: "sensor.room_humidity", display_precision: 1, show_index: "ALL", show_realvalues: "ALL", index_showinfo: "ALL" };
  }

  protected calcHI(tempInF: number, humValue: number): number {
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
    const T = tempInF
    const RH = humValue
    let cHI = 0.5 * (T + 61.0 + ((T-68.0)*1.2) + (RH*0.094))
    if (cHI >= 80.0) {
      cHI = -42.379 + 2.04901523*T + 10.14333127*RH - 0.22475541*T*RH - 0.00683783*T*T - 0.05481717*RH*RH + 0.00122874*T*T*RH + 0.00085282*T*RH*RH - 0.00000199*T*T*RH*RH
      if (RH < 13.0) {
        cHI = cHI - ((13.0 - RH) / 4.0) * Math.sqrt((17.0 - Math.abs(T - 95.0)) / 17.0)
      } else if (RH > 85.0 && T >= 80.0 && T <= 87.0) {
        cHI = cHI + ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
      }
    }
    return cHI
  }

  protected calcHIEffects(hiValue: number): number {
    let hieffects = NaN
    switch(true) {
        case hiValue<80:
          hieffects = 0
          break;
        case hiValue>=80 && hiValue<=90.0:
          hieffects = 1
          break;
        case hiValue>90.0 && hiValue<=105.0:
          hieffects = 2
          break;
        case hiValue>105.0 && hiValue<=130.0:
          hieffects = 3
          break;
        case hiValue>130.0:
          hieffects = 4
          break;
    }
    return hieffects
  }

  protected calcDI(tempInC: number, humValue: number): number {
    return parseFloat((tempInC - 0.55 * (1 - 0.01 * humValue) * (tempInC - 14.5)).toFixed(2))
  }

  protected calcDIEffects(diValue: number): number {
    let diEffects = NaN
    switch(true) {
      case diValue <= 10.0:
        diEffects = 0
        break;
      case diValue>10.0 && diValue<=15.0:
        diEffects = 1
        break;
      case diValue>15.0  &&  diValue<=18.0:
        diEffects = 2
        break;
      case diValue>18.0  &&  diValue<=21.0:
        diEffects = 3
        break;
      case diValue>21.0  &&  diValue<=24.0:
        diEffects = 4
        break;
      case diValue>24.0  &&  diValue<=27.0:
        diEffects = 5
        break;
      case diValue>27.0  &&  diValue<=29.0:
        diEffects = 6
        break;
      case diValue>29.0  &&  diValue<=32.0:
        diEffects = 7
        break;
      case diValue>32.0:
        diEffects = 8
        break;
    }
    return diEffects
  }

  protected render(): TemplateResult | void {
    if (!this.config || !this.hass) {
      return html``;
    }

    const tempSensorStatus = Number(this.hass.states[this.config.temperature_sensor]?.state);
    const humSensorStatus = Number(this.hass.states[this.config.humidity_sensor]?.state);
    const tempSensorUnit = this.hass.states[this.config.temperature_sensor]?.attributes.unit_of_measurement
    const tempSensorUnitInF = this.hass.states[this.config.temperature_sensor]?.attributes.unit_of_measurement==='°F'
    const showIndex = this.config.show_index || 'ALL'
    const indexInfo = this.config.index_showinfo || 'ALL'
    const showRealValues = this.config.show_realvalues || 'ALL'
    const display_precision = Number(this.config.display_precision) || 1

    const tempCelsiusValue = tempSensorUnitInF ? this.toCelsius(tempSensorStatus) : tempSensorStatus
    const tempFarenheitValue = tempSensorUnitInF ? tempSensorStatus : this.toFahrenheit(tempSensorStatus)

    let HI = this.calcHI(tempFarenheitValue, humSensorStatus)
    const HIeffects = this.calcHIEffects(HI)

    // Convert HI back to original unit_of_measurement from sensor
    HI = tempSensorUnitInF ? HI : this.toCelsius(HI)
    HI = parseFloat(HI.toFixed(2))

    // Compute DI using Celsius
    const DI = this.calcDI(tempCelsiusValue, humSensorStatus)
    const DIeffects = this.calcDIEffects(DI)

    return html`
      ${this.renderStyle()}
      <ha-card tabindex="0">

        <div class="header">

          <div class="name">
            ${this.config.room_name}
          </div>

          ${(showRealValues != 'NONE')?html`
            <div class="header_icons">
              ${(showRealValues == 'ALL' || showRealValues == 'TEMPERATURE')?html`
                <div class="temp">
                  ${tempSensorStatus.toFixed(display_precision)}${tempSensorUnit}
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiThermometer}" />
                      </g>
                    </svg>
                  </div>
                </div>
              `:``}

              ${(showRealValues == 'ALL' || showRealValues == 'HUMIDITY')?html`
                <div class="hum">
                  ${humSensorStatus.toFixed(display_precision)}%
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiWaterPercent}" />
                      </g>
                    </svg>
                  </div>
                </div>
              `:``}
            </div>
            `:``}

        </div>

        <div class="info">

          ${(showIndex == 'ALL' || showIndex == 'HI')?html`
            ${(indexInfo != 'NONE')?html`
              <div class="comfort-env-text">
                ${(indexInfo == 'ALL' || indexInfo == 'ICON' || indexInfo == 'ICON_AND_NAME' || indexInfo == 'ICON_AND_TEXT')?html`
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiSunThermometer}" />
                      </g>
                    </svg>
                  </div>
                `:``}
                ${(indexInfo != 'ICON')?html`
                  <div class="effects">
                    ${(indexInfo == 'ALL' || indexInfo == 'ICON_AND_NAME' || indexInfo == 'NAME' || indexInfo == 'NAME_AND_TEXT')?html`
                      ${localize('common.hi')}: ${HI}${tempSensorUnit}
                    `:``}
                    ${(indexInfo == 'ALL' || indexInfo == 'NAME_AND_TEXT')?html`
                       - 
                    `:``}
                    ${(indexInfo == 'ALL' || indexInfo == 'ICON_AND_TEXT' || indexInfo == 'TEXT' || indexInfo == 'NAME_AND_TEXT')?html`
                      ${!Number.isNaN(HIeffects)?localize('states.hi.'+[HIeffects]):'---'}
                    `:``}
                  </div>
                `:``}
              </div>
            `:``}
            <div class="color-range-container${indexInfo=='NONE'?' collapsed':''}">
              <div class="color-range-gradient" style="background: linear-gradient(90deg, rgb(254, 240, 217) 0%, rgb(253, 204, 138) 28%, rgb(252, 141, 89) 42%, rgb(227, 74, 51) 66%, rgb(179, 0, 0) 100%);" >
                  <div class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,tempSensorUnitInF?76:23,tempSensorUnitInF?132:57,HI)}% - 46px))">${HI.toFixed(display_precision)}</div>
              </div>
            </div>
          `:``}

          ${(showIndex == 'ALL' || showIndex == 'DI')?html`
            ${(indexInfo != 'NONE')?html`
              <div class="comfort-env-text">
                ${(indexInfo == 'ALL' || indexInfo == 'ICON' || indexInfo == 'ICON_AND_NAME' || indexInfo == 'ICON_AND_TEXT')?html`
                  <div class="icon">
                    <svg preserveAspectRatio="xMidYMid meet" focusable="false" role="img" aria-hidden="true" viewBox="0 0 24 24" style="fill: var(--state-icon-color); vertical-align: sub;">
                      <g>
                        <path class="primary-path" d="${mdiThermometerLines}" />
                      </g>
                    </svg>
                  </div>
                `:``}
                ${(indexInfo != 'ICON')?html`
                  <div class="effects">
                  ${(indexInfo == 'ALL' || indexInfo == 'ICON_AND_NAME' || indexInfo == 'NAME' || indexInfo == 'NAME_AND_TEXT')?html`
                    ${localize('common.di')}: ${DI}
                  `:``}
                  ${(indexInfo == 'ALL' || indexInfo == 'NAME_AND_TEXT')?html`
                     - 
                  `:``}
                  ${(indexInfo == 'ALL' || indexInfo == 'ICON_AND_TEXT' || indexInfo == 'TEXT' || indexInfo == 'NAME_AND_TEXT')?html`
                    ${!Number.isNaN(DIeffects)?localize('states.di.'+[DIeffects]):'---'}
                  `:``}
                  </div>
                `:``}
            </div>
            `:``}
            <div class="color-range-container${indexInfo=='NONE'?' collapsed':''}">
              <div class="color-range-gradient" style="background: linear-gradient(90deg,rgb(5, 112, 176) 0%,rgb(116, 169, 207)12%,rgb(189, 201, 225) 32%,rgb(241, 238, 246) 44%,rgb(254, 240, 217) 56%,rgb(253, 204, 138) 68%,rgb(252, 141, 89) 80%,rgb(227, 74, 51) 88%,rgb(179, 0, 0) 100%);" >
                  <div class="value-box" style="margin-left: max(0%,calc(${this.calcRange(0,100,8,34,DI)}% - 46px))">${DI.toFixed(display_precision)}</div>
              </div>
            </div>
          `:``}

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
        .color-range-container {
            display: flex;
        }
        .collapsed {
          margin-top: 2%;
        }
        .color-range-gradient {
            width: 100%;
            border-radius: 5px;
            margin: 0 10px 10px;
        }
        .value-box {
            border: solid 2px #000;
            border-radius: 10px;
            padding: 3px;
            width: 32px;
            color: #000;
            font-size: .9em;
            font-weight: bold;
            text-align: center;
            margin: 2px 0;
        }
       .comfort-env-text {
            margin: 0 10px 0;
            padding: 5px 0 5px;
            text-align: left;
            line-height: var(--mdc-icon-size, 8px);
        }
        .info {
            margin-top: -4px;
            padding-bottom: 1%;
        }
        .effects {
          display: inline;
        }
        .header {
            display: flex;
            padding: 1% 2% 0;
            justify-content: space-between;
            font-weight: 500;
            margin-bottom: 1%;
        }
        .header > .name {
            font-size: 20px;
        }
        .header > .temp,
        .header > .hum {
            font-size: 14px;
        }
        .header_icons {
            display: flex;
        }
        .icon {
            display: inline-block;
            width: var(--mdc-icon-size, 24px);
            height: var(--mdc-icon-size, 24px);
        }
      </style>
    `;
  }

}
