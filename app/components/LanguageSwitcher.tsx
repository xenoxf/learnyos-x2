'use client';

import { useI18n } from '@/i18n/provider';
import { locales, localeNames } from '@/i18n/config';
import styles from '@/styles/languageSwitcher.module.css';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className={styles.languageSwitcher}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`${styles.langBtn} ${locale === loc ? styles.active : ''}`}
          title={localeNames[loc]}
        >
          {loc === 'es' ? '🇪🇸' : '🇺🇸'} {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
