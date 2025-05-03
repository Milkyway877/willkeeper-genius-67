
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, Car, Landmark, Laptop, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property, Vehicle, FinancialAccount, DigitalAsset } from '../types';

type AssetType = 'property' | 'vehicle' | 'financial' | 'digital';

interface AssetFieldProps {
  properties: Property[];
  vehicles: Vehicle[];
  financialAccounts: FinancialAccount[];
  digitalAssets: DigitalAsset[];
  onUpdateProperties: (properties: Property[]) => void;
  onUpdateVehicles: (vehicles: Vehicle[]) => void;
  onUpdateFinancialAccounts: (accounts: FinancialAccount[]) => void;
  onUpdateDigitalAssets: (assets: DigitalAsset[]) => void;
  onAiHelp: (field: string, position?: { x: number, y: number }) => void;
}

export function AssetField({
  properties,
  vehicles,
  financialAccounts,
  digitalAssets,
  onUpdateProperties,
  onUpdateVehicles,
  onUpdateFinancialAccounts,
  onUpdateDigitalAssets,
  onAiHelp
}: AssetFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetType>('property');

  // Property handlers
  const addProperty = () => {
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      description: '',
      address: '',
      ownershipType: '',
      approximateValue: 0,
      mortgageDetails: '',
      insuranceInfo: ''
    };
    onUpdateProperties([...properties, newProperty]);
  };

  const removeProperty = (id: string) => {
    onUpdateProperties(properties.filter(p => p.id !== id));
  };

  const updateProperty = (id: string, field: keyof Property, value: string | number) => {
    onUpdateProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Vehicle handlers
  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      description: '',
      registrationNumber: '',
      approximateValue: 0,
      loanInfo: '',
      insuranceInfo: ''
    };
    onUpdateVehicles([...vehicles, newVehicle]);
  };

  const removeVehicle = (id: string) => {
    onUpdateVehicles(vehicles.filter(v => v.id !== id));
  };

  const updateVehicle = (id: string, field: keyof Vehicle, value: string | number) => {
    onUpdateVehicles(vehicles.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  // Financial account handlers
  const addFinancialAccount = () => {
    const newAccount: FinancialAccount = {
      id: `fin-${Date.now()}`,
      accountType: '',
      institution: '',
      accountNumber: '',
      approximateValue: 0,
      beneficiaryDesignation: ''
    };
    onUpdateFinancialAccounts([...financialAccounts, newAccount]);
  };

  const removeFinancialAccount = (id: string) => {
    onUpdateFinancialAccounts(financialAccounts.filter(a => a.id !== id));
  };

  const updateFinancialAccount = (id: string, field: keyof FinancialAccount, value: string | number) => {
    onUpdateFinancialAccounts(financialAccounts.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // Digital asset handlers
  const addDigitalAsset = () => {
    const newAsset: DigitalAsset = {
      id: `dig-${Date.now()}`,
      description: '',
      accessInformation: '',
      approximateValue: 0,
      platform: ''
    };
    onUpdateDigitalAssets([...digitalAssets, newAsset]);
  };

  const removeDigitalAsset = (id: string) => {
    onUpdateDigitalAssets(digitalAssets.filter(a => a.id !== id));
  };

  const updateDigitalAsset = (id: string, field: keyof DigitalAsset, value: string | number) => {
    onUpdateDigitalAssets(digitalAssets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // AI help handlers
  const handleAssetAiHelp = (assetType: string, id: string, field: string, e: React.MouseEvent) => {
    onAiHelp(`${assetType}_${field}`, { x: e.clientX, y: e.clientY });
  };

  if (!expanded) {
    const totalAssets = properties.length + vehicles.length + financialAccounts.length + digitalAssets.length;
    
    return (
      <div className="relative group">
        <span 
          className="cursor-pointer border-b border-dashed border-gray-300 hover:border-willtank-400 px-1"
          onClick={() => setExpanded(true)}
        >
          {totalAssets > 0 ? `${totalAssets} asset(s)` : 'Assets & Property'}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAiHelp('asset', { x: e.clientX, y: e.clientY });
                  }}
                >
                  <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Get AI help with assets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      </div>
    );
  }

  return (
    <Card className="mt-4 mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Home className="h-4 w-4" />
            Assets & Property
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => onAiHelp('asset', { x: e.clientX, y: e.clientY })}
                >
                  <MessageCircleQuestion className="h-4 w-4 text-willtank-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Get AI help with assets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AssetType)} className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="property" className="flex items-center gap-2">
              <Home className="h-4 w-4" /> Property
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex items-center gap-2">
              <Car className="h-4 w-4" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" /> Financial
            </TabsTrigger>
            <TabsTrigger value="digital" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" /> Digital
            </TabsTrigger>
          </TabsList>

          {/* Property Tab */}
          <TabsContent value="property" className="space-y-4">
            {properties.map((property, index) => (
              <div key={property.id} className="p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Property {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeProperty(property.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`property-desc-${property.id}`} className="text-xs">Description</Label>
                    <Input 
                      id={`property-desc-${property.id}`}
                      value={property.description} 
                      onChange={(e) => updateProperty(property.id, 'description', e.target.value)}
                      placeholder="e.g. Primary residence, Vacation home"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`property-owner-${property.id}`} className="text-xs">Ownership Type</Label>
                    <Input 
                      id={`property-owner-${property.id}`}
                      value={property.ownershipType} 
                      onChange={(e) => updateProperty(property.id, 'ownershipType', e.target.value)}
                      placeholder="e.g. Sole ownership, Joint tenancy"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor={`property-address-${property.id}`} className="text-xs">Address</Label>
                  <Input 
                    id={`property-address-${property.id}`}
                    value={property.address} 
                    onChange={(e) => updateProperty(property.id, 'address', e.target.value)}
                    placeholder="Full property address"
                    className="h-8 text-sm mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`property-value-${property.id}`} className="text-xs">Approximate Value</Label>
                    <Input 
                      id={`property-value-${property.id}`}
                      type="number"
                      value={property.approximateValue} 
                      onChange={(e) => updateProperty(property.id, 'approximateValue', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 300000"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`property-mortgage-${property.id}`} className="text-xs">Mortgage Details</Label>
                    <Input 
                      id={`property-mortgage-${property.id}`}
                      value={property.mortgageDetails || ''} 
                      onChange={(e) => updateProperty(property.id, 'mortgageDetails', e.target.value)}
                      placeholder="e.g. Bank name, account number"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`property-insurance-${property.id}`} className="text-xs">Insurance Information</Label>
                    <Input 
                      id={`property-insurance-${property.id}`}
                      value={property.insuranceInfo || ''} 
                      onChange={(e) => updateProperty(property.id, 'insuranceInfo', e.target.value)}
                      placeholder="e.g. Insurance company, policy number"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" onClick={addProperty}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Property
            </Button>
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle" className="space-y-4">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Vehicle {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeVehicle(vehicle.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-desc-${vehicle.id}`} className="text-xs">Description</Label>
                    <Input 
                      id={`vehicle-desc-${vehicle.id}`}
                      value={vehicle.description} 
                      onChange={(e) => updateVehicle(vehicle.id, 'description', e.target.value)}
                      placeholder="e.g. 2020 Toyota Camry"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-reg-${vehicle.id}`} className="text-xs">Registration Number</Label>
                    <Input 
                      id={`vehicle-reg-${vehicle.id}`}
                      value={vehicle.registrationNumber} 
                      onChange={(e) => updateVehicle(vehicle.id, 'registrationNumber', e.target.value)}
                      placeholder="e.g. ABC123"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-value-${vehicle.id}`} className="text-xs">Approximate Value</Label>
                    <Input 
                      id={`vehicle-value-${vehicle.id}`}
                      type="number"
                      value={vehicle.approximateValue} 
                      onChange={(e) => updateVehicle(vehicle.id, 'approximateValue', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 15000"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-loan-${vehicle.id}`} className="text-xs">Loan Information</Label>
                    <Input 
                      id={`vehicle-loan-${vehicle.id}`}
                      value={vehicle.loanInfo || ''} 
                      onChange={(e) => updateVehicle(vehicle.id, 'loanInfo', e.target.value)}
                      placeholder="e.g. Bank name, account number"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-insurance-${vehicle.id}`} className="text-xs">Insurance Information</Label>
                    <Input 
                      id={`vehicle-insurance-${vehicle.id}`}
                      value={vehicle.insuranceInfo || ''} 
                      onChange={(e) => updateVehicle(vehicle.id, 'insuranceInfo', e.target.value)}
                      placeholder="e.g. Insurance company, policy number"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" onClick={addVehicle}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Vehicle
            </Button>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            {financialAccounts.map((account, index) => (
              <div key={account.id} className="p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Financial Account {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFinancialAccount(account.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`account-type-${account.id}`} className="text-xs">Account Type</Label>
                    <Input 
                      id={`account-type-${account.id}`}
                      value={account.accountType} 
                      onChange={(e) => updateFinancialAccount(account.id, 'accountType', e.target.value)}
                      placeholder="e.g. Checking, Savings, Investment"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`account-institution-${account.id}`} className="text-xs">Institution</Label>
                    <Input 
                      id={`account-institution-${account.id}`}
                      value={account.institution} 
                      onChange={(e) => updateFinancialAccount(account.id, 'institution', e.target.value)}
                      placeholder="e.g. Bank of America"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`account-number-${account.id}`} className="text-xs">Account Number (last 4 digits)</Label>
                    <Input 
                      id={`account-number-${account.id}`}
                      value={account.accountNumber} 
                      onChange={(e) => updateFinancialAccount(account.id, 'accountNumber', e.target.value)}
                      placeholder="e.g. xxxx1234"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`account-value-${account.id}`} className="text-xs">Approximate Value</Label>
                    <Input 
                      id={`account-value-${account.id}`}
                      type="number"
                      value={account.approximateValue} 
                      onChange={(e) => updateFinancialAccount(account.id, 'approximateValue', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 50000"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`account-beneficiary-${account.id}`} className="text-xs">Beneficiary Designation</Label>
                    <Input 
                      id={`account-beneficiary-${account.id}`}
                      value={account.beneficiaryDesignation || ''} 
                      onChange={(e) => updateFinancialAccount(account.id, 'beneficiaryDesignation', e.target.value)}
                      placeholder="e.g. Spouse, Child"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" onClick={addFinancialAccount}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Financial Account
            </Button>
          </TabsContent>

          {/* Digital Tab */}
          <TabsContent value="digital" className="space-y-4">
            {digitalAssets.map((asset, index) => (
              <div key={asset.id} className="p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Digital Asset {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeDigitalAsset(asset.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`digital-desc-${asset.id}`} className="text-xs">Description</Label>
                    <Input 
                      id={`digital-desc-${asset.id}`}
                      value={asset.description} 
                      onChange={(e) => updateDigitalAsset(asset.id, 'description', e.target.value)}
                      placeholder="e.g. Cryptocurrency, Domain names"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`digital-platform-${asset.id}`} className="text-xs">Platform</Label>
                    <Input 
                      id={`digital-platform-${asset.id}`}
                      value={asset.platform || ''} 
                      onChange={(e) => updateDigitalAsset(asset.id, 'platform', e.target.value)}
                      placeholder="e.g. Coinbase, GoDaddy"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`digital-access-${asset.id}`} className="text-xs">Access Information</Label>
                    <Input 
                      id={`digital-access-${asset.id}`}
                      value={asset.accessInformation} 
                      onChange={(e) => updateDigitalAsset(asset.id, 'accessInformation', e.target.value)}
                      placeholder="e.g. Located in password manager"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`digital-value-${asset.id}`} className="text-xs">Approximate Value</Label>
                    <Input 
                      id={`digital-value-${asset.id}`}
                      type="number"
                      value={asset.approximateValue || 0} 
                      onChange={(e) => updateDigitalAsset(asset.id, 'approximateValue', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 5000"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" onClick={addDigitalAsset}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Digital Asset
            </Button>
          </TabsContent>
        </Tabs>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(false)}
          className="text-xs mt-4"
        >
          Done
        </Button>
      </CardContent>
    </Card>
  );
}
