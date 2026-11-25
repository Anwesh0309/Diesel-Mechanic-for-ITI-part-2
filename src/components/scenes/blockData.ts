import { bi } from '@/data/types';
import type { BDef } from './BlockDiagram';

/** Watch-stage block diagrams for units 1, 3, 4, 8 and 10. Each step lists the node ids that light up. */
export const BLOCKS: Record<number, BDef> = {
  1: {
    nodes: [
      { id: 'sens', x: 20, y: 30, w: 130, label: bi('सेंसर', 'Sensors') },
      { id: 'ecu', x: 255, y: 30, w: 130, label: bi('ECU', 'ECU'), kind: 'ctrl' },
      { id: 'out', x: 480, y: 30, w: 140, label: bi('इंजेक्टर व एक्चुएटर', 'Injectors and actuators'), kind: 'end' },
      { id: 'map', x: 255, y: 135, w: 130, label: bi('ईंधन-मैप', 'Fuel map') },
      { id: 'corr', x: 440, y: 135, w: 150, label: bi('सुधार (तापमान, ऊँचाई)', 'Corrections (temperature, altitude)') },
      { id: 'lim', x: 440, y: 225, w: 150, label: bi('स्मोक-लिमिटर', 'Smoke limiter') },
      { id: 'net', x: 40, y: 190, w: 170, label: bi('CAN / J1939 नेटवर्क', 'CAN / J1939 network') },
    ],
    edges: [['sens', 'ecu'], ['ecu', 'map'], ['map', 'corr'], ['corr', 'lim'], ['ecu', 'out'], ['ecu', 'net']],
    steps: [['sens', 'ecu'], ['ecu', 'map'], ['map', 'corr', 'lim'], ['ecu', 'out', 'net']],
  },
  3: {
    nodes: [
      { id: 'ecu', x: 255, y: 15, w: 130, label: bi('ECU', 'ECU'), kind: 'ctrl' },
      { id: 'imv', x: 40, y: 100, w: 150, label: bi('IMV (इनलेट वाल्व)', 'IMV (inlet metering)') },
      { id: 'pcv', x: 450, y: 100, w: 160, label: bi('PCV (रेल रिलीफ़)', 'PCV (rail relief)') },
      { id: 'pump', x: 40, y: 190, w: 150, label: bi('हाई-प्रेशर पंप', 'High-pressure pump') },
      { id: 'rail', x: 255, y: 190, w: 130, label: bi('कॉमन रेल', 'Common rail') },
      { id: 'inj', x: 470, y: 190, w: 140, label: bi('इंजेक्टर', 'Injectors'), kind: 'end' },
      { id: 'sensor', x: 255, y: 280, w: 130, label: bi('रेल-दाब सेंसर', 'Rail-pressure sensor') },
      { id: 'ret', x: 470, y: 280, w: 140, label: bi('टंकी में वापसी', 'Return to tank') },
    ],
    edges: [['ecu', 'imv'], ['ecu', 'pcv'], ['imv', 'pump'], ['pump', 'rail'], ['rail', 'inj'], ['rail', 'pcv'], ['rail', 'sensor'], ['inj', 'ret']],
    steps: [['rail', 'inj'], ['ecu', 'imv', 'pcv', 'pump', 'rail'], ['rail', 'sensor'], ['inj', 'ret']],
  },
  4: {
    nodes: [
      { id: 'ecu', x: 30, y: 110, w: 130, label: bi('ECU', 'ECU'), kind: 'ctrl' },
      { id: 'tool', x: 240, y: 110, w: 130, label: bi('स्कैन-टूल', 'Scan tool') },
      { id: 'dtc', x: 460, y: 20, w: 160, label: bi('कोड: SPN + FMI', 'Code: SPN + FMI') },
      { id: 'ff', x: 460, y: 110, w: 160, label: bi('फ़्रीज़ फ़्रेम', 'Freeze frame') },
      { id: 'root', x: 460, y: 200, w: 160, label: bi('मूल कोड', 'Root code'), kind: 'end' },
      { id: 'act', x: 240, y: 210, w: 130, label: bi('एक्चुएटर टेस्ट', 'Actuator test') },
    ],
    edges: [['ecu', 'tool'], ['tool', 'dtc'], ['tool', 'ff'], ['tool', 'root'], ['tool', 'act'], ['act', 'ecu']],
    steps: [['ecu', 'tool', 'dtc'], ['tool', 'ff'], ['tool', 'root'], ['tool', 'act', 'ecu']],
  },
  8: {
    nodes: [
      { id: 'react', x: 20, y: 15, w: 170, label: bi('रिएक्टिव', 'Reactive') },
      { id: 'prev', x: 235, y: 15, w: 170, label: bi('प्रिवेंटिव', 'Preventive') },
      { id: 'pred', x: 450, y: 15, w: 170, label: bi('प्रेडिक्टिव', 'Predictive') },
      { id: 'cost', x: 20, y: 130, w: 170, label: bi('डाउनटाइम-लागत', 'Downtime cost') },
      { id: 'choose', x: 235, y: 130, w: 170, label: bi('रणनीति चुनें', 'Choose strategy'), kind: 'ctrl' },
      { id: 'oil', x: 450, y: 125, w: 170, label: bi('तेल-लैब रिपोर्ट', 'Oil-lab report') },
      { id: 'trend', x: 450, y: 215, w: 170, label: bi('ट्रेंड → सीमा', 'Trend → limit'), kind: 'end' },
    ],
    edges: [['cost', 'choose'], ['choose', 'react'], ['choose', 'prev'], ['choose', 'pred'], ['pred', 'oil'], ['oil', 'trend']],
    steps: [['react', 'prev', 'pred'], ['pred', 'oil'], ['oil', 'trend'], ['cost', 'choose', 'react', 'prev', 'pred']],
  },
  10: {
    nodes: [
      { id: 'listen', x: 20, y: 40, w: 120, label: bi('सुनें', 'Listen') },
      { id: 'verify', x: 175, y: 40, w: 130, label: bi('पुष्टि + बुनियादी जाँच', 'Verify + basics') },
      { id: 'ladder', x: 340, y: 40, w: 130, label: bi('प्रमाण की सीढ़ी', 'Evidence ladder') },
      { id: 'cause', x: 505, y: 40, w: 115, label: bi('मूल कारण', 'Root cause'), kind: 'ctrl' },
      { id: 'quote', x: 505, y: 150, w: 115, label: bi('कोटेशन', 'Quote') },
      { id: 'repair', x: 340, y: 150, w: 130, label: bi('मरम्मत', 'Repair') },
      { id: 'comeback', x: 175, y: 150, w: 130, label: bi('कॉमबैक-जाँच', 'Comeback check'), kind: 'end' },
    ],
    edges: [['listen', 'verify'], ['verify', 'ladder'], ['ladder', 'cause'], ['cause', 'quote'], ['quote', 'repair'], ['repair', 'comeback']],
    steps: [['listen'], ['listen', 'verify'], ['verify', 'ladder', 'cause'], ['cause', 'quote', 'repair', 'comeback']],
  },
};
