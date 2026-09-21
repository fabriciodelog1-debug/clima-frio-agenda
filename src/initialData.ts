import { Customer, Equipment, Appointment, ServiceOrder, Transaction, PMOCPlan, DiagnosticReport } from './types';

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
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80'
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
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
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
    notes: 'Alerta ao cliente sobre manter a limpeza do filtro semanal na cozinha.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    photoDescription: 'Higienização profunda das serpentinas e dreno concluída. Desobstrução realizada com sucesso.'
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

export const initialPMOCPlans: PMOCPlan[] = [
  {
    id: 'PMOC-2026-001',
    customerId: 'c2',
    buildingName: 'Restaurante & Cozinha Industrial Sabor e Brasa',
    cnpjOrCpf: '12.345.678/0001-99',
    addressText: 'Rua Augusta, 450 - Consolação, São Paulo - SP, CEP: 01305-000',
    contactPerson: 'Gerente Rogério Santos',
    contactPhone: '(11) 3222-4455',
    airConditionedAreaM2: 280,
    totalThermalCapacityBtu: 84000,
    totalThermalCapacityTR: 7.0,
    fixedOccupants: 18,
    transientOccupants: 120,
    activityType: 'Comercial / Restaurante & Alimentação',
    status: 'vigente',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    equipmentIds: ['e2', 'e3'],
    compliancePercentage: 96,
    notes: 'Edifício com alta circulação pública e ambiente de cocção. Plano em estrita conformidade com a Lei Federal nº 13.589/2018 e Portaria MS nº 3.523/1998.',
    technicalResp: {
      technicalManagerName: 'Eng. Rafael Mendes de Oliveira',
      professionalTitle: 'Engenheiro Mecânico',
      councilType: 'CREA',
      councilNumber: 'CREA-SP 5062891440/D',
      councilState: 'SP',
      cpf: '241.982.538-44',
      artOrTrtNumber: 'ART Nº 2802723024881-SP',
      artIssueDate: '2026-01-10',
      artValidUntil: '2027-01-09',
      signedAt: '2026-01-10T14:30:00',
      signatureUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=80',
      legalTextDeclaration: 'Declaro para os devidos fins de direito e em observância à Lei Federal nº 13.589 de 04 de janeiro de 2018, à Portaria GM/MS nº 3.523/1998 e à Resolução RE nº 09/2003 da ANVISA, que assumo a Responsabilidade Técnica Mecânica pela elaboração, supervisão e execução do Plano de Manutenção, Operação e Controle (PMOC) dos sistemas de climatização deste empreendimento.'
    },
    routines: [
      {
        id: 'r1',
        item: 'Higienização e lavagem de filtros de ar primários (G1/G4)',
        component: 'Filtro',
        frequency: 'Mensal',
        normativeReference: 'Portaria MS 3.523 / NBR 13971',
        lastCompletedDate: '2026-09-10',
        status: 'conforme',
        notes: 'Filtros lavados com detergente neutro bactericida e secos à sombra.'
      },
      {
        id: 'r2',
        item: 'Limpeza e desinfecção química da bandeja de condensado e pastilhas bactericidas',
        component: 'Bandeja/Dreno',
        frequency: 'Mensal',
        normativeReference: 'Portaria MS 3.523 / NBR 13971',
        lastCompletedDate: '2026-09-10',
        status: 'conforme',
        notes: 'Eliminação total de biofilme e aplicação de pastilhas desinfetantes.'
      },
      {
        id: 'r3',
        item: 'Desobstrução, verificação de caimento e teste de fluxo da linha de dreno',
        component: 'Bandeja/Dreno',
        frequency: 'Mensal',
        normativeReference: 'NBR 13971',
        lastCompletedDate: '2026-09-10',
        status: 'conforme',
        notes: 'Teste de vazão hidráulica realizado com água potável colorida.'
      },
      {
        id: 'r4',
        item: 'Lavagem das aletas e serpentinas do evaporador com desincrustante biodegradável',
        component: 'Serpentina',
        frequency: 'Trimestral',
        normativeReference: 'Portaria MS 3.523 / NBR 14679',
        lastCompletedDate: '2026-07-15',
        status: 'conforme',
        notes: 'Serpentina limpa e desobstruída sem amassamento de aletas.'
      },
      {
        id: 'r5',
        item: 'Limpeza por hidro-jateamento de baixa pressão na serpentina do condensador',
        component: 'Serpentina',
        frequency: 'Trimestral',
        normativeReference: 'NBR 13971',
        lastCompletedDate: '2026-07-15',
        status: 'conforme',
        notes: 'Remoção de poeira e fuligem urbana nas unidades externas.'
      },
      {
        id: 'r6',
        item: 'Inspeção do ventilador/turbina, medição de vibração e fixação mecânica',
        component: 'Ventilação',
        frequency: 'Trimestral',
        normativeReference: 'NBR 13971',
        lastCompletedDate: '2026-07-15',
        status: 'conforme',
        notes: 'Turbinas alinhadas e balanceadas, ruído dentro dos limites de conforto.'
      },
      {
        id: 'r7',
        item: 'Medição da corrente nominal (A), tensão (V) e reaperto de conexões elétricas',
        component: 'Elétrica',
        frequency: 'Semestral',
        normativeReference: 'NBR 5410 / NBR 13971',
        lastCompletedDate: '2026-06-20',
        status: 'conforme',
        notes: 'Terminais reapertados com torquímetro; corrente de trabalho 100% nominal.'
      },
      {
        id: 'r8',
        item: 'Aferição de superaquecimento, sub-resfriamento e verificação de estanqueidade de fluido refrigerante',
        component: 'Refrigeração',
        frequency: 'Semestral',
        normativeReference: 'Portaria 3.523 / NBR 13971',
        lastCompletedDate: '2026-06-20',
        status: 'conforme',
        notes: 'Pressões estabilizadas com R410A; teste de estanqueidade negativo para vazamentos.'
      },
      {
        id: 'r9',
        item: 'Inspeção e recomposição do isolamento térmico das linhas frigorígenas de sucção e expansão',
        component: 'Refrigeração',
        frequency: 'Semestral',
        normativeReference: 'NBR 13971',
        lastCompletedDate: '2026-06-20',
        status: 'conforme',
        notes: 'Isolamento de elastômero em perfeito estado, fitas aluminizadas íntegras.'
      },
      {
        id: 'r10',
        item: 'Análise laboratorial de qualidade do ar de interiores (Fungos, CO2, Poeira e Umidade)',
        component: 'Qualidade do Ar',
        frequency: 'Anual',
        normativeReference: 'Resolução ANVISA RE nº 09/2003',
        lastCompletedDate: '2026-01-20',
        status: 'conforme',
        notes: 'Laudo microbiológico emitido pelo laboratório credenciado. Relação I/E < 1,5.'
      }
    ],
    executionHistory: [
      {
        id: 'ex-1',
        monthYear: '2026-04',
        executedDate: '2026-04-12',
        technicianName: 'Carlos Eduardo Lima (Téc. Mecânico)',
        status: 'concluido',
        routinesCheckedCount: 6,
        totalRoutinesCount: 6,
        observations: 'Manutenção preventiva mensal executada conforme PMOC. Equipamentos limpos.'
      },
      {
        id: 'ex-2',
        monthYear: '2026-05',
        executedDate: '2026-05-14',
        technicianName: 'Carlos Eduardo Lima (Téc. Mecânico)',
        status: 'concluido',
        routinesCheckedCount: 6,
        totalRoutinesCount: 6,
        observations: 'Filtros limpos e drenos testados. Sem anormalidades.'
      },
      {
        id: 'ex-3',
        monthYear: '2026-06',
        executedDate: '2026-06-20',
        technicianName: 'Carlos Eduardo Lima (Téc. Mecânico)',
        status: 'concluido',
        routinesCheckedCount: 9,
        totalRoutinesCount: 9,
        observations: 'Revisão semestral completa. Medições elétricas e pressões conferidas.'
      },
      {
        id: 'ex-4',
        monthYear: '2026-07',
        executedDate: '2026-07-15',
        technicianName: 'Carlos Eduardo Lima (Téc. Mecânico)',
        status: 'concluido',
        routinesCheckedCount: 6,
        totalRoutinesCount: 6,
        observations: 'Higienização trimestral das serpentinas de evaporador e condensador.'
      },
      {
        id: 'ex-5',
        monthYear: '2026-08',
        executedDate: '2026-08-18',
        technicianName: 'Carlos Eduardo Lima (Téc. Mecânico)',
        status: 'concluido',
        routinesCheckedCount: 6,
        totalRoutinesCount: 6,
        observations: 'Substituição de pastilha bactericida no dreno da cozinha.'
      },
      {
        id: 'ex-6',
        monthYear: '2026-09',
        executedDate: '2026-09-10',
        technicianName: 'Carlos Eduardo Lima (Téc. Mecânico)',
        status: 'concluido',
        routinesCheckedCount: 6,
        totalRoutinesCount: 6,
        observations: 'Vistoria e manutenção mensal realizada. Sistema operando em alta eficiência.'
      }
    ]
  }
];

export const initialDiagnosticReports: DiagnosticReport[] = [
  {
    id: 'LDO-2026-001',
    date: '2026-07-03',
    customerId: 'c1',
    equipmentId: 'e1',
    osId: 'OS-2026-0003',
    technicianName: 'Carlos Eduardo Lima - Técnico Mecânico (CFT 123456-SP)',
    reportType: 'conserto_realizado',
    symptomReported: 'O aparelho ligava a ventilação interna, mas não resfriava o ambiente. Condensadora externa apresentava zumbido contínuo e desarmava após 2 minutos.',
    failureCause: 'Capacitor de partida do compressor em curto/esgotado (capacitância residual de apenas 8µF, sendo a nominal de 35µF). Identificado também microvazamento de gás refrigerante na flange de 3/8 da válvula de sucção da condensadora por fadiga do cobre.',
    repairActionTaken: 'Substituição do capacitor de partida por modelo original blindado 35µF/450VAC. Corte e refação completa da flange com recozimento do tubo. Teste de estanqueidade pressurizado com Nitrogênio a 250 PSI por 40min (sem queda de pressão). Vácuo profundo atingindo 380 Microns. Recarga completa de fluido R410A por balança digital de precisão (850g conforme etiqueta do fabricante).',
    gasType: 'R410A',
    suctionPressurePsi: 122,
    dischargePressurePsi: 340,
    supplyTempC: 8.5,
    returnTempC: 22.8,
    voltageV: 220,
    nominalCurrentA: 5.4,
    measuredCurrentA: 5.1,
    vacuumMicrons: 380,
    capacitorMicrofarad: 'Nominal: 35 µF | Medido antigo: 8 µF | Novo instalado: 35.2 µF',
    leakTestPassed: true,
    drainageTestPassed: true,
    electricalSafetyPassed: true,
    thermalEfficiencyPassed: true,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    beforePhotoDescription: 'Flange danificada com indício de óleo na conexão da condensadora e capacitor estufado.',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    afterPhotoDescription: 'Nova flange usinada, capacitor blindado substituído e aparelho gelando com Delta T de 14.3°C.',
    partsReplaced: [
      { name: 'Capacitor Eletrolítico Blindado 35µF 450VAC', code: 'CAP-35-450', quantity: 1, unitPrice: 85.00, warrantyMonths: 6 },
      { name: 'Fluido Refrigerante Ecológico R410A (Carga por balança)', code: 'GAS-R410A-850', quantity: 1, unitPrice: 160.00, warrantyMonths: 3 },
      { name: 'Porca Flangeada de Latão Forjado 3/8"', code: 'FLG-38-LT', quantity: 1, unitPrice: 25.00, warrantyMonths: 12 }
    ],
    laborValue: 250.00,
    partsValue: 270.00,
    totalValue: 520.00,
    finalVerdict: 'Aparelho liberado em perfeito funcionamento e rendimento térmico ótimo. Salto térmico (Delta T) de 14.3°C com insuflamento em 8.5°C. Corrente e pressão estabilizadas dentro dos limites do fabricante.',
    warrantyDays: 90,
    recommendations: 'Manter os filtros da unidade interna limpos mensalmente com água morna. Não obstruir a saída de ar da unidade externa condensadora.'
  },
  {
    id: 'LDO-2026-002',
    date: '2026-06-20',
    customerId: 'c2',
    equipmentId: 'e3',
    osId: 'OS-2026-0002',
    technicianName: 'Carlos Eduardo Lima - Técnico Mecânico (CFT 123456-SP)',
    reportType: 'conserto_realizado',
    symptomReported: 'Vazamento constante de água pela carenagem do Piso Teto na cozinha, pingando sobre a bancada, e odor desagradável.',
    failureCause: 'Bandeja de condensado e mangueira de dreno de 3/4" totalmente bloqueadas por biofilme bacteriano e resíduos de gordura em suspensão no ar. Acúmulo de sujeira nas aletas da serpentina reduzindo a troca de calor.',
    repairActionTaken: 'Desmontagem da carenagem frontal, desobstrução mecânica da linha de dreno com mangueira desentupidora de alta pressão, lavagem química completa com bactericida neutro específico para alumínio. Aplicação de pastilha bactericida no reservatório do dreno e teste de fluxo hídrico contínuo de 5 litros.',
    gasType: 'R410A',
    suctionPressurePsi: 118,
    dischargePressurePsi: 335,
    supplyTempC: 9.0,
    returnTempC: 24.5,
    voltageV: 220,
    nominalCurrentA: 14.2,
    measuredCurrentA: 13.8,
    vacuumMicrons: undefined,
    capacitorMicrofarad: 'Verificado dentro da tolerância de fábrica (±5%)',
    leakTestPassed: true,
    drainageTestPassed: true,
    electricalSafetyPassed: true,
    thermalEfficiencyPassed: true,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
    beforePhotoDescription: 'Bandeja com acúmulo de biofilme e dreno bloqueado transbordando água.',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    afterPhotoDescription: 'Serpentina higienizada, dreno desobstruído com vazão contínua de água testada.',
    partsReplaced: [
      { name: 'Pastilha Bactericida Sanitizante de Dreno Air-Care (Cartela c/ 4)', code: 'PAST-BAC-04', quantity: 1, unitPrice: 45.00, warrantyMonths: 3 }
    ],
    laborValue: 220.00,
    partsValue: 45.00,
    totalValue: 265.00,
    finalVerdict: 'Dreno 100% desobstruído e testado com 5L de água sem nenhum respingo ou vazamento. Serpentina desincrustada e ar higienizado. Rendimento térmico aprovado.',
    warrantyDays: 90,
    recommendations: 'Realizar lavagem quinzenal dos filtros laváveis e manter rotina PMOC mensal rigorosa devido ao ambiente com gordura da cozinha.'
  }
];
