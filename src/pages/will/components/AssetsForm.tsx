
import React from 'react';
import { TextInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash, Plus } from 'lucide-react';

interface AssetsFormProps {
  form: any;
}

export function AssetsForm({ form }: AssetsFormProps) {
  // Real Estate properties
  const addRealEstate = () => {
    const realEstate = [...form.values.assets.realEstate];
    const newId = `re-${Date.now()}`;
    realEstate.push({ id: newId, address: '', description: '', value: '' });
    form.setFieldValue('assets.realEstate', realEstate);
  };
  
  const removeRealEstate = (id: string) => {
    const realEstate = form.values.assets.realEstate.filter((item: any) => item.id !== id);
    form.setFieldValue('assets.realEstate', realEstate);
  };
  
  // Vehicles
  const addVehicle = () => {
    const vehicles = [...form.values.assets.vehicles];
    const newId = `veh-${Date.now()}`;
    vehicles.push({ id: newId, make: '', model: '', year: '', description: '', value: '' });
    form.setFieldValue('assets.vehicles', vehicles);
  };
  
  const removeVehicle = (id: string) => {
    const vehicles = form.values.assets.vehicles.filter((item: any) => item.id !== id);
    form.setFieldValue('assets.vehicles', vehicles);
  };
  
  // Financial accounts
  const addFinancialAccount = () => {
    const accounts = [...form.values.assets.financialAccounts];
    const newId = `acc-${Date.now()}`;
    accounts.push({ id: newId, institution: '', accountType: '', accountNumber: '', description: '' });
    form.setFieldValue('assets.financialAccounts', accounts);
  };
  
  const removeFinancialAccount = (id: string) => {
    const accounts = form.values.assets.financialAccounts.filter((item: any) => item.id !== id);
    form.setFieldValue('assets.financialAccounts', accounts);
  };
  
  // Personal items
  const addPersonalItem = () => {
    const items = [...form.values.assets.personalItems];
    const newId = `item-${Date.now()}`;
    items.push({ id: newId, name: '', description: '', value: '', beneficiary: '' });
    form.setFieldValue('assets.personalItems', items);
  };
  
  const removePersonalItem = (id: string) => {
    const items = form.values.assets.personalItems.filter((item: any) => item.id !== id);
    form.setFieldValue('assets.personalItems', items);
  };
  
  return (
    <div className="space-y-8">
      {/* Real Estate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Real Estate</h3>
          <Button type="button" onClick={addRealEstate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Property
          </Button>
        </div>
        
        {form.values.assets.realEstate.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border border-dashed rounded-md">
            <p className="text-gray-500">No real estate properties added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.values.assets.realEstate.map((property: any, idx: number) => (
              <div key={property.id} className="border p-4 rounded-md relative">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  onClick={() => removeRealEstate(property.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`property-address-${property.id}`}>Property Address</Label>
                    <TextInput
                      id={`property-address-${property.id}`}
                      placeholder="Full property address"
                      value={property.address}
                      onChange={(e) => {
                        const properties = [...form.values.assets.realEstate];
                        properties[idx].address = e.target.value;
                        form.setFieldValue('assets.realEstate', properties);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`property-value-${property.id}`}>Approximate Value</Label>
                    <TextInput
                      id={`property-value-${property.id}`}
                      placeholder="Estimated property value"
                      value={property.value}
                      onChange={(e) => {
                        const properties = [...form.values.assets.realEstate];
                        properties[idx].value = e.target.value;
                        form.setFieldValue('assets.realEstate', properties);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`property-desc-${property.id}`}>Description</Label>
                    <TextInput
                      id={`property-desc-${property.id}`}
                      placeholder="Brief description of the property"
                      value={property.description}
                      onChange={(e) => {
                        const properties = [...form.values.assets.realEstate];
                        properties[idx].description = e.target.value;
                        form.setFieldValue('assets.realEstate', properties);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Vehicles */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Vehicles</h3>
          <Button type="button" onClick={addVehicle} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Vehicle
          </Button>
        </div>
        
        {form.values.assets.vehicles.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border border-dashed rounded-md">
            <p className="text-gray-500">No vehicles added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.values.assets.vehicles.map((vehicle: any, idx: number) => (
              <div key={vehicle.id} className="border p-4 rounded-md relative">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  onClick={() => removeVehicle(vehicle.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-make-${vehicle.id}`}>Make</Label>
                    <TextInput
                      id={`vehicle-make-${vehicle.id}`}
                      placeholder="Vehicle make"
                      value={vehicle.make}
                      onChange={(e) => {
                        const vehicles = [...form.values.assets.vehicles];
                        vehicles[idx].make = e.target.value;
                        form.setFieldValue('assets.vehicles', vehicles);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-model-${vehicle.id}`}>Model</Label>
                    <TextInput
                      id={`vehicle-model-${vehicle.id}`}
                      placeholder="Vehicle model"
                      value={vehicle.model}
                      onChange={(e) => {
                        const vehicles = [...form.values.assets.vehicles];
                        vehicles[idx].model = e.target.value;
                        form.setFieldValue('assets.vehicles', vehicles);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-year-${vehicle.id}`}>Year</Label>
                    <TextInput
                      id={`vehicle-year-${vehicle.id}`}
                      placeholder="Year"
                      value={vehicle.year}
                      onChange={(e) => {
                        const vehicles = [...form.values.assets.vehicles];
                        vehicles[idx].year = e.target.value;
                        form.setFieldValue('assets.vehicles', vehicles);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`vehicle-value-${vehicle.id}`}>Value</Label>
                    <TextInput
                      id={`vehicle-value-${vehicle.id}`}
                      placeholder="Estimated value"
                      value={vehicle.value}
                      onChange={(e) => {
                        const vehicles = [...form.values.assets.vehicles];
                        vehicles[idx].value = e.target.value;
                        form.setFieldValue('assets.vehicles', vehicles);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`vehicle-desc-${vehicle.id}`}>Description</Label>
                    <TextInput
                      id={`vehicle-desc-${vehicle.id}`}
                      placeholder="Additional details"
                      value={vehicle.description}
                      onChange={(e) => {
                        const vehicles = [...form.values.assets.vehicles];
                        vehicles[idx].description = e.target.value;
                        form.setFieldValue('assets.vehicles', vehicles);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Accounts */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Financial Accounts</h3>
          <Button type="button" onClick={addFinancialAccount} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Account
          </Button>
        </div>
        
        {form.values.assets.financialAccounts.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border border-dashed rounded-md">
            <p className="text-gray-500">No financial accounts added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.values.assets.financialAccounts.map((account: any, idx: number) => (
              <div key={account.id} className="border p-4 rounded-md relative">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  onClick={() => removeFinancialAccount(account.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`account-institution-${account.id}`}>Institution</Label>
                    <TextInput
                      id={`account-institution-${account.id}`}
                      placeholder="Financial institution name"
                      value={account.institution}
                      onChange={(e) => {
                        const accounts = [...form.values.assets.financialAccounts];
                        accounts[idx].institution = e.target.value;
                        form.setFieldValue('assets.financialAccounts', accounts);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`account-type-${account.id}`}>Account Type</Label>
                    <TextInput
                      id={`account-type-${account.id}`}
                      placeholder="e.g., Checking, Savings, 401(k)"
                      value={account.accountType}
                      onChange={(e) => {
                        const accounts = [...form.values.assets.financialAccounts];
                        accounts[idx].accountType = e.target.value;
                        form.setFieldValue('assets.financialAccounts', accounts);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`account-number-${account.id}`}>Account Number (Last 4 digits)</Label>
                    <TextInput
                      id={`account-number-${account.id}`}
                      placeholder="Last 4 digits of account"
                      value={account.accountNumber}
                      onChange={(e) => {
                        const accounts = [...form.values.assets.financialAccounts];
                        accounts[idx].accountNumber = e.target.value;
                        form.setFieldValue('assets.financialAccounts', accounts);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`account-desc-${account.id}`}>Description</Label>
                    <TextInput
                      id={`account-desc-${account.id}`}
                      placeholder="Additional details"
                      value={account.description}
                      onChange={(e) => {
                        const accounts = [...form.values.assets.financialAccounts];
                        accounts[idx].description = e.target.value;
                        form.setFieldValue('assets.financialAccounts', accounts);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Personal Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Personal Items</h3>
          <Button type="button" onClick={addPersonalItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
        
        {form.values.assets.personalItems.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border border-dashed rounded-md">
            <p className="text-gray-500">No personal items added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.values.assets.personalItems.map((item: any, idx: number) => (
              <div key={item.id} className="border p-4 rounded-md relative">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  onClick={() => removePersonalItem(item.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                    <TextInput
                      id={`item-name-${item.id}`}
                      placeholder="Name of item"
                      value={item.name}
                      onChange={(e) => {
                        const items = [...form.values.assets.personalItems];
                        items[idx].name = e.target.value;
                        form.setFieldValue('assets.personalItems', items);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`item-value-${item.id}`}>Value</Label>
                    <TextInput
                      id={`item-value-${item.id}`}
                      placeholder="Estimated value"
                      value={item.value}
                      onChange={(e) => {
                        const items = [...form.values.assets.personalItems];
                        items[idx].value = e.target.value;
                        form.setFieldValue('assets.personalItems', items);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`item-beneficiary-${item.id}`}>Intended Beneficiary</Label>
                    <TextInput
                      id={`item-beneficiary-${item.id}`}
                      placeholder="Who should receive this item"
                      value={item.beneficiary}
                      onChange={(e) => {
                        const items = [...form.values.assets.personalItems];
                        items[idx].beneficiary = e.target.value;
                        form.setFieldValue('assets.personalItems', items);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`item-desc-${item.id}`}>Description</Label>
                    <TextInput
                      id={`item-desc-${item.id}`}
                      placeholder="Brief description of the item"
                      value={item.description}
                      onChange={(e) => {
                        const items = [...form.values.assets.personalItems];
                        items[idx].description = e.target.value;
                        form.setFieldValue('assets.personalItems', items);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
