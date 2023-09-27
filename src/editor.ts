/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { ComfortableEnvironmentCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';

import { localize } from './localize/localize';

@customElement('comfortable-environment-card-editor')
export class ComfortableEnvironmentCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ComfortableEnvironmentCardConfig;

  static elementDefinitions = {
    ...textfieldDefinition,
    ...selectDefinition,
    ...switchDefinition,
    ...formfieldDefinition,
  };

  public setConfig(config: ComfortableEnvironmentCardConfig): void {
    this._config = config;
  }

  get _room_name(): string {
    return this._config?.room_name || "";
  }

  get _temperature_sensor(): string {
    return this._config?.temperature_sensor || "";
  }

  get _humidity_sensor(): string {
    return this._config?.humidity_sensor || "";
  }

  get _degree_fahrenheit(): boolean {
    return this._config?.degree_fahrenheit || false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    const sensors = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'sensor').sort();

    return html`
      <mwc-textfield
        label="${localize('configurator.room_name')}"
        .value=${this._room_name}
        .configValue=${'room_name'}
        @input=${this._valueChanged}
      ></mwc-textfield>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="${localize('configurator.temp_sensor')}"
        .configValue=${'temperature_sensor'}
        .value=${this._temperature_sensor}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${sensors.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="${localize('configurator.hum_sensor')}"
        .configValue=${'humidity_sensor'}
        .value=${this._humidity_sensor}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${sensors.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

       <mwc-formfield .label=${`${localize('configurator.use_fahrenheit')}`}>
        <mwc-switch
          .checked=${this._degree_fahrenheit !== false}
          .configValue=${'degree_fahrenheit'}
          @change=${this._valueChanged}
        ></mwc-switch>
      </mwc-formfield>
    `;
  }

  static styles: CSSResultGroup = css`
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      margin-top: 5%;
      padding-bottom: 8px;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `;

   private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }
}
