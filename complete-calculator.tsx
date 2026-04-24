'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const municipiosByRegion = {
  "Andalucía": ["Sevilla", "Málaga", "Córdoba", "Granada", "Almería", "Jaén", "Cádiz", "Huelva", "Jerez de la Frontera", "Dos Hermanas", "Marbella", "Algeciras", "Torremolinos", "Fuengirola", "Benalmádena"],
  "Aragón": ["Zaragoza", "Huesca", "Teruel", "Calatayud", "Monzón", "Barbastro", "Ejea de los Caballeros", "Utebo", "Alcañiz", "Fraga", "Jaca", "Sabiñánigo", "Tarazona", "Caspe", "Binéfar"],
  "Asturias": ["Oviedo", "Gijón", "Avilés", "Siero", "Langreo", "Mieres", "Castrillón", "Cangas del Narcea", "Gozón", "Valdés", "Tineo", "Llanes", "Ribadesella", "Cudillero", "Navia"],
  "Islas Baleares": ["Palma", "Ibiza", "Mahón", "Manacor", "Calviá", "Llucmajor", "Marratxí", "Inca", "Ciutadella", "Alcúdia", "Felanitx", "Sant Antoni de Portmany", "Pollença", "Sóller", "Artà"],
  "Canarias": ["Las Palmas de Gran Canaria", "Santa Cruz de Tenerife", "La Laguna", "Telde", "Arrecife", "Puerto del Rosario", "Arona", "Adeje", "Santa Lucía de Tirajana", "Mogán", "Granadilla de Abona", "San Bartolomé de Tirajana", "Ingenio", "Agüimes", "Gáldar"],
  "Cantabria": ["Santander", "Torrelavega", "Castro-Urdiales", "Camargo", "El Astillero", "Piélagos", "Santa Cruz de Bezana", "Laredo", "Colindres", "Reinosa", "San Vicente de la Barquera", "Santoña", "Noja", "Corvera de Toranzo", "Medio Cudeyo"],
  "Castilla-La Mancha": ["Toledo", "Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Talavera de la Reina", "Puertollano", "Almansa", "Alcázar de San Juan", "Valdepeñas", "Hellín", "Azuqueca de Henares", "La Roda", "Socuéllamos", "Tomelloso"],
  "Castilla y León": ["Valladolid", "Burgos", "Salamanca", "León", "Segovia", "Ávila", "Soria", "Palencia", "Zamora", "Miranda de Ebro", "Ponferrada", "San Andrés del Rabanedo", "Laguna de Duero", "Aranda de Duero", "Béjar"],
  "Cataluña": ["Barcelona", "Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Lleida", "Tarragona", "Mataró", "Santa Coloma de Gramenet", "Reus", "Girona", "Sant Cugat del Vallès", "Cornellà de Llobregat", "Sant Boi de Llobregat", "El Prat de Llobregat"],
  "Comunidad Valenciana": ["Valencia", "Alicante", "Castellón de la Plana", "Elche", "Torrent", "Orihuela", "Benidorm", "Gandia", "Paterna", "Sagunto", "Torrevieja", "Elda", "Petrer", "Alzira", "Alcoy"],
  "Extremadura": ["Badajoz", "Cáceres", "Mérida", "Plasencia", "Don Benito", "Almendralejo", "Villanueva de la Serena", "Navalmoral de la Mata", "Zafra", "Montijo", "Miajadas", "Azuaga", "Coria", "Jerez de los Caballeros", "Olivenza"],
  "Galicia": ["Vigo", "A Coruña", "Ourense", "Lugo", "Santiago de Compostela", "Pontevedra", "Ferrol", "Orense", "Vilagarcía de Arousa", "Cangas", "Redondela", "Narón", "Oleiros", "Cambre", "Culleredo"],
  "La Rioja": ["Logroño", "Calahorra", "Arnedo", "Haro", "Alfaro", "Nájera", "Santo Domingo de la Calzada", "Rincón de Soto", "Lardero", "Villamediana de Iregua", "Cenicero", "Ezcaray", "Autol", "Cervera del Río Alhama", "Pradejón"],
  "Madrid": ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón", "Torrejón de Ardoz", "Parla", "Alcobendas", "Las Rozas", "San Sebastián de los Reyes", "Pozuelo de Alarcón", "Tres Cantos", "Coslada"],
  "Murcia": ["Murcia", "Cartagena", "Lorca", "Molina de Segura", "Alcantarilla", "Mazarrón", "Águilas", "Yecla", "Jumilla", "Cieza", "Torre-Pacheco", "San Javier", "Los Alcázares", "Puerto Lumbreras", "Totana"],
  "Navarra": ["Pamplona", "Tudela", "Barañáin", "Burlada", "Estella", "Tafalla", "Zizur Mayor", "Ansoáin", "Berriozar", "Noáin", "Villava", "Huarte", "Sarriguren", "Alsasua", "Sangüesa"],
  "País Vasco": ["Bilbao", "Vitoria-Gasteiz", "San Sebastián", "Barakaldo", "Getxo", "Irún", "Santurtzi", "Basauri", "Errenteria", "Leioa", "Galdakao", "Sestao", "Portugalete", "Durango", "Amorebieta-Etxano"]
};

const autonomousCommunities = Object.keys(municipiosByRegion);

export default function CalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    autonomousCommunity: '',
    municipality: '',
    installationSize: '',
    propertyType: '',
    installationCost: '',
    isInstalled: '',
    hasBatteries: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    isOwner: '',
    isSpanishTaxResident: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [municipalityOptions, setMunicipalityOptions] = useState<string[]>([]);

  useEffect(() => {
    if (formData.autonomousCommunity) {
      const options = municipiosByRegion[formData.autonomousCommunity] || [];
      setMunicipalityOptions(options);
      if (formData.municipality && !options.includes(formData.municipality)) {
        setFormData(prev => ({ ...prev, municipality: '' }));
      }
    } else {
      setMunicipalityOptions([]);
      setFormData(prev => ({ ...prev, municipality: '' }));
    }
  }, [formData.autonomousCommunity]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.autonomousCommunity) newErrors.autonomousCommunity = 'Selecciona tu comunidad autónoma';
      if (!formData.municipality) newErrors.municipality = 'Selecciona un municipio';
      const size = parseFloat(formData.installationSize);
      if (!formData.installationSize || isNaN(size)) {
        newErrors.installationSize = 'Introduce un tamaño válido';
      } else if (size < 1 || size > 100) {
        newErrors.installationSize = 'El tamaño debe estar entre 1 y 100 kWp';
      }
    } else if (stepNumber === 2) {
      if (!formData.propertyType) newErrors.propertyType = 'Selecciona el tipo de propiedad';
      const cost = parseFloat(formData.installationCost);
      if (!formData.installationCost || isNaN(cost)) {
        newErrors.installationCost = 'Introduce un coste válido';
      } else if (cost < 2000 || cost > 200000) {
        newErrors.installationCost = 'El coste debe estar entre €2.000 y €200.000';
      }
      if (!formData.isInstalled) newErrors.isInstalled = 'Selecciona una opción';
      if (!formData.hasBatteries) newErrors.hasBatteries = 'Selecciona una opción';
    } else if (stepNumber === 3) {
      if (!formData.fullName || formData.fullName.length < 2) {
        newErrors.fullName = 'Introduce un nombre válido';
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/.test(formData.fullName)) {
        newErrors.fullName = 'Introduce un nombre válido (solo letras y espacios)';
      }
      if (!formData.phone) {
        newErrors.phone = 'Introduce un teléfono';
      } else if (!/^[6789]\d{8}$/.test(formData.phone)) {
        newErrors.phone = 'Introduce un teléfono español válido (9 dígitos, empieza por 6,7,8 o 9)';
      }
      if (!formData.email) {
        newErrors.email = 'Introduce un email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Introduce un email válido';
      }
      if (!formData.address || formData.address.length < 10) {
        newErrors.address = 'Introduce tu dirección completa (mínimo 10 caracteres)';
      }
      if (!formData.postalCode) {
        newErrors.postalCode = 'Introduce un código postal';
      } else if (!/^\d{5}$/.test(formData.postalCode)) {
        newErrors.postalCode = 'Introduce un código postal válido (5 dígitos)';
      }
      if (!formData.isOwner) newErrors.isOwner = 'Selecciona una opción';
      if (!formData.isSpanishTaxResident) newErrors.isSpanishTaxResident = 'Selecciona una opción';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      const calculationData = {
        clientName: formData.fullName,
        email: formData.email,
        propertyType: formData.propertyType,
        municipality: formData.municipality,
        autonomousCommunity: formData.autonomousCommunity,
        installationSizeKwp: parseFloat(formData.installationSize),
        installationCostEur: parseFloat(formData.installationCost),
        isInstalled: formData.isInstalled === 'Sí',
        hasBatteries: formData.hasBatteries === 'Sí',
        isOwner: formData.isOwner === 'Sí',
        isSpanishTaxResident: formData.isSpanishTaxResident === 'Sí',
        calculationDate: new Date().toLocaleDateString('es-ES')
      };
      
      sessionStorage.setItem('subsidia_calculation_data', JSON.stringify(calculationData));
      router.push('/resultados');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNum ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-16 h-1 ${step > stepNum ? 'bg-amber-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="p-8 shadow-lg">
          {renderStepIndicator()}
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Ubicación e instalación</h2>
                <p className="text-slate-600 mt-2">Primero, dinos dónde está tu propiedad y el tamaño de la instalación.</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="autonomousCommunity" className="text-slate-700 font-medium">
                    Comunidad Autónoma *
                  </Label>
                  <Select
                    value={formData.autonomousCommunity}
                    onValueChange={(value) => {
                      handleInputChange('autonomousCommunity', value);
                      handleInputChange('municipality', '');
                    }}
                  >
                    <SelectTrigger className={`w-full ${errors.autonomousCommunity ? 'border-red-300 bg-red-50' : ''}`}>
                      <SelectValue placeholder="Selecciona tu comunidad autónoma" />
                    </SelectTrigger>
                    <SelectContent>
                      {autonomousCommunities.map((community) => (
                        <SelectItem key={community} value={community}>
                          {community}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.autonomousCommunity && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.autonomousCommunity}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="municipality" className="text-slate-700 font-medium">
                    Municipio *
                  </Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) => handleInputChange('municipality', value)}
                    disabled={!formData.autonomousCommunity}
                  >
                    <SelectTrigger className={`w-full ${errors.municipality ? 'border-red-300 bg-red-50' : ''} ${!formData.autonomousCommunity ? 'opacity-50' : ''}`}>
                      <SelectValue placeholder={formData.autonomousCommunity ? "Selecciona tu municipio" : "Primero selecciona comunidad autónoma"} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalityOptions.map((municipio) => (
                        <SelectItem key={municipio} value={municipio}>
                          {municipio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.municipality && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.municipality}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="installationSize" className="text-slate-700 font-medium">
                    T