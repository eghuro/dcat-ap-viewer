import "@/modules";
import {getLanguage} from "@/app/navigation";
import {getRegistered} from "@/app/register";

// System and app-ui strings.
const strings = {
    "cs": {
        "404_title": "404 stránka nenalezena"
        , "404_text_before": "Zkuste hledat na stránce "
        , "404_link": "datových sad"
        , "404_text_after": "."
        , "http.fetching": "Načítám data ..."
        , "http.missing_resource": "Nepodařilo se nalézt hledaná data."
        , "http.error_response": "Nepodařilo se načíst data."
        , "http.server_failure": "Nepodařilo se načíst data."
        , "http.fetch_failed": "Nepodařilo se načíst data."
        , "header.logo_alt": "Otevřená data"
        , "news": "Novinky"
        , "datasets": "Datové sady"
        , "publishers": "Poskytovatelé"
        , "keywords": "Klíčová slova"
        , "catalogs": "Registrované katalogy"
        , "en": "English"
        , "cs": "Čeština"
        , "more": "Další"
        , "for_interested_in_open_data": "Pro zájemce o otevírání dat"
        , "for_programmes": "Pro uživatele a programátory"
        , "for_publishers": "Pro poskytovatele dat"
        , "f_nkod_registration": "Registrace do NKOD"
        , "f_register_dataset": "Registrovat novou datovou sadu"
        , "f_register_local_catalog": "Registrovat nový lokální katalog"
        , "f_contacts": "Kontakty"
        , "f_contact_person": "Kontaktní osoba"
        , "f_email": "Email"
        , "f_telephone": "Telefon"
        , "f_mvcr": "Ministerstvo vnitra České republiky"
        , "f_links": "Odkazy"
        , "f_catalog_for_download": "Katalog ke stažení"
        , "f_download_catalog": "Celý katalog (RDF TriG)"
        , "f_download_datasets": "Datové sady (CSV)"
        , "f_download_distributions": "Distribuce (CSV)"
        , "f_sparql_endpoint": "SPARQL endpoint"
        , "f_opendata": "Otevřená data"
        , "f_catalog_runs_at": "Katalog běží na"
        , "f_data_prepared_with": "Data zpracována pomocí"
        , "f_eu_ozp": "Evropská unie - Evropský sociální fond - Operační program Zaměstnanost"
        , "f_legal_0": "Forma uveřejňovaných informací je v souladu s"
        , "f_legal_1": "vyhláškou č. 64/2008 Sb., o formě uveřejňování informací souvisejících s výkonem veřejné správy prostřednictvím webových stránek pro osoby se zdravotním postižením (vyhláška o přístupnosti)"
        , "f_legal_2": ", a splňuje všechna pravidla uveřejněná v příloze této vyhlášky."
    },
    "en": {
        "404_title": "404 page not found"
        , "404_text_before": "You can try to search on the "
        , "404_link": "datasets"
        , "404_text_after": " page."
        , "http.fetching": "Loading ..."
        , "http.missing_resource": "Failed to find data."
        , "http.error_response": "Failed to load data."
        , "http.server_failure": "Failed to load data."
        , "http.fetch_failed": "Failed to load data."
        , "header.logo_alt": "Open data"
        , "news": "News"
        , "datasets": "Datasets"
        , "publishers": "Publishers"
        , "keywords": "Keywords"
        , "catalogs": "Registered catalogs"
        , "en": "English"
        , "cs": "Čeština"
        , "more": "More"
        , "for_interested_in_open_data": "About Open Data"
        , "for_programmes": "For users and programmers"
        , "for_publishers": "For publishers"
    }
};

export function initialize() {
    getRegistered().forEach((entry) => {
        if (entry.strings === undefined) {
            return;
        }
        Object.keys(entry.strings).forEach((language) => {
            if (!strings[language]) {
                strings[language] = {};
            }
            strings[language] = {
                ...strings[language],
                ...entry.strings[language]
            }
        });
    });
}

export function getLanguages() {
    let languages = [];
    for (let lang in strings) {
        languages.push(lang);
    }
    return languages;
}

export function getString(name) {
    if (process.env.NODE_ENV === "development") {
        const language = getLanguage();
        const value = strings[language][name];
        if (value === undefined) {
            console.error("Missing key (", language, ") :", name);
        }
        return value;
    } else {
        return strings[getLanguage()][name];
    }
}

export function getStringArgs(name) {
    return getString(name).format(arguments.slice(1));
}
