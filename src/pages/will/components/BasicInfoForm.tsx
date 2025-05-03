
import React from 'react';
import { TextInput, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInfoFormProps {
  form: any;
}

export function BasicInfoForm({ form }: BasicInfoFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Personal Information</h2>
      <p className="text-gray-600 mb-4">
        This information will be used to identify you as the testator (the person writing the will).
      </p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Legal Name</Label>
            <TextInput
              id="fullName"
              placeholder="Enter your full legal name"
              value={form.values.personalInfo.fullName}
              onChange={(e) => form.setFieldValue('personalInfo.fullName', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <TextInput
              id="dateOfBirth"
              type="date"
              value={form.values.personalInfo.dateOfBirth}
              onChange={(e) => form.setFieldValue('personalInfo.dateOfBirth', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Home Address</Label>
            <TextInput
              id="address"
              placeholder="Enter your current home address"
              value={form.values.personalInfo.address}
              onChange={(e) => form.setFieldValue('personalInfo.address', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={form.values.personalInfo.email}
              onChange={(e) => form.setFieldValue('personalInfo.email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <TextInput
              id="phone"
              placeholder="Enter your phone number"
              value={form.values.personalInfo.phone}
              onChange={(e) => form.setFieldValue('personalInfo.phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select
              id="maritalStatus"
              value={form.values.personalInfo.maritalStatus}
              onValueChange={(value) => form.setFieldValue('personalInfo.maritalStatus', value)}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ]}
              placeholder="Select your marital status"
            />
          </div>
          
          {form.values.personalInfo.maritalStatus === 'married' && (
            <div className="space-y-2">
              <Label htmlFor="spouseName">Spouse's Name</Label>
              <TextInput
                id="spouseName"
                placeholder="Enter your spouse's full name"
                value={form.values.personalInfo.spouseName}
                onChange={(e) => form.setFieldValue('personalInfo.spouseName', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
