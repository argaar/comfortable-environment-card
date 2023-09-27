import { LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'comfortable-environment-card-editor': LovelaceCardEditor;
  }
}

// TODO Add your configuration elements here for type-checking
export interface ComfortableEnvironmentCardConfig extends LovelaceCardConfig {
  type: string;
  room_name: string;
  temperature_sensor: string;
  humidity_sensor: string;
  degree_fahrenheit: boolean;
}