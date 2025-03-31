import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface AILegalCheckProps {
  willData: any;
  onComplete: (results: any) => void;
}

interface CheckItem {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'warning' | 'failed';
  details?: string;
}

interface LegalCheckResult {
  passed: boolean;
  score: number;
  categories: {
    legal: {
      score: number;
      issues: {
        critical: any[];
        warnings: any[];
      };
    };
    clarity: {
      score: number;
      issues: {
        critical: any[];
        warnings: any[];
      };
    };
    completeness: {
      score: number;
      issues: {
        critical: any[];
        warnings: any[];
      };
    };
    disputes: {
      score: number;
      issues: {
        critical: any[];
        warnings: any[];
      };
    };
  };
}

export default function AILegalCheck({ willData, onComplete }: AILegalCheckProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    {
      id: 'legal-validity',
      name: 'Legal Validity',
      description: 'Check if the will meets legal requirements',
      status: 'pending',
    },
    {
      id: 'clarity',
      name: 'Clarity & Ambiguity',
      description: 'Analyze for clear, unambiguous language',
      status: 'pending',
    },
    {
      id: 'completeness',
      name: 'Completeness',
      description: 'Verify that all necessary elements are included',
      status: 'pending',
    },
    {
      id: 'dispute-risk',
      name: 'Dispute Risk Analysis',
      description: 'Assess potential for family disputes',
      status: 'pending',
    },
  ]);
  const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);
  const [result, setResult] = useState<LegalCheckResult | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    
    setCheckItems(prev => prev.map(item => ({
      ...item,
      status: 'pending',
      details: undefined
    })));
    
    simulateAnalysis();
  };

  const simulateAnalysis = () => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          completeAnalysis();
          return 100;
        }
        return newProgress;
      });
    }, 50);
    
    setTimeout(() => updateCheckStatus('legal-validity', 'checking'), 500);
    setTimeout(() => updateCheckStatus('legal-validity', 'passed', 'This will meets all legal requirements for validity.'), 2000);
    
    setTimeout(() => updateCheckStatus('clarity', 'checking'), 2500);
    setTimeout(() => updateCheckStatus('clarity', 'warning', 'Some language could be clearer. Consider revising section about specific bequests.'), 4000);
    
    setTimeout(() => updateCheckStatus('completeness', 'checking'), 4500);
    setTimeout(() => updateCheckStatus('completeness', 'passed', 'All required elements are present in the will.'), 6000);
    
    setTimeout(() => updateCheckStatus('dispute-risk', 'checking'), 6500);
    setTimeout(() => updateCheckStatus('dispute-risk', 'warning', 'Potential for disputes detected. Unequal distribution may cause family friction.'), 9000);
  };

  const updateCheckStatus = (id: string, status: CheckItem['status'], details?: string) => {
    setCheckItems(prev => prev.map(item => 
      item.id === id ? { ...item, status, details } : item
    ));
  };

  const completeAnalysis = () => {
    setIsAnalyzing(false);
    
    const result: LegalCheckResult = {
      passed: true,
      score: 85,
      categories: {
        legal: {
          score: 100,
          issues: {
            critical: [],
            warnings: [],
          }
        },
        clarity: {
          score: 80,
          issues: {
            critical: [],
            warnings: [
              {
                issue: "Ambiguous language in specific bequests",
                explanation: "The language used to describe specific items could lead to confusion about which items are being referred to.",
                recommendation: "Be more specific when describing items (e.g., 'diamond engagement ring with platinum band' rather than just 'ring')."
              }
            ],
          }
        },
        completeness: {
          score: 95,
          issues: {
            critical: [],
            warnings: [],
          }
        },
        disputes: {
          score: 65,
          issues: {
            critical: [],
            warnings: [
              {
                issue: "Unequal distribution among children",
                explanation: "The will allocates significantly different amounts to children, which often leads to disputes.",
                recommendation: "Consider adding an explanation for the unequal distribution, or adjust to make it more equitable."
              },
              {
                issue: "No-contest clause missing",
                explanation: "Without a no-contest clause, beneficiaries may be more likely to challenge the will.",
                recommendation: "Consider adding a no-contest clause to discourage challenges."
              }
            ],
          }
        },
      }
    };
    
    setResult(result);
    
    toast({
      title: "Warning",
      description: "The AI detected potential legal issues in your document that should be addressed.",
      variant: "destructive",
    });
  };

  const handleContinue = () => {
    if (!result) {
      toast({
        title: "Analysis Incomplete",
        description: "Please wait for the analysis to complete before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    onComplete(result);
  };

  const toggleAlert = (id: string) => {
    setExpandedAlerts(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const getStatusBadge = (status: CheckItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'checking':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-transparent">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Checking
          </Badge>
        );
      case 'passed':
        return (
          <Badge className="bg-green-100 text-green-800 border-transparent">
            <CheckCircle className="h-3 w-3 mr-1" />
            Passed
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-transparent">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const getAlertVariant = (type: 'critical' | 'warning') => {
    return type === 'critical' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>AI Legal Check</CardTitle>
              <CardDescription>
                Our AI is analyzing your will for legal accuracy and potential issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing will...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-4">
                    {checkItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-lg ${
                          item.status === 'checking' ? 'bg-blue-50 border-blue-200' :
                          item.status === 'passed' ? 'bg-green-50 border-green-200' :
                          item.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          item.status === 'failed' ? 'bg-red-50 border-red-200' :
                          'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            
                            {item.details && item.status !== 'pending' && (
                              <p className={`text-sm mt-2 ${
                                item.status === 'passed' ? 'text-green-700' :
                                item.status === 'warning' ? 'text-yellow-700' :
                                item.status === 'failed' ? 'text-red-700' :
                                'text-gray-700'
                              }`}>
                                {item.details}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        result.score >= 90 ? 'bg-green-100' :
                        result.score >= 70 ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <Shield className={`h-6 w-6 ${
                          result.score >= 90 ? 'text-green-600' :
                          result.score >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">Legal Analysis Score</h3>
                        <p className="text-sm text-gray-500">
                          Overall evaluation of your will
                        </p>
                      </div>
                    </div>
                    
                    <div className={`h-20 w-20 rounded-full border-4 flex items-center justify-center ${
                      result.score >= 90 ? 'border-green-500 text-green-600' :
                      result.score >= 70 ? 'border-yellow-500 text-yellow-600' :
                      'border-red-500 text-red-600'
                    }`}>
                      <span className="text-2xl font-bold">{result.score}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-green-100">
                      <CardHeader className="py-4 pb-2">
                        <CardTitle className="text-base">Legal Validity</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Score</span>
                          <Badge className="bg-green-100 text-green-800 border-transparent">
                            {result.categories.legal.score}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={result.categories.clarity.issues.warnings.length > 0 ? 'border-yellow-100' : 'border-green-100'}>
                      <CardHeader className="py-4 pb-2">
                        <CardTitle className="text-base">Clarity</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Score</span>
                          <Badge className={result.categories.clarity.issues.warnings.length > 0 
                            ? 'bg-yellow-100 text-yellow-800 border-transparent'
                            : 'bg-green-100 text-green-800 border-transparent'
                          }>
                            {result.categories.clarity.score}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardHeader className="py-4 pb-2">
                        <CardTitle className="text-base">Completeness</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Score</span>
                          <Badge className="bg-green-100 text-green-800 border-transparent">
                            {result.categories.completeness.score}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={result.categories.disputes.issues.warnings.length > 0 ? 'border-yellow-100' : 'border-green-100'}>
                      <CardHeader className="py-4 pb-2">
                        <CardTitle className="text-base">Dispute Risk</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Score</span>
                          <Badge className={result.categories.disputes.issues.warnings.length > 0 
                            ? 'bg-yellow-100 text-yellow-800 border-transparent'
                            : 'bg-green-100 text-green-800 border-transparent'
                          }>
                            {result.categories.disputes.score}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Issues & Recommendations</h3>
                    
                    {result.categories.clarity.issues.warnings.length > 0 && (
                      <div className="space-y-3">
                        {result.categories.clarity.issues.warnings.map((issue, index) => (
                          <Alert
                            key={`clarity-warning-${index}`}
                            variant="default"
                            className="cursor-pointer bg-yellow-50 border-yellow-200 text-yellow-800"
                            onClick={() => toggleAlert(`clarity-warning-${index}`)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                <AlertTitle>{issue.issue}</AlertTitle>
                              </div>
                              {expandedAlerts.includes(`clarity-warning-${index}`) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </div>
                            
                            {expandedAlerts.includes(`clarity-warning-${index}`) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2"
                              >
                                <AlertDescription className="space-y-2">
                                  <p>{issue.explanation}</p>
                                  <p className="font-medium">Recommendation:</p>
                                  <p>{issue.recommendation}</p>
                                </AlertDescription>
                              </motion.div>
                            )}
                          </Alert>
                        ))}
                      </div>
                    )}
                    
                    {result.categories.disputes.issues.warnings.length > 0 && (
                      <div className="space-y-3">
                        {result.categories.disputes.issues.warnings.map((issue, index) => (
                          <Alert
                            key={`dispute-warning-${index}`}
                            variant="default"
                            className="cursor-pointer bg-yellow-50 border-yellow-200 text-yellow-800"
                            onClick={() => toggleAlert(`dispute-warning-${index}`)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                <AlertTitle>{issue.issue}</AlertTitle>
                              </div>
                              {expandedAlerts.includes(`dispute-warning-${index}`) ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </div>
                            
                            {expandedAlerts.includes(`dispute-warning-${index}`) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2"
                              >
                                <AlertDescription className="space-y-2">
                                  <p>{issue.explanation}</p>
                                  <p className="font-medium">Recommendation:</p>
                                  <p>{issue.recommendation}</p>
                                </AlertDescription>
                              </motion.div>
                            )}
                          </Alert>
                        ))}
                      </div>
                    )}
                    
                    {result.categories.legal.issues.warnings.length === 0 &&
                     result.categories.legal.issues.critical.length === 0 &&
                     result.categories.clarity.issues.warnings.length === 0 &&
                     result.categories.clarity.issues.critical.length === 0 &&
                     result.categories.completeness.issues.warnings.length === 0 &&
                     result.categories.completeness.issues.critical.length === 0 &&
                     result.categories.disputes.issues.warnings.length === 0 &&
                     result.categories.disputes.issues.critical.length === 0 && (
                      <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>No issues detected</AlertTitle>
                        <AlertDescription>
                          Your will appears to be legally sound and well-structured.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Legal Check Ready</h3>
                  <p className="text-gray-500 mb-6">
                    Click the button below to have our AI analyze your will for legal accuracy and potential issues.
                  </p>
                  <Button onClick={startAnalysis}>
                    Start Analysis
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline">
                Back
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={isAnalyzing || !result}
              >
                Continue to Signing
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>AI Legal Analysis</CardTitle>
              <CardDescription>
                What we check in your will
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Legal Validity</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Testamentary capacity requirements</li>
                  <li>• Proper execution formalities</li>
                  <li>• Witness requirements</li>
                  <li>• Signature placement and validity</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Clarity & Ambiguity</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Clear identification of beneficiaries</li>
                  <li>• Specific description of assets</li>
                  <li>• Unambiguous distribution terms</li>
                  <li>• Consistent language throughout</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Completeness</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Executor appointment</li>
                  <li>• Guardian designation (if applicable)</li>
                  <li>• Residuary clause</li>
                  <li>• Attestation clause</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Dispute Risk Analysis</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Disinheritance patterns</li>
                  <li>• Unequal distribution among similar relations</li>
                  <li>• Conditional gifts complexity</li>
                  <li>• Contradictory provisions</li>
                </ul>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-willtank-600" />
                  <h4 className="text-sm font-medium">Important Disclaimer</h4>
                </div>
                <p className="text-xs text-gray-600">
                  While our AI legal check provides valuable insights, it does not replace professional legal advice. For complex estates or unique situations, we recommend consulting with a qualified attorney.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
