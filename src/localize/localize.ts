import * as cs from "./languages/cs/languages.json";
import * as de from "./languages/de/languages.json";
import * as en from "./languages/en/languages.json";
import * as es from "./languages/es/languages.json";
import * as fr from "./languages/fr/languages.json";
import * as gr from "./languages/gr/languages.json";
import * as hu from "./languages/hu/languages.json";
import * as it from "./languages/it/languages.json";
import * as nl from "./languages/nl/languages.json";
import * as pt from "./languages/pt/languages.json";
import * as pt_BR from "./languages/pt-BR/languages.json";
import * as ru from "./languages/ru/languages.json";
import * as sk from "./languages/sk/languages.json";
import * as uk from "./languages/uk/languages.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
  cs: cs,
  de: de,
  en: en,
  es: es,
  fr: fr,
  gr: gr,
  hu: hu,
  it: it,
  nl: nl,
  pt: pt,
  pt_BR: pt_BR,
  ru: ru,
  sk: sk,
  uk: uk,
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
