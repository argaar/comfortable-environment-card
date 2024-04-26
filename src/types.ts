import { LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'comfortable-environment-card-editor': LovelaceCardEditor;
  }
}

export interface ComfortableEnvironmentCardConfig extends LovelaceCardConfig {
  type: string;
  room_name: string;
  temperature_sensor: string;
  humidity_sensor: string;
  show_index: string;
  display_precision: number;
  show_realvalues: string;
}