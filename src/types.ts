export interface Customer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  notes?: string;
  createdAt: string;
}

export type EquipmentType = 'Split High Wall' | 'Cassete' | 'Piso Teto' | 'Janela' | 'Multi-Split' | 'Chiller' | 'Outro';

export type EquipmentBrand = 'Daikin' | 'Fujitsu' | 'LG' | 'Samsung' | 'Carrier' | 'Midea' | 'Gree' | 'Consul' | 'Electrolux' | 'Outra';

export interface Equipment {
  id: string;
  customerId: string;
  type: EquipmentType;
  brand: EquipmentBrand;
  capacityBtu: number; // e.g., 9000, 12000, 18000, 24000, 36000, 48000, 60000
  model: string;
  serialNumber: string;
  locationRoom: string; // e.g., Quarto Casal, Sala de Estar, Recepção
  installationDate?: string;
  lastMaintenanceDate?: string;
  notes?: string;
  status: 'active' | 'maintenance' | 'inactive';
  photoUrl?: string;
}

export type ServiceType = 'Instalação' | 'Manutenção Preventiva' | 'Manutenção Corretiva' | 'Orçamento' | 'Visita Técnica';

export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  type: ServiceType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
  status: AppointmentStatus;
}

export type OSStatus = 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export interface OSChecklist {
  cleanEvaporator: boolean;
  cleanCondenser: boolean;
  checkGasPressure: boolean;
  checkElectrical: boolean;
  checkDrainage: boolean;
  testRemote: boolean;
  sanitizeUnit: boolean;
}

export interface ServiceOrder {
  id: string; // e.g., OS-2026-0001
  customerId: string;
  equipmentId: string;
  dateOpened: string;
  dateClosed?: string;
  status: OSStatus;
  issueReported: string;
  servicePerformed?: string;
  checklist: OSChecklist;
  laborValue: number;
  partsValue: number;
  totalValue: number;
  paymentStatus: 'pending' | 'paid';
  notes?: string;
  photoUrl?: string;
  photoDescription?: string;
  nextMaintenanceMonths?: number; // e.g. 3 or 6 months
  nextMaintenanceDate?: string; // YYYY-MM-DD
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
  linkedOsId?: string;
}

export interface CompanyProfile {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  slogan: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  bannerUrl?: string;
}

export type PMOCFrequency = 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual';

export interface PMOCRoutine {
  id: string;
  item: string;
  component: 'Filtro' | 'Bandeja/Dreno' | 'Serpentina' | 'Ventilação' | 'Elétrica' | 'Refrigeração' | 'Qualidade do Ar';
  frequency: PMOCFrequency;
  normativeReference: string;
  lastCompletedDate?: string;
  status: 'conforme' | 'pendente' | 'atencao';
  notes?: string;
}

export interface PMOCExecutionRecord {
  id: string;
  monthYear: string; // e.g. "2026-06"
  executedDate?: string;
  technicianName: string;
  status: 'concluido' | 'pendente' | 'atrasado';
  routinesCheckedCount: number;
  totalRoutinesCount: number;
  observations?: string;
}

export interface TechnicalResponsibility {
  technicalManagerName: string;
  professionalTitle: 'Engenheiro Mecânico' | 'Engenheiro Industrial Mecânico' | 'Técnico em Refrigeração e Climatização' | 'Técnico em Mecânica' | 'Outro';
  councilType: 'CREA' | 'CFT / CRT';
  councilNumber: string;
  councilState: string;
  cpf: string;
  artOrTrtNumber: string;
  artIssueDate: string;
  artValidUntil: string;
  signatureUrl?: string;
  signedAt?: string;
  legalTextDeclaration?: string;
}

export interface PMOCPlan {
  id: string;
  customerId: string;
  buildingName: string;
  cnpjOrCpf: string;
  addressText: string;
  contactPerson: string;
  contactPhone: string;
  airConditionedAreaM2: number;
  totalThermalCapacityBtu: number;
  totalThermalCapacityTR: number;
  fixedOccupants: number;
  transientOccupants: number;
  activityType: string;
  status: 'vigente' | 'em_revisao' | 'vencido';
  startDate: string;
  endDate: string;
  equipmentIds: string[];
  technicalResp: TechnicalResponsibility;
  routines: PMOCRoutine[];
  executionHistory: PMOCExecutionRecord[];
  notes?: string;
  compliancePercentage: number;
}

