
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Parse request body
    const { query, conversation_history } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({
        error: "Missing query parameter"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Log the received query
    console.log("Processing query:", query);
    
    let authHeader = req.headers.get('Authorization');
    let userId = null;
    
    // Verify authentication if present
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        console.log("Authenticated user:", userId);
      }
    }
    
    // Enhanced AI response based on comprehensive WillTank knowledge
    let response = '';
    const lowerQuery = query.toLowerCase();
    
    // Extract current page context if provided
    const pageMatch = query.match(/\[Current page: ([^\]]+)\]/);
    const currentPage = pageMatch ? pageMatch[1] : '';
    
    // Route-specific responses
    if (currentPage.includes('/dashboard')) {
      if (lowerQuery.includes('tank') || lowerQuery.includes('message')) {
        response = "I see you're on your dashboard! The Tank is WillTank's signature feature for creating future messages. You can create Letters (text messages), Videos (recorded or uploaded), Audio messages, or Documents to be delivered to loved ones at scheduled dates or events. To access Tank features, you'll need at least one will created. Your subscription tier determines message limits: Starter (2), Gold (10), Platinum (unlimited). Would you like help creating your first will or setting up Tank messages?";
      } else if (lowerQuery.includes('security')) {
        response = "Your dashboard shows your security status! WillTank uses military-grade AES-256 encryption for all data. You can improve your security score by enabling two-factor authentication, adding trusted contacts, completing death verification setup, and securing your digital asset access instructions. Check the Security Settings section to enhance your protection.";
      } else {
        response = "Welcome to your WillTank dashboard! This is your command center for estate planning. You can create wills (6 templates available), manage Tank messages, view trusted contacts, monitor security status, and track your activity. Your dashboard shows quick actions for will creation, Tank message setup, contact management, and security settings. What would you like to work on today?";
      }
    } else if (currentPage.includes('/will')) {
      response = "You're in the will creation section! WillTank offers 6 specialized templates: Traditional Will (general estate planning), Digital Asset Will (crypto, NFTs, online accounts), Living Trust (lifetime asset management), Family Will (child guardianship), Business Will (succession planning), and Charitable Will (philanthropic giving). Our AI assistant guides you through personalized questions for each template. Which type best fits your needs?";
    } else if (currentPage.includes('/tank')) {
      response = "You're in the Tank - WillTank's unique future messaging system! Create 4 types of messages: Letters (text-based), Videos (record or upload), Audio (voice recordings), or Documents (file attachments). Messages can be scheduled for specific dates (birthdays, anniversaries) or triggered by events (your passing, verified through our system). Your current subscription allows different message limits. What type of message would you like to create?";
    } else if (currentPage.includes('/pricing')) {
      response = "Looking at our pricing options? WillTank offers three tiers: Starter ($14.99/month) with basic features and 2 Tank messages, Gold ($29/month) with advanced features and 10 Tank messages, and Platinum ($55/month) with premium features and unlimited Tank messages. All plans include will creation, bank-grade encryption, and secure document storage. The main differences are Tank message limits and advanced features like AI document analysis and family sharing.";
    }
    
    // Content-based responses with comprehensive WillTank knowledge
    else if (lowerQuery.includes('will') && (lowerQuery.includes('create') || lowerQuery.includes('make') || lowerQuery.includes('start'))) {
      response = "Creating a will with WillTank is straightforward! We offer 6 specialized templates designed for different needs:\n\n• Traditional Will - General estate planning with basic provisions\n• Digital Asset Will - Cryptocurrency, NFTs, online accounts, social media\n• Living Trust - Lifetime asset management avoiding probate\n• Family Will - Child guardianship, education funds, family provisions\n• Business Will - Business succession, key employee provisions\n• Charitable Will - Philanthropic giving, nonprofit bequests\n\nOur AI guides you through each template with personalized questions. The process typically takes 10-15 minutes. Which template interests you most?";
    }
    
    else if (lowerQuery.includes('tank') && lowerQuery.includes('message')) {
      response = "Tank messages are WillTank's signature feature - future messages you create now for later delivery! You can create:\n\n• Letters - Text-based messages with personal notes\n• Videos - Record or upload video messages\n• Audio - Voice recordings with personal meaning\n• Documents - Important files, photos, or instructions\n\nDelivery options include:\n• Scheduled dates (birthdays, anniversaries, holidays)\n• Event-triggered (verified through our death verification system)\n• Manual delivery by trusted contacts\n\nYour subscription determines limits: Starter (2 messages), Gold (10 messages), Platinum (unlimited). What type of message would you like to create?";
    }
    
    else if (lowerQuery.includes('digital') && (lowerQuery.includes('asset') || lowerQuery.includes('crypto') || lowerQuery.includes('nft'))) {
      response = "WillTank specializes in comprehensive digital asset planning! Our Digital Asset Will template addresses:\n\n• Cryptocurrency wallets and exchange accounts\n• NFT collections and digital art\n• Social media accounts (Facebook, Instagram, Twitter)\n• Email accounts and cloud storage\n• Online banking and investment accounts\n• Digital memorabilia and photos\n• Gaming accounts and virtual assets\n\nYou can specify recovery phrases, password manager access, 2FA backup codes, and designate tech-savvy digital executors. We use bank-grade encryption to protect sensitive information. Would you like to start creating your digital asset will?";
    }
    
    else if (lowerQuery.includes('subscription') || lowerQuery.includes('plan') || lowerQuery.includes('upgrade') || lowerQuery.includes('pricing')) {
      response = "WillTank offers three subscription tiers:\n\n🚀 Starter ($14.99/month):\n• Basic will templates\n• 2 Tank messages\n• Standard encryption\n• Email support\n• 5GB storage\n\n⭐ Gold ($29/month):\n• All Starter features\n• Advanced will templates\n• 10 Tank messages\n• Enhanced encryption\n• AI document analysis\n• Priority support\n• 20GB storage\n\n💎 Platinum ($55/month):\n• All Gold features\n• Premium legal templates\n• Unlimited Tank messages\n• Military-grade encryption\n• Advanced AI tools\n• Family sharing (5 users)\n• 24/7 priority support\n• 100GB storage\n\nAll plans include a 14-day money-back guarantee. Which plan interests you?";
    }
    
    else if (lowerQuery.includes('security') || lowerQuery.includes('encryption') || lowerQuery.includes('safe')) {
      response = "Security is paramount at WillTank! We implement multiple layers of protection:\n\n🔒 Encryption:\n• Military-grade AES-256 encryption\n• Zero-knowledge architecture\n• Encrypted at rest and in transit\n• Secure key management\n\n🛡️ Access Control:\n• Two-factor authentication\n• Trusted contact verification\n• Death verification protocols\n• Role-based permissions\n\n📊 Monitoring:\n• Security score tracking\n• Activity monitoring\n• Breach detection\n• Regular security audits\n\nYour dashboard shows your current security score and recommendations for improvement. Would you like help enhancing your security settings?";
    }
    
    else if (lowerQuery.includes('death') && lowerQuery.includes('verification')) {
      response = "Our death verification system ensures Tank messages are delivered appropriately and prevents false triggers:\n\n✅ Verification Methods:\n• Trusted contacts you designate can report and verify\n• Official death certificates can be submitted\n• Monitoring of public death records\n• Multi-step verification process\n\n⏰ Delivery Process:\n• Initial verification triggers review period\n• Multiple confirmation sources required\n• Designated timeline before message delivery\n• Recipients notified according to your settings\n\n🔐 Security Features:\n• Prevents unauthorized access\n• Requires multiple verification points\n• Trusted contact authentication\n• Audit trail for all verifications\n\nThis system protects against false triggers while ensuring your messages reach loved ones when intended.";
    }
    
    else if (lowerQuery.includes('family') || lowerQuery.includes('children') || lowerQuery.includes('guardian')) {
      response = "Family planning is crucial in estate planning! WillTank's Family Will template helps with:\n\n👨‍👩‍👧‍👦 Child Provisions:\n• Guardian designation for minor children\n• Education fund setup and management\n• Child care instructions and preferences\n• Healthcare and religious guidance\n\n💰 Financial Planning:\n• Trust creation for children\n• Age-based distribution schedules\n• Education expense provisions\n• Emergency fund allocation\n\n💌 Future Messages:\n• Tank messages for milestone birthdays\n• Graduation and wedding messages\n• Life advice and family history\n• Photo and video collections\n\n👥 Family Sharing:\n• Collaborate with spouse on planning (Platinum)\n• Share access with up to 5 family members\n• Coordinate estate planning decisions\n\nWould you like help with child guardianship or family trust setup?";
    }
    
    else if (lowerQuery.includes('business') || lowerQuery.includes('company') || lowerQuery.includes('succession')) {
      response = "Business succession planning protects both your family and business interests! WillTank's Business Will template addresses:\n\n🏢 Business Ownership:\n• Ownership transfer procedures\n• Partnership agreement provisions\n• Business valuation instructions\n• Succession timeline planning\n\n👥 Key Personnel:\n• Key employee retention\n• Management transition plans\n• Client relationship transfers\n• Vendor and supplier continuity\n\n📋 Operations:\n• Daily operations procedures\n• Financial account access\n• Insurance policy management\n• Legal compliance requirements\n\n💬 Tank Messages for Business:\n• Instructions for successors\n• Client transition communications\n• Employee guidance messages\n• Strategic direction for the future\n\nBusiness continuity planning ensures your company survives and thrives after your passing. Need help with succession planning?";
    }
    
    else if (lowerQuery.includes('help') || lowerQuery.includes('support') || lowerQuery.includes('how')) {
      response = "I'm Skyler, your dedicated WillTank AI assistant! I'm here to help with:\n\n📋 Will Creation:\n• Template selection and guidance\n• Step-by-step completion\n• Legal requirement explanations\n• Document review and editing\n\n💌 Tank Messages:\n• Message type selection\n• Creation and recording assistance\n• Delivery scheduling\n• Recipient management\n\n🔐 Account Management:\n• Subscription questions\n• Security settings\n• Contact management\n• Feature explanations\n\n💡 Estate Planning Guidance:\n• Best practice recommendations\n• Digital asset management\n• Family planning advice\n• Business succession help\n\nI'm available 24/7 and learn from each conversation to provide better assistance. What specific area would you like help with today?";
    }
    
    else if (lowerQuery.includes('executor') || lowerQuery.includes('trustee')) {
      response = "Executors are essential for proper estate administration! In WillTank, you can designate different executor types:\n\n⚖️ General Executor:\n• Overall estate administration\n• Asset distribution oversight\n• Legal proceeding management\n• Final affairs coordination\n\n💻 Digital Executor:\n• Online account management\n• Cryptocurrency access\n• Social media handling\n• Digital asset distribution\n\n💌 Tank Executor:\n• Message delivery oversight\n• Recipient verification\n• Delivery timing management\n• Technical assistance for recipients\n\n📋 Executor Guidance:\n• Detailed instruction provision\n• Contact information storage\n• Access credential management\n• Step-by-step procedure documentation\n\nChoose executors who are trustworthy, capable, and willing to serve. For digital assets, consider tech-savvy individuals. Would you like help selecting or instructing your executors?";
    }
    
    else if (lowerQuery.includes('thank')) {
      response = "You're very welcome! I'm always here to help with your WillTank journey. Whether you need assistance with will creation, Tank messages, digital asset planning, or any other estate planning questions, just ask. Take care, and remember that planning today protects your loved ones tomorrow. 😊";
    }
    
    // Default comprehensive response
    else {
      response = "Hello! I'm Skyler, your WillTank AI assistant. I'm here to help you navigate estate planning with our comprehensive platform.\n\n🏠 WillTank combines traditional estate planning with modern digital asset management and future message delivery.\n\nI can assist with:\n• Will Creation (6 specialized templates)\n• Tank Messages (letters, videos, audio, documents)\n• Digital Asset Planning (crypto, NFTs, online accounts)\n• Subscription Management & Features\n• Security & Encryption Settings\n• Family & Business Planning\n• Death Verification Systems\n• Executor & Contact Management\n\nWhat specific aspect of estate planning would you like to explore today? I'm here to provide personalized guidance for your unique situation.";
    }
    
    // Store the interaction if there's an authenticated user
    if (userId) {
      try {
        await supabase.from('ai_interactions').insert({
          user_id: userId,
          request_type: 'estate_planning_chat',
          response: JSON.stringify({ query, response, currentPage })
        });
      } catch (dbError) {
        console.error("Error storing interaction:", dbError);
        // Continue even if storage fails
      }
    }
    
    return new Response(JSON.stringify({
      response: response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error("Error in AI assistant function:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error: " + error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
