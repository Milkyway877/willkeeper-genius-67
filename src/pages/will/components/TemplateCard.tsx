
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

type TemplateProps = {
  template: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tags: string[];
    sample?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
};

export function TemplateCard({ template, isSelected, onSelect }: TemplateProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Generate a more comprehensive will preview for the preview dialog
  const getDetailedPreview = (templateId: string): string => {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    switch(templateId) {
      case 'traditional':
        return `LAST WILL AND TESTAMENT OF JOHN DOE

I, John Doe, residing at 123 Main Street, Anytown, USA, being of sound mind, declare this to be my Last Will and Testament, hereby revoking all previous wills and codicils made by me.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am married to Jane Doe. We have two children: James Doe and Jessica Doe.

ARTICLE III: EXECUTOR
I appoint my spouse, Jane Doe, as the Executor of this Will. If they are unable or unwilling to serve, I appoint my brother, Michael Doe, as alternate Executor.

ARTICLE IV: GUARDIAN
If my spouse does not survive me, I appoint my sister, Sarah Smith, as guardian of my minor children.

ARTICLE V: DISPOSITION OF PROPERTY
I give all my property, real and personal, to my spouse, Jane Doe, if they survive me.
If my spouse does not survive me, I give all my property in equal shares to my children, James Doe and Jessica Doe.

ARTICLE VI: SPECIFIC BEQUESTS
I give my collection of books to my brother, Michael Doe.
I give my grandfather's pocket watch to my son, James Doe.
I give my jewelry collection to my daughter, Jessica Doe.

ARTICLE VII: DIGITAL ASSETS
I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets, including but not limited to email accounts, social media accounts, financial accounts, and digital files.

ARTICLE VIII: TAXES AND EXPENSES
I direct my Executor to pay all just debts, funeral expenses, and costs of administering my estate from the residue of my estate.

ARTICLE IX: NO-CONTEST CLAUSE
If any beneficiary under this Will contests this Will or any provision herein, then any share or interest in my estate given to the contesting beneficiary under this Will is revoked and shall be disposed of as if the contesting beneficiary had predeceased me.

IN WITNESS WHEREOF, I have signed this Will on ${today}.

__________________________
John Doe, Testator

WITNESSES:
The foregoing instrument was signed, published and declared by the above-named Testator as their Last Will, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto, believing said Testator to be of sound mind and memory.

__________________________
Witness 1 Name
Address: 456 Oak Street, Anytown, USA

__________________________
Witness 2 Name
Address: 789 Pine Avenue, Anytown, USA

SELF-PROVING AFFIDAVIT
STATE OF ________________
COUNTY OF _______________

Before me, the undersigned authority, on this day personally appeared John Doe, Witness 1, and Witness 2, known to me to be the Testator and the witnesses, respectively, whose names are signed to the attached or foregoing instrument, and, all being duly sworn, the Testator declared to me and to the witnesses that the attached or foregoing instrument is their Last Will and Testament, and that they had willingly signed and executed it as their free and voluntary act for the purposes therein expressed. Each of the witnesses stated that they signed the Will as witness in the presence and at the request of the Testator and in the presence of each other.

__________________________
John Doe, Testator

__________________________
Witness 1

__________________________
Witness 2

Subscribed, sworn to, and acknowledged before me by John Doe, Testator, and subscribed and sworn to before me by Witness 1 and Witness 2, witnesses, this ______ day of ____________, 20____.

(SEAL)

__________________________
Notary Public
My commission expires: _______________`;
      
      case 'living-trust':
        return `REVOCABLE LIVING TRUST
OF JOHN DOE

THIS TRUST AGREEMENT is made this ${today}, between JOHN DOE, hereinafter referred to as the "Grantor," and JOHN DOE, hereinafter referred to as the "Trustee."

ARTICLE I: TRUST CREATION
The Grantor hereby transfers and delivers to the Trustee the property described in Schedule A attached hereto, to have and to hold the same, and any other property which the Trustee may hereafter at any time receive, IN TRUST NEVERTHELESS, for the uses and purposes and upon the terms and conditions hereinafter set forth.

ARTICLE II: ADDITIONS TO TRUST
The Grantor or any other person may add property to this trust by deed, will, or any other method. The Trustee agrees to accept and hold any such property under the terms of this agreement.

ARTICLE III: DISTRIBUTION DURING GRANTOR'S LIFETIME
During the lifetime of the Grantor, the Trustee shall hold, manage, invest, and reinvest the trust estate, and shall collect the income therefrom and shall pay to the Grantor all of the net income and so much of the principal as the Grantor may request at any time.

ARTICLE IV: DISTRIBUTION UPON GRANTOR'S DEATH
Upon the death of the Grantor, after payment of expenses and taxes, the Trustee shall distribute the remaining trust estate as follows:

1. 50% to my spouse, JANE DOE, if she survives me.
2. 25% to my son, JAMES DOE, if he survives me.
3. 25% to my daughter, JESSICA DOE, if she survives me.
4. If my spouse does not survive me, her share shall be distributed equally among my surviving children.
5. If any of my children do not survive me, their share shall be distributed to their surviving issue, per stirpes.

ARTICLE V: SUCCESSOR TRUSTEES
If I cease to serve as Trustee for any reason, I appoint my spouse, JANE DOE, as Successor Trustee. If she is unable or unwilling to serve, I appoint my brother, MICHAEL DOE, as Second Successor Trustee.

ARTICLE VI: POWERS OF TRUSTEE
The Trustee shall have full power to do everything in administering this Trust that the Trustee deems to be for the best interests of the beneficiaries, including but not limited to:
1. Invest and reinvest the Trust assets
2. Sell, exchange, or lease trust property
3. Borrow money and mortgage or pledge trust assets
4. Compromise claims
5. Make distributions in kind or in cash
6. Employ and compensate agents, attorneys, and accountants

ARTICLE VII: REVOCATION AND AMENDMENT
During the lifetime of the Grantor, this Trust may be revoked in whole or in part by an instrument in writing signed by the Grantor and delivered to the Trustee. The Grantor may amend this Trust at any time by an instrument in writing signed by the Grantor and delivered to the Trustee.

ARTICLE VIII: SPENDTHRIFT PROVISION
No interest in the principal or income of this Trust shall be anticipated, assigned, or encumbered, or subject to any creditor's claim or to legal process, prior to its actual receipt by any beneficiary.

ARTICLE IX: GOVERNING LAW
This Trust Agreement shall be construed and regulated by the laws of the State of ____________.

IN WITNESS WHEREOF, the Grantor and Trustee have signed this Trust Agreement on the day and year first written above.

________________________
JOHN DOE, Grantor

________________________
JOHN DOE, Trustee

[NOTARY ACKNOWLEDGMENT]

SCHEDULE A
PROPERTY TRANSFERRED TO THE TRUST

1. Real Property:
   - Primary Residence: 123 Main Street, Anytown, USA
   - Vacation Home: 456 Beach Road, Seaside, USA

2. Financial Accounts:
   - Checking Account #12345678, First National Bank
   - Savings Account #87654321, First National Bank
   - Investment Account #23456789, ABC Investments

3. Tangible Personal Property:
   - All household furniture and furnishings
   - Art collection
   - Jewelry collection
   - Two automobiles

4. Business Interests:
   - 100% ownership interest in Doe Enterprises, LLC

5. Life Insurance:
   - Life Insurance Policy #LI12345, XYZ Insurance Company

All of the above property is transferred to the Trustee to be held, administered, and distributed in accordance with the terms of this Trust Agreement.`;
      
      case 'digital-assets':
        return `DIGITAL ASSET WILL AND TESTAMENT
OF JOHN DOE

I, John Doe, residing at 123 Main Street, Anytown, USA, being of sound mind, make this Digital Asset Will and Testament to provide for the disposition of my digital assets.

ARTICLE I: APPOINTMENT OF DIGITAL EXECUTOR
I hereby designate and appoint my spouse, Jane Doe, as Digital Executor of this Will. If Jane Doe is unable or unwilling to act, I designate my brother, Michael Doe, to serve as alternate Digital Executor.

ARTICLE II: DIGITAL EXECUTOR POWERS
I grant my Digital Executor full authority to access, handle, distribute, and dispose of my digital assets according to the instructions in this document. My Digital Executor shall have the following powers:

1. Access to Digital Devices:
   - Personal Computer (Password: stored in my password manager)
   - Smartphone (Biometric access to be provided by manufacturer if necessary)
   - Tablet (PIN: stored in my password manager)

2. Authorization to access all my digital accounts, including but not limited to:
   - Email accounts
   - Social media accounts
   - Financial accounts
   - Subscription services
   - Cloud storage accounts
   - Domain name registrations
   - Websites and blogs
   - Digital currency wallets
   - Gaming accounts
   - Loyalty program accounts

3. Authority to manage, transfer, delete, or archive any digital content

4. Power to hire technical specialists if needed to access encrypted or protected data

ARTICLE III: DIGITAL ASSET INVENTORY
A complete inventory of my digital assets is maintained in my password manager account, including account names, URLs, usernames, and access methods. The master password to my password manager has been stored in a secure location known to my Digital Executor.

ARTICLE IV: CRYPTOCURRENCY ASSETS
I own the following cryptocurrency assets:

1. Bitcoin (BTC): Access instructions in my hardware wallet stored in my safe deposit box
2. Ethereum (ETH): Private keys stored in encrypted file on my personal computer
3. Other cryptocurrencies as listed in my digital asset inventory

My Digital Executor is authorized to access these assets and distribute them according to Article V of this document.

ARTICLE V: DISPOSITION OF DIGITAL ASSETS

1. Social Media Accounts:
   - Facebook: Convert to memorial account
   - Instagram: Download all photos and share with immediate family, then delete
   - Twitter: Post final message then delete account
   - LinkedIn: Delete account

2. Email Accounts:
   - Personal email: Archive important messages, then delete account
   - Work email: Notify employer to deactivate

3. Financial Accounts:
   - Online banking: Transfer all funds to my estate
   - Investment accounts: Transfer all assets to my estate
   - PayPal and other payment services: Close after transferring funds

4. Subscription Services:
   - Cancel all recurring subscriptions

5. Digital Media:
   - Digital music: Transfer to my spouse
   - E-books: Transfer to my daughter
   - Digital photos: Share with all immediate family
   - Purchased movies: Transfer to my son

6. Websites and Domains:
   - Personal blog: Preserve as memorial site for 2 years, then archive
   - Domain names: Transfer to my business partner as per separate agreement

7. Cryptocurrency:
   - 50% to my spouse
   - 25% each to my children

8. Digital Gaming Assets:
   - Transfer all gaming accounts to my son

ARTICLE VI: DIGITAL LEGACY INSTRUCTIONS
I wish for my Digital Executor to create memorial posts on my active social media accounts to inform friends and connections of my passing, with the following message:
"This account belongs to John Doe, who has passed away. His family appreciates your friendship and respects your privacy during this time."

ARTICLE VII: DATA PRIVACY
I instruct my Digital Executor to maintain the privacy of my personal communications except where necessary to execute the instructions in this will.

ARTICLE VIII: COMPENSATION
My Digital Executor shall be entitled to reasonable compensation for their time and expenses in managing my digital assets.

Signed on ${today}:

_______________________
John Doe

WITNESSED BY:

_______________________
Witness 1

_______________________
Witness 2

[NOTARY ACKNOWLEDGMENT]`;
      
      default:
        return template.sample || "Sample will document content would appear here.";
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          cursor-pointer border rounded-xl p-6 transition-all duration-200
          ${isSelected 
            ? 'border-willtank-500 shadow-md bg-willtank-50' 
            : 'border-gray-200 hover:border-willtank-300 bg-white'}
        `}
        onClick={onSelect}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="h-14 w-14 rounded-full bg-willtank-100 flex items-center justify-center">
            {template.icon}
          </div>
          {isSelected && (
            <div className="bg-willtank-500 text-white h-8 w-8 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-lg mb-2">{template.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-willtank-100 text-willtank-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {template.sample && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </motion.div>

      {/* Enhanced Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{template.title} Preview</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 border border-gray-200 rounded-lg p-6 bg-white">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-willtank-500 rounded-md flex items-center justify-center mr-3">
                  <span className="text-white font-bold">W</span>
                </div>
                <div>
                  <p className="text-willtank-700 font-bold">WILLTANK</p>
                  <p className="text-xs text-gray-500">Legal Document</p>
                </div>
              </div>
              <div className="border-2 border-gray-300 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-400">Document ID</p>
                <p className="text-sm font-mono">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="prose max-w-none whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800 mb-6">
              {getDetailedPreview(template.id)}
            </div>
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button variant="default" onClick={() => {
                setShowPreview(false);
                onSelect();
              }}>Use This Template</Button>
              <Button variant="outline" onClick={() => setShowPreview(false)}>Close Preview</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
