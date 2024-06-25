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

| Name               | Type    | Requirement  | Description                                                | Default  |
| ------------------ | ------- | ------------ | -----------------------------------------------------------| -------- |
| type               | string  | **Required** | `custom:comfortable-environment-card`                      |          |
| room_name          | string  | **Optional** | Room name at top of the card                               | ""       |
| temperature_sensor | string  | **Required** | Any "sensor" entity reporting temperature                  |          |
| humidity_sensor    | string  | **Required** | Any "sensor" entity reporting humidity                     |          |
| display_precision  | number  | **Optional** | Numbers of decimals to show                                | 1        |
| show_index         | string  | **Optional** | Choose index to show (ALL, HI, DI)                         | ALL      |
| show_realvalues    | string  | **Optional** | Choose value to show (ALL, TEMPERATURE, HUMIDITY, NONE)    | ALL      |
| index_showinfo     | string  | **Optional** | Display Index Info (ALL, ICON, ICON_AND_N.., ICON_AND_T..) | ALL      |

## Screenshot

![card_screenshot][screenshot]

## Known Issues

#### Can't get my language working

This card get the language code from a variable in your browser, issued by HomeAssistant when you choose the default one in your profile page.
Sometimes this variable is not present, so if you can't display this card in your preferred language, please try to switch to a different language
and then back to your preferred one (so for example if you want to show the card in Czech, switch to English, and then back to Czech)
This way, HomeAssistant should populate the variable with the lang code and the card will fine the correct text instead of fallback to English

#### Group Sensors
The card editor has a filter to let user choose temperature and humidity sensors only, all other entities from HA are excluded from the selection
Unfortunately if you have a sensor based on [Min/Max Helper](https://www.home-assistant.io/integrations/min_max/) (aka "Combine the state of..."),
you won't find it in the dropdown because it lacks the correct device_class attribute (see [here](https://github.com/home-assistant/core/issues/76003) and [here](https://github.com/home-assistant/core/issues/78979))

Don't worry! There are (at least) three workarounds:

- Use a [Group Helper](https://www.home-assistant.io/integrations/group/#sensor-groups) instead, the result will be the same (you can group temp/hum sensors and calc the mean/median value as in Min/Max)

- While you're in card editing mode, press on "SHOW CODE EDITOR" and write the

    * `temperature_sensor: sensor.my_temp_sensor`

  or

    * `humidity_sensor: sensor.my_hum_sensor`

  value by hand, you should see the card renders as soon as you write the sensor name

- Go in the HA Developer Tools from the sidebar, then choose "States" and search for your Min/Max sensor
  click on it and in the "State attribute" area, add the property

    * `device_class: temperature`

  or

    * `device_class: humidity`

  then press Set State, this attribute is valid only until the next restart but you need it just once in order to configure the card

## Languages

Thanks to the people listed below and many more, this card is available in the following languages:

* Brazilian - ![pt-BR_lang_status][trans_pt-BR_lang] - Originally translated by [@igorsantos07](https://github.com/igorsantos07)
* Czech - ![cs_lang_status][trans_cs_lang] - Originally translated by [@ElektronikCZ](https://github.com/ElektronikCZ)
* Dutch - ![nl_lang_status][trans_nl_lang] - Originally translated by [@GHeiner](https://github.com/GHeiner)
* German - ![de_lang_status][trans_de_lang] - Originally translated by [@Andurilll](https://github.com/Andurilll)
* English (default) - ![en_lang_status][trans_en_lang] - Originally translated by [@argaar](https://github.com/argaar)
* French - ![fr_lang_status][trans_fr_lang] - Originally translated by [@GaPhi](https://github.com/GaPhi)
* Greek - ![gr_lang_status][trans_gr_lang] - Originally translated by [@tzam](https://github.com/tzamer)
* Hungarian - ![hu_lang_status][trans_hu_lang] - Originally translated by [@n0is3r](https://github.com/n0is3r)
* Italian - ![it_lang_status][trans_it_lang] - Originally translated by [@argaar](https://github.com/argaar)
* Polish - ![pl_lang_status][trans_pl_lang] - Originally translated by [@mailwash](https://github.com/mailwash)
* Portuguese - ![pt_lang_status][trans_pt_lang] - Originally translated by [@FragMenthor](https://github.com/FragMenthor)
* Russian - ![ru_lang_status][trans_ru_lang] - Originally translated by [@kai-zer-ru](https://github.com/kai-zer-ru)
* Slovak - ![sk_lang_status][trans_sk_lang] - Originally translated by [@misa1515](https://github.com/misa1515)
* Spanish - ![es_lang_status][trans_es_lang] - Originally translated by [@ale87jan](https://github.com/ale87jan)
* Ukrainian - ![uk_lang_status][trans_uk_lang] - Originally translated by [@rkoptev](https://github.com/rkoptev)

## Credits

Calcs are based on research and (mostly) from National Weather Service (https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml)
The temperature bar idea was inspired by @madmicio 's ph-meter-temperature card (https://github.com/madmicio/ph-meter-temperature)
Also this project is sponsored by [Locize](https://locize.com/) that hosts the localization service ![locize][locize_logo]

## Want to HELP?

Pull request, issues or translations are very welcomed.
If you can contribute writing code feel free to submit your PR, if you find a bug or have an idea about an enhanchment that everyone could benefit of please write it in the issues
If you can help translating some text, head to invitation link on [Locize](https://www.locize.app/register?invitation=gqBA02mq7U4wJOdIsM4eRzaJ25S5Va1uq11ti6tIDCHlAddKFxm4ewyfPIoXA2Sm)

[screenshot]: https://raw.githubusercontent.com/argaar/comfortable-environment-card/main/screenshot.png
[commits-shield]: https://img.shields.io/github/commit-activity/y/argaar/comfortable-environment-card.svg?style=for-the-badge
[commits]: https://github.com/argaar/comfortable-environment-card/commits/master
[license-shield]: https://img.shields.io/github/license/argaar/comfortable-environment-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2024.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/argaar/comfortable-environment-card.svg?style=for-the-badge
[releases]: https://github.com/argaar/comfortable-environment-card/releases
[locize_logo]: https://raw.githubusercontent.com/argaar/comfortable-environment-card/main/locize.svg

[trans_en_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'en'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=en:+

[trans_it_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'it'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=it:+

[trans_cs_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'cs'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=cs:+

[trans_de_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'de'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=de:+

[trans_es_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'es'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=es:+

[trans_fr_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'fr'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=fr:+

[trans_gr_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'gr'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=gr:+

[trans_hu_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'hu'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=hu:+

[trans_nl_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'nl'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=nl:+

[trans_pl_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'pl'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=pl:+

[trans_pt_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'pt'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=pt:+

[trans_pt-BR_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'pt-BR'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=pt-BR:+

[trans_ru_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'ru'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=ru:+

[trans_sk_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'sk'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=sk:+

[trans_uk_lang]:https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.versions%5B'latest'%5D.languages%5B'uk'%5D.translatedPercentage&url=https://api.locize.app/badgedata/535e704d-ed8a-4d1d-88b6-f29e6a61507a&suffix=%+translated&link=https://www.locize.com&prefix=uk:+