import * as de from "./languages/de.json";
import * as en from "./languages/en.json";
import * as es from "./languages/es.json";
import * as fr from "./languages/fr.json";
import * as hu from "./languages/hu.json";
import * as it from "./languages/it.json";
import * as pt from "./languages/pt.json";
import * as ru from "./languages/ru.json";
import * as sk from "./languages/sk.json";
import * as uk from "./languages/uk.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
  de: de,
  en: en,
  es: es,
  fr: fr,
  hu: hu,
  it: it,
  ru: ru,
  sk: sk,
  pt: pt,
  uk: uk
};

export function localize(string: string, search = '', replace = ''): string {
  const lang = (localStorage.getItem('selectedLanguage') ?? 'en').replace(/['"]+/g, '').replace('-', '_');

  let translated: string;

  try {
    translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    translated = string.split('.').reduce((o, i) => o[i], languages['en']);
  }

  if (translated === undefined) translated = string.split('.').reduce((o, i) => o[i], languages['en']);

  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  }
  return translated;
}
