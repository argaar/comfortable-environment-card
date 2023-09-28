# Comfortable Environment Card by [@argaar](https://www.github.com/argaar)

A card to display the Heat Index and Discomfort Index (aka Thom Index)

The Heat Index (HI) combines temperature and humidity to give an equivalent temperature a body can perceive.
The Discomfort Index (DI), is a value representing the sensation of comfort (or discomfort) you'll experiencing.

While the HI is useful if you're planning some activities that requires hard work (and probably leads to sweat),
the DI tells you in realtime if the amount of humidity and the temperature is ok for your comfortable enviroment,
since even if the temperature seems to be ok, you could feel hot, too hot, cold, etc. depending on the humidity.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

## Options

| Name               | Type    | Requirement  | Description                                    | Default  |
| ------------------ | ------- | ------------ | ---------------------------------------------- | -------- |
| type               | string  | **Required** | `custom:comfortable-environment-card`          |          |
| room_name          | string  | **Optional** | Room name at top of the card                   |          |
| temperature_sensor | string  | **Required** | Any "sensor" entity reporting temperature      |          |
| humidity_sensor    | string  | **Required** | Any "sensor" entity reporting humidity         |          |
| degree_fahrenheit  | boolean | **Optional** | Enable to use other calcs if your temp is in F | `false`  |


[commits-shield]: https://img.shields.io/github/commit-activity/y/argaar/comfortable-environment-card.svg?style=for-the-badge
[commits]: https://github.com/argaar/comfortable-environment-card/commits/master
[license-shield]: https://img.shields.io/github/license/argaar/comfortable-environment-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2023.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/argaar/comfortable-environment-card.svg?style=for-the-badge
[releases]: https://github.com/argaar/comfortable-environment-card/releases