import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Car, Banknote, Globe, PlusCircle, Trash2, MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContactField } from './ContactField';
import { Property, Vehicle, FinancialAccount, DigitalAsset } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState("properties");
  
  const handleAddProperty = () => {
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      description: '',
      address: '',
      ownershipType: '',
      approximateValue: 0,
    };
    onUpdateProperties([...properties, newProperty]);
  };
  
  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      description: '',
      registrationNumber: '',
      approximateValue: 0,
    };
    onUpdateVehicles([...vehicles, newVehicle]);
  };
  
  const handleAddFinancialAccount = () => {
    const newAccount: FinancialAccount = {
      id: `account-${Date.now()}`,
      accountType: '',
      institution: '',
      accountNumber: '',
      approximateValue: 0,
    };
    onUpdateFinancialAccounts([...financialAccounts, newAccount]);
  };
  
  const handleAddDigitalAsset = () => {
    const newDigitalAsset: DigitalAsset = {
      id: `digital-${Date.now()}`,
      description: '',
      accessInformation: '',
      platform: '',
    };
    onUpdateDigitalAssets([...digitalAssets, newDigitalAsset]);
  };
  
  const handleRemoveProperty = (id: string) => {
    onUpdateProperties(properties.filter(p => p.id !== id));
  };
  
  const handleRemoveVehicle = (id: string) => {
    onUpdateVehicles(vehicles.filter(v => v.id !== id));
  };
  
  const handleRemoveFinancialAccount = (id: string) => {
    onUpdateFinancialAccounts(financialAccounts.filter(a => a.id !== id));
  };
  
  const handleRemoveDigitalAsset = (id: string) => {
    onUpdateDigitalAssets(digitalAssets.filter(a => a.id !== id));
  };
  
  const handlePropertyChange = (id: string, field: keyof Property, value: string | number) => {
    onUpdateProperties(properties.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };
  
  const handleVehicleChange = (id: string, field: keyof Vehicle, value: string | number) => {
    onUpdateVehicles(vehicles.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };
  
  const handleFinancialAccountChange = (id: string, field: keyof FinancialAccount, value: string | number) => {
    onUpdateFinancialAccounts(financialAccounts.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };
  
  const handleDigitalAssetChange = (id: string, field: keyof DigitalAsset, value: string | number) => {
    onUpdateDigitalAssets(digitalAssets.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };
  
  // Calculate total assets across all categories
  const totalAssets = [
    ...properties.map(p => p.approximateValue || 0),
    ...vehicles.map(v => v.approximateValue || 0),
    ...financialAccounts.map(a => a.approximateValue || 0),
    ...digitalAssets.map(a => (a.approximateValue || 0))
  ].reduce((sum, value) => sum + value, 0);
  
  const assetCount = properties.length + vehicles.length + financialAccounts.length + digitalAssets.length;
  
  if (!expanded) {
    const displayValue = assetCount > 0 
      ? `${assetCount} Asset${assetCount !== 1 ? 's' : ''} ($${totalAssets.toLocaleString()})`
      : '[Enter assets]';
    const isEmpty = assetCount === 0;
    
    return (
      <span 
        className={`group cursor-pointer inline-flex items-center relative
          ${isEmpty 
            ? 'bg-amber-100 border-b-2 border-dashed border-amber-400 text-amber-800 px-2 py-1 rounded-sm hover:bg-amber-200 transition-colors' 
            : 'hover:bg-gray-100 px-1 rounded border-b border-gray-200 hover:border-gray-400'}`}
        onClick={() => setExpanded(true)}
      >
        {displayValue}
        <span className="absolute -top-5 left-0 text-[10px] bg-amber-50 text-amber-700 font-medium px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-amber-200 shadow-sm whitespace-nowrap">
          Click to edit assets
        </span>
        {isEmpty && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-amber-500 group-hover:animate-pulse">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
        )}
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
    );
  }
  
  return (
    <Card className="mt-4 mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Home className="h-4 w-4" />
            Assets
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="properties" className="text-xs">
              <Home className="h-3 w-3 mr-1" /> Properties
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs">
              <Car className="h-3 w-3 mr-1" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs">
              <Banknote className="h-3 w-3 mr-1" /> Accounts
            </TabsTrigger>
            <TabsTrigger value="digital" className="text-xs">
              <Globe className="h-3 w-3 mr-1" /> Digital
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="space-y-4">
            {properties.map((property, index) => (
              <div key={property.id} className="mb-4 p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Property {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveProperty(property.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ContactField
                    label="Description"
                    value={property.description}
                    onChange={(value) => handlePropertyChange(property.id, 'description', value)}
                    placeholder="e.g. Primary Residence, Vacation Home"
                    onAiHelp={(position) => onAiHelp('property_description', position)}
                  />
                  
                  <ContactField
                    label="Ownership Type"
                    value={property.ownershipType}
                    onChange={(value) => handlePropertyChange(property.id, 'ownershipType', value)}
                    placeholder="e.g. Sole owner, Joint tenant"
                    onAiHelp={(position) => onAiHelp('property_ownership', position)}
                  />
                </div>
                
                <ContactField
                  label="Address"
                  value={property.address}
                  onChange={(value) => handlePropertyChange(property.id, 'address', value)}
                  placeholder="Full property address"
                  onAiHelp={(position) => onAiHelp('property_address', position)}
                  className="mb-4"
                />
                
                <ContactField
                  label="Approximate Value ($)"
                  value={property.approximateValue.toString()}
                  onChange={(value) => handlePropertyChange(property.id, 'approximateValue', Number(value) || 0)}
                  type="text"
                  placeholder="e.g. 250000"
                  onAiHelp={(position) => onAiHelp('property_value', position)}
                />
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddProperty}
              className="text-xs w-full"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Property
            </Button>
          </TabsContent>
          
          <TabsContent value="vehicles" className="space-y-4">
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="mb-4 p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Vehicle {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveVehicle(vehicle.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ContactField
                    label="Description"
                    value={vehicle.description}
                    onChange={(value) => handleVehicleChange(vehicle.id, 'description', value)}
                    placeholder="e.g. 2018 Honda Accord"
                    onAiHelp={(position) => onAiHelp('vehicle_description', position)}
                  />
                  
                  <ContactField
                    label="Registration Number"
                    value={vehicle.registrationNumber}
                    onChange={(value) => handleVehicleChange(vehicle.id, 'registrationNumber', value)}
                    placeholder="e.g. License plate or VIN"
                    onAiHelp={(position) => onAiHelp('vehicle_registration', position)}
                  />
                </div>
                
                <ContactField
                  label="Approximate Value ($)"
                  value={vehicle.approximateValue.toString()}
                  onChange={(value) => handleVehicleChange(vehicle.id, 'approximateValue', Number(value) || 0)}
                  type="text"
                  placeholder="e.g. 15000"
                  onAiHelp={(position) => onAiHelp('vehicle_value', position)}
                />
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddVehicle}
              className="text-xs w-full"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Vehicle
            </Button>
          </TabsContent>
          
          <TabsContent value="accounts" className="space-y-4">
            {financialAccounts.map((account, index) => (
              <div key={account.id} className="mb-4 p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Account {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveFinancialAccount(account.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ContactField
                    label="Account Type"
                    value={account.accountType}
                    onChange={(value) => handleFinancialAccountChange(account.id, 'accountType', value)}
                    placeholder="e.g. Checking, Savings, 401(k)"
                    onAiHelp={(position) => onAiHelp('account_type', position)}
                  />
                  
                  <ContactField
                    label="Institution"
                    value={account.institution}
                    onChange={(value) => handleFinancialAccountChange(account.id, 'institution', value)}
                    placeholder="e.g. Bank of America, Fidelity"
                    onAiHelp={(position) => onAiHelp('account_institution', position)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ContactField
                    label="Account Number (last 4 digits)"
                    value={account.accountNumber}
                    onChange={(value) => handleFinancialAccountChange(account.id, 'accountNumber', value)}
                    placeholder="e.g. xxxx1234"
                    onAiHelp={(position) => onAiHelp('account_number', position)}
                  />
                  
                  <ContactField
                    label="Approximate Value ($)"
                    value={account.approximateValue.toString()}
                    onChange={(value) => handleFinancialAccountChange(account.id, 'approximateValue', Number(value) || 0)}
                    type="text"
                    placeholder="e.g. 50000"
                    onAiHelp={(position) => onAiHelp('account_value', position)}
                  />
                </div>
                
                <ContactField
                  label="Beneficiary Designation"
                  value={account.beneficiaryDesignation || ''}
                  onChange={(value) => handleFinancialAccountChange(account.id, 'beneficiaryDesignation', value)}
                  placeholder="e.g. Spouse as primary beneficiary"
                  onAiHelp={(position) => onAiHelp('account_beneficiary', position)}
                />
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddFinancialAccount}
              className="text-xs w-full"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Financial Account
            </Button>
          </TabsContent>
          
          <TabsContent value="digital" className="space-y-4">
            {digitalAssets.map((asset, index) => (
              <div key={asset.id} className="mb-4 p-3 border border-dashed rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Digital Asset {index + 1}</h4>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveDigitalAsset(asset.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ContactField
                    label="Description"
                    value={asset.description}
                    onChange={(value) => handleDigitalAssetChange(asset.id, 'description', value)}
                    placeholder="e.g. Cryptocurrency, Social Media, Email"
                    onAiHelp={(position) => onAiHelp('digital_description', position)}
                  />
                  
                  <ContactField
                    label="Platform/Provider"
                    value={asset.platform || ''}
                    onChange={(value) => handleDigitalAssetChange(asset.id, 'platform', value)}
                    placeholder="e.g. Facebook, Gmail, Coinbase"
                    onAiHelp={(position) => onAiHelp('digital_platform', position)}
                  />
                </div>
                
                <ContactField
                  label="Access Information"
                  value={asset.accessInformation}
                  onChange={(value) => handleDigitalAssetChange(asset.id, 'accessInformation', value)}
                  placeholder="Where to find login info or instructions"
                  onAiHelp={(position) => onAiHelp('digital_access', position)}
                  className="mb-4"
                />
                
                <ContactField
                  label="Approximate Value ($)"
                  value={(asset.approximateValue || 0).toString()}
                  onChange={(value) => handleDigitalAssetChange(asset.id, 'approximateValue', Number(value) || 0)}
                  type="text"
                  placeholder="e.g. 5000 (if applicable)"
                  onAiHelp={(position) => onAiHelp('digital_value', position)}
                />
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddDigitalAsset}
              className="text-xs w-full"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Digital Asset
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(false)}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
