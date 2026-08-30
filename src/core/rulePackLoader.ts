import { RulePack } from '../types/schema';
import hubspotContacts from '../rulepacks/hubspot.contacts.json';
import hubspotCompanies from '../rulepacks/hubspot.companies.json';
import salesforceContacts from '../rulepacks/salesforce.contacts.json';
import pipedrivePersons from '../rulepacks/pipedrive.persons.json';
import attioPeople from '../rulepacks/attio.people.json';

const RULE_PACKS: Record<string, RulePack> = {
  'hubspot:contacts': hubspotContacts as unknown as RulePack,
  'hubspot:companies': hubspotCompanies as unknown as RulePack,
  'salesforce:contacts': salesforceContacts as unknown as RulePack,
  'pipedrive:persons': pipedrivePersons as unknown as RulePack,
  'attio:people': attioPeople as unknown as RulePack,
};

export function getRulePack(platform: string, object = 'contacts'): RulePack {
  const key = `${platform}:${object}`;
  if (RULE_PACKS[key]) {
    return RULE_PACKS[key];
  }
  // Fallback to hubspot contacts if not found
  return RULE_PACKS['hubspot:contacts'] || (hubspotContacts as unknown as RulePack);
}

export function getAllAvailableRulePacks(): { platform: string; object: string; label: string }[] {
  return [
    { platform: 'hubspot', object: 'contacts', label: 'HubSpot Contacts' },
    { platform: 'hubspot', object: 'companies', label: 'HubSpot Companies' },
    { platform: 'salesforce', object: 'contacts', label: 'Salesforce Contacts' },
    { platform: 'pipedrive', object: 'persons', label: 'Pipedrive Persons' },
    { platform: 'attio', object: 'people', label: 'Attio People' },
  ];
}
