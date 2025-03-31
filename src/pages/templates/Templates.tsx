
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TemplatePreview } from './TemplatePreview';

// Sample template contents
const standardWillContent = `LAST WILL AND TESTAMENT OF [YOUR NAME]

I, [YOUR FULL LEGAL NAME], a resident of [CITY, STATE], being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I - IDENTIFICATION
A. I am married to [SPOUSE NAME].
B. I have [NUMBER] children, namely: [CHILDREN NAMES AND BIRTH DATES].

ARTICLE II - EXECUTOR APPOINTMENT
I appoint [EXECUTOR NAME] as the Executor of this Will. If [EXECUTOR NAME] is unable or unwilling to serve, then I appoint [ALTERNATE EXECUTOR NAME] as the Executor.

ARTICLE III - PAYMENT OF DEBTS
I direct my Executor to pay all my legally enforceable debts, funeral expenses, and expenses of my last illness from my estate.

ARTICLE IV - DISTRIBUTION OF ASSETS
A. Specific Bequests: I give and bequeath the following specific gifts:
   1. To [RECIPIENT NAME]: [SPECIFIC ITEM/AMOUNT]
   2. To [RECIPIENT NAME]: [SPECIFIC ITEM/AMOUNT]

B. Residuary Estate: I give, devise, and bequeath all the rest, residue, and remainder of my estate to [PRIMARY BENEFICIARY], if they survive me. If [PRIMARY BENEFICIARY] does not survive me, then I give, devise, and bequeath my residuary estate to [CONTINGENT BENEFICIARY/BENEFICIARIES].

ARTICLE V - GUARDIAN FOR MINOR CHILDREN
If I am survived by minor children, I appoint [GUARDIAN NAME] as Guardian of the person and property of my minor children. If [GUARDIAN NAME] is unable or unwilling to serve, I appoint [ALTERNATE GUARDIAN NAME] as Guardian.

ARTICLE VI - MISCELLANEOUS PROVISIONS
A. Powers of Executor: My Executor shall have full authority to sell, lease, mortgage, or otherwise manage my estate without court approval.
B. No Bond Required: No bond shall be required of any Executor or Guardian named in this Will.
C. Simultaneous Death: If any beneficiary dies within 30 days after my death, they shall be deemed to have predeceased me.

IN WITNESS WHEREOF, I have signed this Will on [DATE].

[SIGNATURE]

WITNESS ATTESTATION
The foregoing instrument was signed, published, and declared by [YOUR NAME] as their Last Will, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.

[WITNESS 1 SIGNATURE]
[WITNESS 1 PRINTED NAME AND ADDRESS]

[WITNESS 2 SIGNATURE]
[WITNESS 2 PRINTED NAME AND ADDRESS]`;

const digitalAssetsWillContent = `LAST WILL AND TESTAMENT OF [YOUR NAME]

I, [YOUR FULL LEGAL NAME], a resident of [CITY, STATE], being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I - IDENTIFICATION
A. I am married to [SPOUSE NAME].
B. I have [NUMBER] children, namely: [CHILDREN NAMES AND BIRTH DATES].

ARTICLE II - EXECUTOR & DIGITAL EXECUTOR APPOINTMENT
A. Primary Executor: I appoint [EXECUTOR NAME] as the Executor of this Will.
B. Digital Executor: I appoint [DIGITAL EXECUTOR NAME] as the Digital Executor specifically responsible for managing my digital assets and accounts. The Digital Executor shall work under the supervision of my Primary Executor.

ARTICLE III - DIGITAL ASSETS INVENTORY & ACCESS
A. Digital Assets Inventory: I maintain a secure inventory of my digital assets. The most current version can be accessed through [ACCESS METHOD].

B. Digital Assets include:
   1. Cryptocurrency holdings in [WALLET/EXCHANGE NAMES]
   2. NFT collections stored in [WALLET ADDRESSES]
   3. Online financial accounts at [INSTITUTIONS]
   4. Cloud storage containing [CONTENT DESCRIPTION]
   5. Social media accounts: [LIST PLATFORMS]
   6. Email accounts: [LIST PROVIDERS]
   7. Domain names and websites: [LIST DOMAINS]
   8. Online subscription services: [LIST SERVICES]
   9. Digital media libraries: [LIST SERVICES]
   10. Gaming accounts and virtual assets: [LIST PLATFORMS]

C. Access Instructions: My Digital Executor shall follow the detailed access instructions provided in my Digital Assets Management Plan stored [LOCATION] or provided to my attorney.

ARTICLE IV - DISTRIBUTION OF DIGITAL ASSETS
A. Cryptocurrency & Digital Investments: I direct my Digital Executor to transfer my cryptocurrency holdings and digital investments as follows:
   1. [ASSET/AMOUNT] to [BENEFICIARY]
   2. [ASSET/AMOUNT] to [BENEFICIARY]

B. Social Media & Online Accounts:
   1. My [PLATFORM] account shall be [MEMORIALIZED/DELETED] according to the platform's policies
   2. My [PLATFORM] account shall be transferred to [BENEFICIARY] if permitted
   3. All other accounts shall be closed unless specifically designated for transfer

C. Digital Media & Intellectual Property:
   1. My digital photos shall be shared with [BENEFICIARIES]
   2. My purchased digital media (music, movies, books) shall transfer to [BENEFICIARY] where platform terms permit
   3. Digital intellectual property rights (including copyrights) shall be transferred to [BENEFICIARY]

ARTICLE V - DIGITAL LEGACY INSTRUCTIONS
A. I direct my Digital Executor to create memorial posts on [PLATFORMS] with the following message: [MESSAGE].
B. I authorize my Digital Executor to download and preserve [SPECIFIC DIGITAL CONTENT] for historical and sentimental purposes.
C. I request the following digital memorialization services be utilized: [SERVICES].

ARTICLE VI - POWERS OF DIGITAL EXECUTOR
My Digital Executor shall have full authority to:
A. Access, control, deactivate, and delete my digital accounts
B. Obtain, transfer, and convert my digital assets
C. Hire technical specialists if necessary to access encrypted or protected data
D. Make decisions regarding unlisted digital assets in accordance with my known wishes

IN WITNESS WHEREOF, I have signed this Will on [DATE].

[SIGNATURE]

WITNESS ATTESTATION
The foregoing instrument was signed, published, and declared by [YOUR NAME] as their Last Will, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.

[WITNESS 1 SIGNATURE]
[WITNESS 1 PRINTED NAME AND ADDRESS]

[WITNESS 2 SIGNATURE]
[WITNESS 2 PRINTED NAME AND ADDRESS]`;

const livingTrustContent = `DECLARATION OF TRUST

THIS DECLARATION OF TRUST is made this [DATE] by [YOUR FULL LEGAL NAME] (the "Grantor" and initial "Trustee").

ARTICLE I - ESTABLISHMENT OF TRUST
A. Trust Name: This Trust shall be known as the [YOUR NAME] LIVING TRUST.
B. Trust Property: The Grantor transfers and assigns to the Trustee the property listed in Schedule A, attached hereto, to be held in trust according to this Declaration.
C. Additional Property: The Grantor may add property to the Trust during the Grantor's lifetime.

ARTICLE II - TRUST ADMINISTRATION DURING GRANTOR'S LIFETIME
A. Rights Reserved: During the Grantor's lifetime, the Grantor reserves the right to:
   1. Add property to the Trust
   2. Withdraw property from the Trust
   3. Amend or revoke this Trust in whole or in part
   4. Direct the disposition of Trust income and principal
B. Revocation: This Trust may be revoked in whole or in part by the Grantor by written instrument delivered to the Trustee.
C. Amendment: This Trust may be amended by the Grantor by written instrument delivered to the Trustee.
D. Grantor's Incapacity: If the Grantor becomes incapacitated, as defined herein, the Successor Trustee shall manage the Trust for the Grantor's benefit.

ARTICLE III - SUCCESSOR TRUSTEES
A. Appointment: Upon the death, resignation, or incapacity of the Grantor as Trustee, [SUCCESSOR TRUSTEE NAME] shall serve as Successor Trustee.
B. Alternate Successor Trustee: If [SUCCESSOR TRUSTEE NAME] cannot serve, [ALTERNATE SUCCESSOR TRUSTEE NAME] shall serve as Successor Trustee.
C. Powers of Successor Trustee: The Successor Trustee shall have all powers granted to the original Trustee.

ARTICLE IV - DISTRIBUTION UPON GRANTOR'S DEATH
A. Payment of Expenses: The Trustee shall pay all expenses of the Grantor's last illness, funeral, and just debts.
B. Specific Distributions:
   1. To [BENEFICIARY]: [SPECIFIC ITEM/AMOUNT]
   2. To [BENEFICIARY]: [SPECIFIC ITEM/AMOUNT]
C. Residuary Distribution: The remaining Trust property shall be distributed to [PRIMARY BENEFICIARY/BENEFICIARIES].
D. Contingent Beneficiaries: If any primary beneficiary fails to survive the Grantor, their share shall pass to [CONTINGENT BENEFICIARY/BENEFICIARIES].

ARTICLE V - TRUST ADMINISTRATION PROVISIONS
A. Spendthrift Provision: No beneficiary may assign, transfer, encumber, or otherwise dispose of any interest in the Trust income or principal prior to actual distribution.
B. Rule Against Perpetuities: Despite any other provision in this Trust, the Trust shall terminate no later than 21 years after the death of the last surviving beneficiary who is living at the time of the Grantor's death.
C. Trust for Minor Beneficiaries: Any distribution to a beneficiary under age 25 shall be held in a separate trust until they reach age 25, with the Trustee authorized to use income and principal for the beneficiary's health, education, maintenance, and support.

ARTICLE VI - TRUSTEE POWERS
The Trustee shall have all powers provided by law, including but not limited to:
A. Manage, sell, lease, or mortgage Trust property
B. Invest Trust assets
C. Make tax elections
D. Hire professionals to assist in Trust administration
E. Distribute or divide property in kind or in money
F. Resolve disputes through mediation or arbitration

IN WITNESS WHEREOF, I have signed this Declaration of Trust on [DATE].

[GRANTOR SIGNATURE]
[GRANTOR PRINTED NAME]

ACKNOWLEDGMENT
STATE OF [STATE]
COUNTY OF [COUNTY]

On [DATE], before me, [NOTARY NAME], Notary Public, personally appeared [GRANTOR NAME], who proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument and acknowledged to me that he/she executed the same in his/her authorized capacity, and that by his/her signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.

I certify under PENALTY OF PERJURY under the laws of the State of [STATE] that the foregoing paragraph is true and correct.

WITNESS my hand and official seal.

[NOTARY SIGNATURE]
[NOTARY SEAL]

SCHEDULE A
[LIST OF PROPERTY TRANSFERRED TO THE TRUST]`;

export default function Templates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSelectTemplate = (templateType: string) => {
    toast({
      title: "Template Selected",
      description: `You've selected the ${templateType} template. Let's create your will now.`,
    });
    
    // Navigate to will creation page with template type
    navigate('/will/new?template=' + templateType);
  };
  
  return (
    <Layout>
      <div className="container py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Choose Your Will Template</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the template that best suits your needs. Each template is legally sound and
            customizable to your specific situation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TemplatePreview
            title="Standard Will"
            description="A comprehensive will covering all basic estate planning needs."
            features={[
              "Property distribution to chosen beneficiaries",
              "Executor appointment",
              "Guardian designation for minor children",
              "Specific bequests for personal items",
              "Simplified probate process"
            ]}
            sampleContent={standardWillContent}
            onSelect={() => handleSelectTemplate('standard')}
            popularTemplate={true}
          />
          
          <TemplatePreview
            title="Digital Assets Will"
            description="Specialized for those with significant online assets and accounts."
            features={[
              "Cryptocurrency and NFT distribution",
              "Digital executor appointment",
              "Password and access management",
              "Social media account instructions",
              "Digital intellectual property provisions"
            ]}
            sampleContent={digitalAssetsWillContent}
            onSelect={() => handleSelectTemplate('digital')}
          />
          
          <TemplatePreview
            title="Living Trust"
            description="Comprehensive estate plan that avoids probate and provides privacy."
            features={[
              "Probate avoidance",
              "Enhanced privacy protection",
              "Smooth property transfer",
              "Incapacity planning",
              "Successor trustee designation"
            ]}
            sampleContent={livingTrustContent}
            onSelect={() => handleSelectTemplate('living-trust')}
          />
          
          <TemplatePreview
            title="Charitable Will"
            description="For those wishing to leave a lasting legacy through charitable giving."
            features={[
              "Charitable organization bequests",
              "Tax-optimized giving strategies",
              "Endowment options",
              "Family foundation establishment",
              "Donor advised fund provisions"
            ]}
            sampleContent={standardWillContent.replace("DISTRIBUTION OF ASSETS", "CHARITABLE DISTRIBUTIONS")}
            onSelect={() => handleSelectTemplate('charitable')}
          />
          
          <TemplatePreview
            title="Business Succession Will"
            description="Designed for business owners planning ownership transitions."
            features={[
              "Business valuation guidance",
              "Ownership transfer mechanisms",
              "Key employee provisions",
              "Buy-sell agreement integration",
              "Family business transition planning"
            ]}
            sampleContent={standardWillContent.replace("DISTRIBUTION OF ASSETS", "BUSINESS SUCCESSION PLAN")}
            onSelect={() => handleSelectTemplate('business')}
          />
          
          <TemplatePreview
            title="Pet Trust Will"
            description="For ensuring continued care for your beloved pets."
            features={[
              "Pet guardian designation",
              "Detailed care instructions",
              "Funding for pet expenses",
              "Veterinary care provisions",
              "Transitional care arrangements"
            ]}
            sampleContent={standardWillContent.replace("DISTRIBUTION OF ASSETS", "PET CARE TRUST")}
            onSelect={() => handleSelectTemplate('pet')}
          />
        </div>
      </div>
    </Layout>
  );
}
