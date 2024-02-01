# Comfortable Environment Card

A card to display the Heat Index and Discomfort Index (aka Thom Index)

The Heat Index (HI) combines temperature and humidity to give an equivalent temperature a body can perceive.
The Discomfort Index (DI), is a value representing the sensation of comfort (or discomfort) you'll experiencing.

While the HI is useful if you're planning some activities that requires hard work (and probably leads to sweat),
the DI tells you in realtime if the amount of humidity and the temperature is ok for your comfortable enviroment,
since even if the temperature seems to be ok, you could feel hot, too hot, cold, etc. depending on the humidity.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE)
[![hacs_badge](https://img.shields.io/badge/HACS-DEFAULT-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

## Options

| Name               | Type    | Requirement  | Description                                    | Default  |
| ------------------ | ------- | ------------ | ---------------------------------------------- | -------- |
| type               | string  | **Required** | `custom:comfortable-environment-card`          |          |
| room_name          | string  | **Optional** | Room name at top of the card                   |          |
| temperature_sensor | string  | **Required** | Any "sensor" entity reporting temperature      |          |
| humidity_sensor    | string  | **Required** | Any "sensor" entity reporting humidity         |          |
| show_index         | string  | **Required** | Choose index to show (ALL, HI, DI)             |          |

## Screenshot

![card_screenshot](https://github.com/argaar/comfortable-environment-card/blob/main/screenshot.png "Card in action")

## Known Issue

The card editor has a filter to let user choose temperature and humidity sensors only, all other entities from HA are excluded from the selection
Unfortunately if you have a sensor based on [Min/Max Helper](https://www.home-assistant.io/integrations/min_max/) (aka "Combine the state of..."),
you won't find it in the dropdown because it lacks the correct device_class attribute (see [here](https://github.com/home-assistant/core/issues/76003) and [here](https://github.com/home-assistant/core/issues/78979))

Don't worry! There are (at least) three workarounds:

- Use a [Group Helper](https://www.home-assistant.io/integrations/group/#sensor-groups) instead, the result will be the same (you can group temp/hum sensors and calc the mean/median value as in Min/Max)

- While you're in card editing mode, press on "SHOW CODE EDITOR" and write the

    * temperature_sensor: sensor.my_temp_sensor

  or

    * humidity_sensor: sensor.my_hum_sensor

  value by hand, you should see the card renders as soon as you write the sensor name

- Go in the HA Developer Tools from the sidebar, then choose "States" and search for your Min/Max sensor
  click on it and in the "State attribute" area, add the property

    * device_class: temperature

  or

    * device_class: humidity

  then press Set State, this attribute is valid only until the next restart but you need it just once in order to configure the card

## Credits

Calcs are based on research and (mostly) from National Weather Service (https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml)
The temperature bar idea was inspired by @madmicio 's ph-meter-temperature card (https://github.com/madmicio/ph-meter-temperature)

## Translations

Thanks to the people listed below, this card is available in the following languages:

* German - by [@Andurilll](https://github.com/Andurilll)
* English (default) - by [@argaar](https://github.com/argaar)
* French - by [@GaPhi](https://github.com/GaPhi)
* Hungarian - by [@n0is3r](https://github.com/n0is3r)
* Italian - by [@argaar](https://github.com/argaar)
* Portuguese - by [@FragMenthor](https://github.com/FragMenthor)
* Russian - by [@kai-zer-ru](https://github.com/kai-zer-ru)
* Slovak - by [@misa1515](https://github.com/misa1515)
* Spanish - by [@ale87jan](https://github.com/ale87jan)
* Ukrainian - by [@rkoptev](https://github.com/rkoptev)

[commits-shield]: https://img.shields.io/github/commit-activity/y/argaar/comfortable-environment-card.svg?style=for-the-badge
[commits]: https://github.com/argaar/comfortable-environment-card/commits/master
[license-shield]: https://img.shields.io/github/license/argaar/comfortable-environment-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2023.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/argaar/comfortable-environment-card.svg?style=for-the-badge
[releases]: https://github.com/argaar/comfortable-environment-card/releases
