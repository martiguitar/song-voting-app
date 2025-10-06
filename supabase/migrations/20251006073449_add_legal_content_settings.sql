/*
  # Add Legal Content Settings
  
  1. New Settings
    - Add imprint_content_de (German imprint text)
    - Add imprint_content_en (English imprint text)
    - Add privacy_content_de (German privacy policy text)
    - Add privacy_content_en (English privacy policy text)
  
  2. Changes
    - Insert default values for all legal content settings
*/

-- Insert default imprint content (German)
INSERT INTO settings (key, value)
VALUES (
  'imprint_content_de',
  E'<h3>Verantwortlich</h3>\n<p>ton.band</p>\n<p>Angaben gemäß § 5 TMG</p>\n\n<h3>Kontakt</h3>\n<p>E-Mail: info@ton.band</p>'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default imprint content (English)
INSERT INTO settings (key, value)
VALUES (
  'imprint_content_en',
  E'<h3>Responsible</h3>\n<p>ton.band</p>\n<p>Information according to § 5 TMG</p>\n\n<h3>Contact</h3>\n<p>E-Mail: info@ton.band</p>'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default privacy content (German)
INSERT INTO settings (key, value)
VALUES (
  'privacy_content_de',
  E'<h3>Datenerfassung</h3>\n<p>Diese Anwendung erfasst Song-Vorschläge, Künstlernamen, Namen der Einreichenden und Abstimmungsinformationen. Alle Daten werden in einer sicheren Datenbank gespeichert und ausschließlich zum Zweck der Organisation von Band-Sessions verwendet.</p>\n\n<h3>Lokaler Speicher</h3>\n<p>Diese Anwendung verwendet lokalen Speicher, um deine Abstimmungspräferenzen zu speichern und Benachrichtigungen nur einmal anzuzeigen. Es werden keine personenbezogenen Daten im lokalen Speicher gespeichert.</p>\n\n<h3>Cookies</h3>\n<p>Diese Anwendung verwendet keine Cookies.</p>'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default privacy content (English)
INSERT INTO settings (key, value)
VALUES (
  'privacy_content_en',
  E'<h3>Data Collection</h3>\n<p>This application collects song suggestions, artist names, submitter names, and voting information. All data is stored in a secure database and is only used for the purpose of organizing band sessions.</p>\n\n<h3>Local Storage</h3>\n<p>This application uses local storage to remember your voting preferences and to show notifications only once. No personal data is stored in local storage.</p>\n\n<h3>Cookies</h3>\n<p>This application does not use cookies.</p>'
)
ON CONFLICT (key) DO NOTHING;
