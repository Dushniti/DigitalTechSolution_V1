import { useEffect } from 'react';

const SITE_NAME = 'DigitalTechSolution';
const SITE_URL  = 'https://digitaltechsolution-v1.onrender.com';
const OG_IMAGE  =
  'https://lh3.googleusercontent.com/p/AF1QipNgb3rNsf-wTFuX8iOk_T3vsGKySB2VGSUb3o-D=s1360-w1360-h1020-rw';

/**
 * Upserts a <meta> tag in document.head.
 * Matches on `name`, `property`, or `http-equiv` attribute — creates if absent.
 */
const setMeta = (attr, value, content) => {
  let el = document.head.querySelector(`meta[${attr}="${CSS.escape(value)}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/**
 * Upserts a <link rel="canonical"> tag.
 */
const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

/**
 * useSEO({ title, description, path, ogType })
 *
 * @param {string} title        – Page-level title (site name appended automatically)
 * @param {string} description  – Meta description (≤160 chars recommended)
 * @param {string} [path='']   – Canonical path, e.g. '/privacy-policy'
 * @param {string} [ogType]     – Open Graph type, defaults to 'website'
 */
const useSEO = ({ title, description, path = '', ogType = 'website' }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonical = `${SITE_URL}${path}`;

    // ── Basic ──────────────────────────────────────────────────────────────
    document.title = fullTitle;
    setMeta('name', 'description', description);

    // ── Canonical ─────────────────────────────────────────────────────────
    setCanonical(canonical);

    // ── Open Graph ────────────────────────────────────────────────────────
    setMeta('property', 'og:type',        ogType);
    setMeta('property', 'og:title',       fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url',         canonical);
    setMeta('property', 'og:image',       OG_IMAGE);
    setMeta('property', 'og:site_name',   SITE_NAME);
    setMeta('property', 'og:locale',      'en_IN');

    // ── Twitter Card ──────────────────────────────────────────────────────
    setMeta('name', 'twitter:card',        'summary_large_image');
    setMeta('name', 'twitter:title',       fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image',       OG_IMAGE);
  }, [title, description, path, ogType]);
};

export default useSEO;
