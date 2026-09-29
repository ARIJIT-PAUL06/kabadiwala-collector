// SYNTHETIC DEMO DATA — not real prices or real businesses. Replace with field survey data.
// TODO(field-data)
// Serves: R04, R07, R15
export interface Locality {
  id: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  lat: number;
  lng: number;
}

export interface District {
  id: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  lat: number;
  lng: number;
  localities: Locality[];
}

export const SEED_DISTRICTS: District[] = [
  {
    id: 'nagpur',
    nameEn: 'Nagpur',
    nameMr: 'नागपूर',
    nameHi: 'नागपुर',
    lat: 21.1458,
    lng: 79.0882,
    localities: [
      { id: 'itwari', nameEn: 'Itwari', nameMr: 'इतवारी', nameHi: 'इतवारी', lat: 21.155, lng: 79.112 },
      { id: 'gandhibagh', nameEn: 'Gandhibagh', nameMr: 'गांधीबाग', nameHi: 'गांधीबाग', lat: 21.149, lng: 79.106 },
      { id: 'mahal', nameEn: 'Mahal', nameMr: 'महाल', nameHi: 'महाल', lat: 21.142, lng: 79.108 },
      { id: 'sadar', nameEn: 'Sadar', nameMr: 'सदर', nameHi: 'सदर', lat: 21.161, lng: 79.083 },
      { id: 'mominpura', nameEn: 'Mominpura', nameMr: 'मोमीनपुरा', nameHi: 'मोमिनपुरा', lat: 21.158, lng: 79.102 },
      { id: 'kamptee', nameEn: 'Kamptee Road', nameMr: 'कामठी रोड', nameHi: 'कामठी रोड', lat: 21.185, lng: 79.118 },
      { id: 'hingna', nameEn: 'Hingna MIDC', nameMr: 'हिंगणा एमआयडीसी', nameHi: 'हिंगना एमआईडीसी', lat: 21.096, lng: 79.004 },
      { id: 'wadi', nameEn: 'Wadi', nameMr: 'वाडी', nameHi: 'वाडी', lat: 21.148, lng: 78.995 },
    ],
  },
  {
    id: 'wardha',
    nameEn: 'Wardha',
    nameMr: 'वर्धा',
    nameHi: 'वर्धा',
    lat: 20.7453,
    lng: 78.6022,
    localities: [
      { id: 'wardha_city', nameEn: 'Wardha City', nameMr: 'वर्धा शहर', nameHi: 'वर्धा शहर', lat: 20.7453, lng: 78.6022 },
    ],
  },
  {
    id: 'amravati',
    nameEn: 'Amravati',
    nameMr: 'अमरावती',
    nameHi: 'अमरावती',
    lat: 20.9374,
    lng: 77.7796,
    localities: [
      { id: 'amravati_city', nameEn: 'Amravati City', nameMr: 'अमरावती शहर', nameHi: 'अमरावती शहर', lat: 20.9374, lng: 77.7796 },
    ],
  },
  {
    id: 'chandrapur',
    nameEn: 'Chandrapur',
    nameMr: 'चंद्रपूर',
    nameHi: 'चंद्रपुर',
    lat: 19.9615,
    lng: 79.2961,
    localities: [
      { id: 'chandrapur_city', nameEn: 'Chandrapur City', nameMr: 'चंद्रपूर शहर', nameHi: 'चंद्रपुर शहर', lat: 19.9615, lng: 79.2961 },
    ],
  },
  {
    id: 'bhandara',
    nameEn: 'Bhandara',
    nameMr: 'भंडारा',
    nameHi: 'भंडारा',
    lat: 21.1714,
    lng: 79.6543,
    localities: [
      { id: 'bhandara_city', nameEn: 'Bhandara City', nameMr: 'भंडारा शहर', nameHi: 'भंडारा शहर', lat: 21.1714, lng: 79.6543 },
    ],
  },
];

export const NAGPUR_LOCALITIES: Locality[] = SEED_DISTRICTS[0].localities;
