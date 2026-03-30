import { Pathogen, StateData, Alert, DataSource } from './types'

export const PATHOGENS: Pathogen[] = [
  { id:'lyme',   name:'Lyme disease',  color:'#2e7d32', risk:'H', act:82, vector:'Ixodes tick',       host:'White-tailed deer, white-footed mouse', inc:'3–30 days',  season:'Apr–Oct',    cases:35000, states:'Northeast, Upper Midwest', trend:[45,52,58,63,70,75,79,82], sources:['CDC ArboNET','NIH PubMed'] },
  { id:'wnv',    name:'West Nile',     color:'#e65100', risk:'M', act:61, vector:'Culex mosquito',    host:'Birds (reservoir), horses, humans',     inc:'2–14 days',  season:'Jul–Sep',    cases:2600,  states:'Plains, Southwest, South',  trend:[20,28,35,41,48,54,58,61], sources:['CDC ArboNET','WHO GOARN'] },
  { id:'rmsf',   name:'Rocky Mtn SF',  color:'#c62828', risk:'H', act:74, vector:'Dermacentor tick',  host:'Dogs, rodents',                         inc:'2–14 days',  season:'Apr–Sep',    cases:5000,  states:'Southeast, South-Central',  trend:[30,38,48,55,62,67,71,74], sources:['CDC ArboNET','NSF EcoHealth'] },
  { id:'dengue', name:'Dengue',        color:'#1565c0', risk:'M', act:29, vector:'Aedes mosquito',    host:'Humans (primary)',                      inc:'4–10 days',  season:'Jun–Oct',    cases:2200,  states:'Florida, Texas (imported)', trend:[10,13,16,18,22,25,27,29], sources:['CDC ArboNET','WHO GOARN','NIH PubMed'] },
  { id:'zika',   name:'Zika virus',    color:'#6a1b9a', risk:'L', act:18, vector:'Aedes mosquito',    host:'Humans, primates',                      inc:'3–14 days',  season:'Year-round', cases:120,   states:'Travel-associated only',    trend:[8,10,11,13,14,15,17,18],  sources:['CDC ArboNET','WHO GOARN'] },
  { id:'ehrl',   name:'Ehrlichiosis',  color:'#00695c', risk:'M', act:47, vector:'Lone Star tick',    host:'White-tailed deer',                     inc:'5–14 days',  season:'Apr–Sep',    cases:2500,  states:'Southeast, South-Central',  trend:[18,22,28,33,38,42,45,47], sources:['CDC ArboNET','NSF EcoHealth'] },
  { id:'eee',    name:'EEE',           color:'#b71c1c', risk:'H', act:55, vector:'Culiseta mosquito', host:'Birds (reservoir), horses',             inc:'4–10 days',  season:'Aug–Oct',    cases:11,    states:'Northeast, Gulf Coast',     trend:[5,10,18,28,38,46,51,55],  sources:['CDC ArboNET','NIH PubMed'] },
  { id:'anapl',  name:'Anaplasmosis',  color:'#0277bd', risk:'M', act:44, vector:'Ixodes tick',       host:'White-tailed deer, rodents',            inc:'1–2 weeks',  season:'Apr–Oct',    cases:5600,  states:'Northeast, Upper Midwest',  trend:[15,20,25,30,35,39,42,44], sources:['CDC ArboNET','NSF EcoHealth'] },
]

export const STATE_DATA: Record<string, number> = {
  Alabama:52, Alaska:8, Arizona:35, Arkansas:48, California:41, Colorado:38,
  Connecticut:78, Delaware:82, Florida:67, Georgia:59, Hawaii:15, Idaho:22,
  Illinois:54, Indiana:47, Iowa:38, Kansas:33, Kentucky:51, Louisiana:72,
  Maine:84, Maryland:75, Massachusetts:80, Michigan:61, Minnesota:70,
  Mississippi:63, Missouri:56, Montana:19, Nebraska:28, Nevada:12,
  'New Hampshire':76, 'New Jersey':83, 'New Mexico':24, 'New York':71,
  'North Carolina':65, 'North Dakota':21, Ohio:52, Oklahoma:44, Oregon:17,
  Pennsylvania:73, 'Rhode Island':85, 'South Carolina':62, 'South Dakota':25,
  Tennessee:58, Texas:68, Utah:14, Vermont:79, Virginia:66, Washington:20,
  'West Virginia':55, Wisconsin:67, Wyoming:16, 'District of Columbia':60,
}

export const TOP_PATHOGEN: Record<string, string> = {
  Maine:'Lyme', 'Rhode Island':'Lyme', 'New Jersey':'Lyme', Connecticut:'Lyme',
  Delaware:'Lyme', Maryland:'Lyme', Massachusetts:'Lyme', 'New Hampshire':'Lyme',
  Vermont:'Lyme', Pennsylvania:'Lyme', 'New York':'Lyme', Florida:'West Nile',
  Louisiana:'West Nile', Texas:'West Nile', Oklahoma:'RMSF', Arkansas:'RMSF',
  'North Carolina':'RMSF', Michigan:'Ehrlichiosis', Minnesota:'Ehrlichiosis',
  Wisconsin:'Anaplasmosis',
}

export function riskLevel(v: number): StateData['riskLevel'] {
  if (v < 20) return 'Low'
  if (v < 40) return 'Low-mod'
  if (v < 60) return 'Moderate'
  if (v < 80) return 'High'
  return 'Critical'
}

export function activityColor(v: number): string {
  if (v < 20) return '#e8f5e9'
  if (v < 40) return '#a5d6a7'
  if (v < 60) return '#4caf50'
  if (v < 80) return '#e65100'
  return '#c62828'
}

export const ALERTS: Alert[] = [
  { id:'a1', level:'critical', title:'Lyme spike — northeast corridor',     body:'Twelve states reporting activity indices above 80. Tick season began ~3 weeks earlier than the 5-year average.',                                            time:'2h ago',  source:'CDC ArboNET',  region:'Northeast' },
  { id:'a2', level:'critical', title:'RMSF fatality confirmed — Arkansas',  body:'One fatality confirmed. RMSF should be suspected in any febrile patient with tick exposure in endemic areas.',                                               time:'6h ago',  source:'CDC ArboNET',  region:'South-Central' },
  { id:'a3', level:'warning',  title:'West Nile expanding — Gulf Coast',    body:'Louisiana and Florida vector surveillance shows a 34% increase in Culex mosquito populations vs. this time last year.',                                      time:'5h ago',  source:'WHO GOARN',    region:'Gulf Coast' },
  { id:'a4', level:'warning',  title:'RMSF cluster — Oklahoma/Arkansas',    body:'Unusual early-season cluster detected. NIH sequencing of isolates ongoing to characterize strain variation.',                                                time:'8h ago',  source:'NIH PubMed',   region:'South-Central' },
  { id:'a5', level:'warning',  title:'EEE activity — Massachusetts',        body:'Early bird sentinel surveillance detected EEE virus activity in Bristol County. Human risk currently low.',                                                  time:'12h ago', source:'CDC ArboNET',  region:'Northeast' },
  { id:'a6', level:'warning',  title:'Anaplasmosis rising — upper Midwest', body:'Wisconsin and Minnesota reporting a 22% increase in confirmed cases vs. same period last year.',                                                            time:'18h ago', source:'NSF EcoHealth', region:'Upper Midwest' },
  { id:'a7', level:'info',     title:'Dengue travel advisory updated',      body:'CDC updated advisory for travelers returning from the Caribbean. Local transmission in Florida remains unlikely.',                                            time:'1d ago',  source:'CDC ArboNET',  region:'National' },
  { id:'a8', level:'info',     title:'West Nile vaccine trial — NIH update',body:'Phase II trial results show 78% efficacy. NIH expects Phase III enrollment to begin Q3 2026.',                                                             time:'2d ago',  source:'NIH PubMed',   region:'National' },
]

export const DATA_SOURCES: DataSource[] = [
  { id:'cdc',    name:'CDC ArboNET',  color:'#2e7d32', status:'online',   description:'CDC Arboviral Diseases Branch national surveillance network. Tracks confirmed and probable cases across all 50 states and territories with weekly case counts and outbreak alerts.',  updated:'15 min ago', records:'2.4M',        coverage:'50 states',       latency:'Weekly',    datasets:['Case counts','Vector surveillance','Sentinel chickens','Human serologic'],  url:'https://www.cdc.gov/westnile/data-maps/index.html' },
  { id:'who',    name:'WHO GOARN',    color:'#1565c0', status:'online',   description:'Global Outbreak Alert and Response Network. Monitors international vector-borne disease activity with relevance to US border and travel health, coordinating with 250+ partner institutions.',  updated:'1h ago',     records:'890K',        coverage:'194 countries',   latency:'Daily',     datasets:['Global alerts','Travel advisories','Cross-border events','Mortality data'],  url:'https://www.who.int/emergencies/disease-outbreak-news' },
  { id:'nih',    name:'NIH PubMed',   color:'#6a1b9a', status:'online',   description:'Curated literature surveillance scanning PubMed for emerging research on vector-borne disease trends, novel pathogens, treatment outcomes, and epidemiological modeling.',               updated:'6h ago',      records:'148K papers', coverage:'Research global',  latency:'Daily',     datasets:['Epidemiology papers','Genomic surveillance','Treatment outcomes','Modeling studies'],  url:'https://pubmed.ncbi.nlm.nih.gov' },
  { id:'nsf',    name:'NSF EcoHealth',color:'#00695c', status:'online',   description:'NSF EcoHealth Network environmental and wildlife surveillance. Provides host population dynamics, habitat range data, and ecological risk factors that predict vector population changes.', updated:'12h ago',     records:'560K',        coverage:'Continental US',  latency:'Weekly',    datasets:['Deer populations','Rodent surveys','Bird migration','Habitat mapping'] },
  { id:'promed', name:'ProMED',       color:'#7b3f00', status:'offline',  description:'Program for Monitoring Emerging Diseases — global infectious disease reporting. Currently disconnected. Enable to receive informal reports that may precede official surveillance data.', updated:'—',           records:'—',           coverage:'Global',          latency:'Real-time', datasets:['Informal reports','Outbreak rumors','Lab confirmations'],  url:'https://promedmail.org' },
]
