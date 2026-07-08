import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types';
import { Building, Upload, Image as ImageIcon, Check, MapPin, Phone, Mail, AlertCircle, Sparkles, Eye } from 'lucide-react';

interface CompanyProfileViewProps {
  onProfileUpdated?: () => void;
}

export default function CompanyProfileView({ onProfileUpdated }: CompanyProfileViewProps) {
  const [profile, setProfile] = useState<CompanyProfile>({
    name: 'CLIMA FRIO',
    cnpj: '',
    phone: '(11) 98765-4321',
    email: 'contato@climafrio.com',
    slogan: 'Sistemas de Climatização & Refrigeração',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: ''
    },
    bannerUrl: ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('climafrio_company_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfile(prev => ({
          ...prev,
          ...parsed,
          address: {
            ...prev.address,
            ...(parsed.address || {})
          }
        }));
      } catch (e) {
        console.error('Error parsing company profile', e);
      }
    }
  }, []);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };

  const handleAddressChange = (field: keyof CompanyProfile['address'], value: string) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    setIsSaved(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('O banner deve ter no máximo 2MB para otimização de armazenamento.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile(prev => ({
          ...prev,
          bannerUrl: event.target!.result as string
        }));
        setIsSaved(false);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    setProfile(prev => ({
      ...prev,
      bannerUrl: ''
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setError('O nome da empresa é obrigatório.');
      return;
    }

    localStorage.setItem('climafrio_company_profile', JSON.stringify(profile));
    setIsSaved(true);
    setError(null);
    if (onProfileUpdated) {
      onProfileUpdated();
    }

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6" id="company-profile-view">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building size={20} />
            </span>
            Perfil da Empresa (Minha Oficina / Loja)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os dados de CNPJ, endereço e o banner comprido da sua oficina. Essas informações serão impressas automaticamente nos cabeçalhos de todos os orçamentos e ordens de serviço.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              Identificação & Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razão Social / Nome da Loja *</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Clima Frio Refrigeração"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={profile.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  placeholder="Ex: 12.345.678/0001-90"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Slogan / Subtítulo</label>
                <input
                  type="text"
                  value={profile.slogan}
                  onChange={(e) => handleChange('slogan', e.target.value)}
                  placeholder="Ex: Sistemas de Climatização & Refrigeração"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail Comercial</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Ex: comercial@climafrio.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pt-4 pb-3 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              Localização da Oficina ou Loja Física
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Logradouro / Rua</label>
                <input
                  type="text"
                  value={profile.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Rua, Avenida..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Número</label>
                <input
                  type="text"
                  value={profile.address.number}
                  onChange={(e) => handleAddressChange('number', e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Complemento</label>
                <input
                  type="text"
                  value={profile.address.complement || ''}
                  onChange={(e) => handleAddressChange('complement', e.target.value)}
                  placeholder="Sala B, Fundos..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                <input
                  type="text"
                  value={profile.address.neighborhood}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                  placeholder="Centro"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                <input
                  type="text"
                  value={profile.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
                <input
                  type="text"
                  maxLength={2}
                  value={profile.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700"
                />
              </div>

              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">CEP</label>
                <input
                  type="text"
                  value={profile.address.cep}
                  onChange={(e) => handleAddressChange('cep', e.target.value)}
                  placeholder="Ex: 01234-567"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="border-t border-slate-50 pt-5 flex items-center justify-between">
              {error && (
                <div className="text-red-600 text-xs font-semibold flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
              {!error && isSaved && (
                <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 animate-pulse">
                  <Check size={14} />
                  <span>Configurações salvas com sucesso!</span>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-2 shadow-xs"
                >
                  <Check size={16} />
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right column: Banner Upload & Live Document Header Mockup */}
        <div className="space-y-6">
          {/* Banner Upload Box */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-500" />
              Banner Comprido da Empresa
            </h3>
            <p className="text-xs text-slate-500 leading-tight">
              Faça o upload de uma imagem retangular (proporção sugerida ~5:1, como 1200x240 pixels). Se enviado, esse banner substituirá o texto padrão no topo do PDF das ordens de serviço!
            </p>

            {profile.bannerUrl ? (
              <div className="space-y-3">
                <div className="relative border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 p-2">
                  <img
                    src={profile.bannerUrl}
                    alt="Banner da oficina"
                    className="w-full h-auto object-contain rounded-lg max-h-32 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white rounded-md px-2 py-1 text-[10px] font-bold cursor-pointer" onClick={handleRemoveBanner}>
                    Remover
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  Pronto! Seu banner personalizado será usado na exportação em PDF.
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/10">
                <Upload size={24} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Selecione uma imagem de banner</span>
                <span className="text-[10px] text-slate-400">Formatos recomendados: PNG ou JPG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Live Print Header Preview Mockup */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Eye size={18} className="text-blue-500" />
              Pré-visualização do Cabeçalho
            </h3>
            <p className="text-[11px] text-slate-400 leading-tight mb-2">
              Veja abaixo como as informações aparecerão no topo das ordens de serviço (proporção A4 adaptada):
            </p>

            <div className="border border-slate-200 rounded-2xl bg-white p-3 shadow-xs space-y-3 overflow-hidden text-slate-800 font-sans" id="live-pdf-header-mockup">
              {/* Actual PDF Simulated Box */}
              <div className="flex gap-2 items-stretch text-left border-b border-slate-100 pb-2">
                {/* Left Block: Company Name or Banner */}
                <div className="flex-1 min-w-0 bg-slate-50 border-l-4 border-blue-600 p-2 rounded-r-lg flex flex-col justify-center min-h-[64px]">
                  {profile.bannerUrl ? (
                    <img
                      src={profile.bannerUrl}
                      alt="Banner"
                      className="w-full h-11 object-contain self-start"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-950 uppercase truncate">{profile.name}</h4>
                      <p className="text-[9px] text-slate-500 leading-tight truncate">{profile.slogan}</p>
                      <p className="text-[8px] text-slate-400 leading-tight font-medium truncate">
                        {profile.email} | {profile.phone}
                      </p>
                      <p className="text-[8px] text-slate-400 leading-tight truncate font-mono">
                        {profile.cnpj ? `CNPJ: ${profile.cnpj} | ` : ''} 
                        {profile.address.city || 'Cidade'}/{profile.address.state || 'UF'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Block: Simulated OS Info Box */}
                <div className="w-20 shrink-0 bg-slate-100 border border-slate-200 rounded-lg p-1.5 flex flex-col justify-center items-center text-center text-[8px] gap-0.5">
                  <span className="font-bold text-slate-500 block text-[7px]">DOCUMENTO</span>
                  <span className="font-bold text-blue-700 text-[10px] block font-mono">N° OS-2026</span>
                  <span className="text-slate-500 font-mono text-[7px]">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Mini address display below if banner is present */}
              {profile.bannerUrl && (
                <div className="bg-blue-50/50 rounded-lg p-2 text-[8px] text-slate-600 space-y-0.5 font-medium">
                  <div className="font-bold text-blue-800 flex items-center gap-1">
                    <MapPin size={8} /> Endereço cadastrado na OS:
                  </div>
                  <div>
                    {profile.address.street ? `${profile.address.street}, ${profile.address.number}` : 'Rua não cadastrada'} 
                    {profile.address.complement ? ` - ${profile.address.complement}` : ''}
                  </div>
                  <div>
                    {profile.address.neighborhood ? `${profile.address.neighborhood} - ` : ''}
                    {profile.address.city || 'Cidade'}/{profile.address.state || 'UF'} - CEP: {profile.address.cep || '00000-000'}
                  </div>
                  {profile.cnpj && (
                    <div className="font-mono text-slate-500 pt-0.5 border-t border-blue-100/50">
                      CNPJ Empresa: {profile.cnpj}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
