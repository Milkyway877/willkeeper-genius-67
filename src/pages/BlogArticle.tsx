
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ArrowLeft, CalendarDays, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogArticle() {
  const { id } = useParams<{ id: string }>();
  
  // This would normally fetch the specific blog post based on the ID
  const article = {
    title: "Understanding Digital Assets in Your Estate Plan",
    content: `
      <p>When creating an estate plan, many people focus on physical assets like real estate, vehicles, and personal belongings. However, in today's digital age, your online accounts, digital files, and cryptocurrencies are equally important assets that need to be addressed in your estate plan.</p>
      
      <h2>What Are Digital Assets?</h2>
      <p>Digital assets encompass a wide range of online accounts and files, including:</p>
      <ul>
        <li>Email accounts</li>
        <li>Social media profiles</li>
        <li>Online banking and investment accounts</li>
        <li>Cryptocurrency wallets</li>
        <li>Digital photos and videos</li>
        <li>Domain names and websites</li>
        <li>Digital intellectual property (e.g., writing, music, artwork)</li>
        <li>Online business accounts</li>
        <li>Loyalty program points</li>
        <li>Subscription services</li>
      </ul>
      
      <h2>Why Include Digital Assets in Your Estate Plan?</h2>
      <p>Without proper planning, your loved ones may face significant challenges accessing and managing your digital assets after your passing. Many digital service providers have strict privacy policies that can prevent access to accounts without proper authorization, even for next of kin.</p>
      
      <p>By including digital assets in your estate plan, you can:</p>
      <ul>
        <li>Ensure your loved ones can access important accounts and information</li>
        <li>Protect valuable digital assets like cryptocurrencies from being lost forever</li>
        <li>Preserve sentimental digital items like photos and videos</li>
        <li>Prevent identity theft of the deceased</li>
        <li>Maintain or properly close online accounts according to your wishes</li>
      </ul>
      
      <h2>How to Include Digital Assets in Your Estate Plan</h2>
      
      <h3>1. Create a Digital Asset Inventory</h3>
      <p>Start by creating a comprehensive inventory of all your digital assets, including:</p>
      <ul>
        <li>Account names and URLs</li>
        <li>Usernames or account numbers</li>
        <li>The purpose and content of each account</li>
        <li>The monetary or sentimental value of the asset</li>
      </ul>
      
      <h3>2. Document Access Information</h3>
      <p>For each asset, document the information needed to access it, such as:</p>
      <ul>
        <li>Passwords</li>
        <li>PINs</li>
        <li>Security questions and answers</li>
        <li>Two-factor authentication details</li>
      </ul>
      
      <p>Store this information securely, such as in a password manager, and provide instructions on how to access it in your estate planning documents.</p>
      
      <h3>3. Include Digital Assets in Legal Documents</h3>
      <p>Work with an estate planning attorney to include provisions for digital assets in your will, trust, or other estate planning documents. This may include:</p>
      <ul>
        <li>Naming a digital executor or trustee</li>
        <li>Providing authorization to access digital accounts</li>
        <li>Specifying your wishes for each digital asset</li>
      </ul>
      
      <h3>4. Use WillTank's Digital Asset Protection Features</h3>
      <p>WillTank offers specialized tools to help you protect and transfer digital assets, including:</p>
      <ul>
        <li>Secure digital asset inventory</li>
        <li>Encrypted password storage</li>
        <li>Digital asset transfer instructions</li>
        <li>Cryptocurrency inheritance planning</li>
      </ul>
      
      <h2>Legal Considerations for Digital Assets</h2>
      <p>Laws governing digital assets in estate planning are still evolving. The Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) has been adopted in most states and provides a legal framework for fiduciaries to access digital assets. However, specific provisions can vary by jurisdiction.</p>
      
      <p>Additionally, many online service providers have their own policies regarding account access after death. Some platforms, like Facebook and Google, offer legacy features that allow you to designate someone to manage your account after you're gone.</p>
      
      <h2>Keeping Your Digital Estate Plan Updated</h2>
      <p>Digital assets change frequently, so it's important to review and update your digital estate plan regularly. Consider updating your plan whenever you:</p>
      <ul>
        <li>Create new online accounts</li>
        <li>Close existing accounts</li>
        <li>Change passwords</li>
        <li>Acquire new digital assets</li>
        <li>Experience major life changes</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Including digital assets in your estate plan is essential in today's connected world. By creating a comprehensive digital estate plan, you can ensure that your digital legacy is managed according to your wishes and that valuable or sentimental digital assets aren't lost forever.</p>
      
      <p>WillTank's estate planning tools make it easy to include digital assets in your comprehensive estate plan. Sign up today to start protecting your entire legacy—both physical and digital.</p>
    `,
    author: "Elizabeth Chen",
    date: "June 15, 2023",
    readTime: "8 min read",
    category: "Digital Estate",
    relatedPosts: [
      {
        title: "The Importance of Updating Your Will Regularly",
        slug: "updating-will-regularly"
      },
      {
        title: "Choosing the Right Executor: What You Need to Know",
        slug: "choosing-right-executor"
      },
      {
        title: "Estate Planning for Business Owners: Essential Steps",
        slug: "estate-planning-business-owners"
      }
    ]
  };

  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-12">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
        
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-willtank-100 text-willtank-800">
            {article.category}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-8">
          <div className="flex items-center mr-4">
            <User size={16} className="mr-1" />
            <span className="text-sm">{article.author}</span>
          </div>
          <div className="flex items-center mr-4">
            <CalendarDays size={16} className="mr-1" />
            <span className="text-sm">{article.date}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{article.readTime}</span>
          </div>
        </div>
        
        <div className="bg-gray-200 h-80 w-full mb-8 rounded-lg"></div>
        
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }}></div>
        
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-xl font-bold mb-6">Related Articles</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {article.relatedPosts.map((post, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{post.title}</h4>
                <Link to={`/blog/${post.slug}`} className="text-willtank-600 text-sm font-medium hover:underline">
                  Read Article →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
