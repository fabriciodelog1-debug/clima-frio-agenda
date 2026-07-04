import { Customer, Equipment, Appointment, ServiceOrder, Transaction } from './types';

export const initialCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Ana Silva Santos',
    cpfCnpj: '123.456.789-00',
    email: 'ana.silva@email.com',
    phone: '(11) 98765-4321',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apt 122',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310-100'
    },
    notes: 'Cliente residencial preferencial. Solicita sempre atendimento no período da tarde.',
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'c2',
    name: 'Restaurante Sabor & Brasa Ltda',
    cpfCnpj: '12.345.678/0001-99',
    email: 'contato@saborebrasa.com.br',
    phone: '(11) 3222-4455',
    address: {
      street: 'Rua Augusta',
      number: '450',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      cep: '01305-000'
    },
    notes: 'Cliente comercial. Equipamentos pesados na cozinha e salão. Manutenção preventiva mensal.',
    createdAt: '2026-04-15T14:30:00Z'
  },
  {
    id: 'c3',
    name: 'Roberto de Souza Melo',
    cpfCnpj: '987.654.321-11',
    email: 'roberto.melo@gmail.com',
    phone: '(21) 99888-7766',
    address: {
      street: 'Rua Barata Ribeiro',
      number: '150',
      complement: 'Bloco B, Cobertura 01',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      cep: '22040-001'
    },
    notes: 'Possui 3 aparelhos de ar condicionado. Exige higienização rigorosa devido a alergias.',
    createdAt: '2026-06-01T09:15:00Z'
  }
];

export const initialEquipment: Equipment[] = [
  {
    id: 'e1',
    customerId: 'c1',
    type: 'Split High Wall',
    brand: 'Daikin',
    capacityBtu: 12000,
    model: 'FTKM12Q',
    serialNumber: 'DK-20251199',
    locationRoom: 'Suíte Principal',
    installationDate: '2026-05-11',
    lastMaintenanceDate: '2026-05-11',
    notes: 'Equipamento inverter ultra silencioso.',
    status: 'active'
  },
  {
    id: 'e2',
    customerId: 'c2',
    type: 'Cassete',
    brand: 'Carrier',
    capacityBtu: 36000,
    model: '40KQA36515HC',
    serialNumber: 'CR-8877661A',
    locationRoom: 'Salão Principal',
    installationDate: '2026-04-20',
    lastMaintenanceDate: '2026-06-20',
    notes: 'Instalado no centro do restaurante. Filtro acumula gordura rapidamente.',
    status: 'active'
  },
  {
    id: 'e3',
    customerId: 'c2',
    type: 'Piso Teto',
    brand: 'Midea',
    capacityBtu: 48000,
    model: '42XQA48C5',
    serialNumber: 'MD-5544332B',
    locationRoom: 'Cozinha',
    installationDate: '2026-04-20',
    lastMaintenanceDate: '2026-06-20',
    notes: 'Ambiente com alta temperatura. Requer limpeza quinzenal de filtros.',
    status: 'maintenance'
  },
  {
    id: 'e4',
    customerId: 'c3',
    type: 'Split High Wall',
    brand: 'Samsung',
    capacityBtu: 9000,
    model: 'WindFree AR09ASEAAAW',
    serialNumber: 'SS-99008877',
    locationRoom: 'Escritório',
    installationDate: '2026-06-02',
    lastMaintenanceDate: '2026-06-02',
    notes: ' Windfree, sem vento direto.',
    status: 'active'
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'a1',
    customerId: 'c2',
    customerName: 'Restaurante Sabor & Brasa Ltda',
    title: 'Manutenção Mensal de Rotina',
    type: 'Manutenção Preventiva',
    date: '2026-07-10',
    startTime: '08:30',
    endTime: '11:30',
    notes: 'Realizar limpeza de filtros do salão e verificar carga de gás da cozinha.',
    status: 'scheduled'
  },
  {
    id: 'a2',
    customerId: 'c1',
    customerName: 'Ana Silva Santos',
    title: 'Visita Técnica - Barulho Estranho',
    type: 'Visita Técnica',
    date: '2026-07-04',
    startTime: '14:00',
    endTime: '15:30',
    notes: 'Cliente relata ruído na condensadora externa da suíte.',
    status: 'scheduled'
  },
  {
    id: 'a3',
    customerId: 'c3',
    customerName: 'Roberto de Souza Melo',
    title: 'Higienização e Sanitização Completa',
    type: 'Manutenção Preventiva',
    date: '2026-06-28',
    startTime: '10:00',
    endTime: '12:00',
    notes: 'Higienização química profunda com bactericida.',
    status: 'completed'
  }
];

export const initialServiceOrders: ServiceOrder[] = [
  {
    id: 'OS-2026-0001',
    customerId: 'c3',
    equipmentId: 'e4',
    dateOpened: '2026-06-02',
    dateClosed: '2026-06-02',
    status: 'completed',
    issueReported: 'Instalação de novo aparelho Split Windfree 9000 BTUs',
    servicePerformed: 'Instalação completa da unidade interna e externa, passagem de infraestrutura de cobre de 3 metros, isolamento térmico, vácuo e teste de pressão.',
    checklist: {
      cleanEvaporator: true,
      cleanCondenser: true,
      checkGasPressure: true,
      checkElectrical: true,
      checkDrainage: true,
      testRemote: true,
      sanitizeUnit: true
    },
    laborValue: 450.00,
    partsValue: 120.00,
    totalValue: 570.00,
    paymentStatus: 'paid',
    notes: 'Instalação padrão com sucesso. Garantia de 1 ano do serviço Clima Frio.'
  },
  {
    id: 'OS-2026-0002',
    customerId: 'c2',
    equipmentId: 'e3',
    dateOpened: '2026-06-20',
    dateClosed: '2026-06-20',
    status: 'completed',
    issueReported: 'Aparelho pingando água e não resfriando bem na Cozinha.',
    servicePerformed: 'Desobstrução do dreno entupido por gordura, lavagem completa das serpentinas com desincrustante ácido de alumínio e complementação de 100g de gás R410a.',
    checklist: {
      cleanEvaporator: true,
      cleanCondenser: true,
      checkGasPressure: true,
      checkElectrical: true,
      checkDrainage: true,
      testRemote: true,
      sanitizeUnit: true
    },
    laborValue: 220.00,
    partsValue: 45.00,
    totalValue: 265.00,
    paymentStatus: 'paid',
    notes: 'Alerta ao cliente sobre manter a limpeza do filtro semanal na cozinha.'
  },
  {
    id: 'OS-2026-0003',
    customerId: 'c1',
    equipmentId: 'e1',
    dateOpened: '2026-07-03',
    status: 'in_progress',
    issueReported: 'Condensadora externa apresenta vibração forte e ruído metálico.',
    checklist: {
      cleanEvaporator: false,
      cleanCondenser: false,
      checkGasPressure: false,
      checkElectrical: true,
      checkDrainage: false,
      testRemote: false,
      sanitizeUnit: false
    },
    laborValue: 150.00,
    partsValue: 0.00,
    totalValue: 150.00,
    paymentStatus: 'pending',
    notes: 'Técnico em rota para diagnosticar vibração.'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    amount: 570.00,
    category: 'Instalação',
    date: '2026-06-02',
    description: 'Recebimento OS-2026-0001 - Instalação Roberto Melo',
    linkedOsId: 'OS-2026-0001'
  },
  {
    id: 't2',
    type: 'income',
    amount: 265.00,
    category: 'Manutenção Corretiva',
    date: '2026-06-20',
    description: 'Recebimento OS-2026-0002 - Desobstrução Cozinha Restaurante',
    linkedOsId: 'OS-2026-0002'
  },
  {
    id: 't3',
    type: 'expense',
    amount: 180.00,
    category: 'Insumos',
    date: '2026-06-15',
    description: 'Compra de gás refrigerante R410a e fita isolante'
  },
  {
    id: 't4',
    type: 'expense',
    amount: 95.00,
    category: 'Combustível',
    date: '2026-06-25',
    description: 'Abastecimento veículo de serviço - Fiat Fiorino'
  },
  {
    id: 't5',
    type: 'expense',
    amount: 320.00,
    category: 'Ferramentas',
    date: '2026-06-28',
    description: 'Aquisição de bomba de vácuo portátil compacta'
  }
];
