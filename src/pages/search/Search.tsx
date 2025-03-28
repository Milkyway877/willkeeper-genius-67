
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

export default function Search() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // Search wills
      const { data: wills, error: willsError } = await supabase
        .from('wills')
        .select('*')
        .textSearch('title', query, { type: 'websearch' })
        .limit(5);
      
      if (willsError) throw willsError;
      
      // Search future messages
      const { data: messages, error: messagesError } = await supabase
        .from('future_messages')
        .select('*')
        .textSearch('title', query, { type: 'websearch' })
        .limit(5);
        
      if (messagesError) throw messagesError;
      
      // Search legacy vault
      const { data: vaultItems, error: vaultError } = await supabase
        .from('legacy_vault')
        .select('*')
        .textSearch('title', query, { type: 'websearch' })
        .limit(5);
        
      if (vaultError) throw vaultError;
      
      // Combine results
      const formattedResults = [
        ...(wills || []).map(will => ({
          id: `will-${will.id}`,
          type: 'will',
          title: will.title || 'Untitled Will',
          description: will.title || 'No description',
          date: new Date(will.updated_at).toLocaleDateString(),
          link: `/will/${will.id}`
        })),
        ...(messages || []).map(message => ({
          id: `message-${message.id}`,
          type: 'message',
          title: message.title || 'Untitled Message',
          description: message.preview?.substring(0, 100) || 'No content',
          date: new Date(message.created_at).toLocaleDateString(),
          link: `/tank`
        })),
        ...(vaultItems || []).map(item => ({
          id: `vault-${item.id}`,
          type: 'vault',
          title: item.title || 'Untitled Item',
          description: item.preview || 'No description',
          date: new Date(item.created_at).toLocaleDateString(),
          link: `/tank#legacy`
        }))
      ];
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const filteredResults = searchResults.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              type="text"
              placeholder="Search for wills, messages, vault items..." 
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </form>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="will">Wills</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="vault">Vault Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="h-8 w-8 animate-spin text-willtank-600" />
                <span className="ml-3 text-lg">Searching...</span>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        <a href={result.link} className="hover:text-willtank-600 transition-colors">
                          {result.title}
                        </a>
                      </CardTitle>
                      <CardDescription>
                        <span className="capitalize">{result.type}</span> • {result.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        {result.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <SearchIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No results found</h3>
                <p className="text-gray-500">
                  {searchQuery ? `No results for "${searchQuery}". Try different keywords.` : 'Enter a search term to find results.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
