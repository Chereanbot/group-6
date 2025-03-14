"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineQuestionMarkCircle,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlinePhone as HiOutlinePhoneIcon
} from 'react-icons/hi';
import { FormField } from './FormField';
import { ReviewItem } from './ReviewItem';
import { PreviewCase } from './PreviewCase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Priority } from '@prisma/client';
import { CheckIcon } from '@heroicons/react/24/outline';
import Timeline from './Timeline';
import type { TimelineEvent } from './Timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ArrowRight, Upload, Check, Info, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Import the same types and components from admin
const caseTypes = [
  { value: 'CIVIL', label: 'Civil Case' },
  { value: 'CRIMINAL', label: 'Criminal Case' },
  { value: 'FAMILY', label: 'Family Law' },
  { value: 'PROPERTY', label: 'Property Dispute' },
  { value: 'LABOR', label: 'Labor Law' },
  { value: 'DIVORCE', label: 'Divorce' },
  { value: 'INHERITANCE', label: 'Inheritance' },
  { value: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence' },
  { value: 'LAND_DISPUTE', label: 'Land Dispute' },
  { value: 'CONTRACT', label: 'Contract Related' },
  { value: 'HUMAN_RIGHTS', label: 'Human Rights' },
  { value: 'CONSTITUTIONAL', label: 'Constitutional Law' },
  { value: 'ENVIRONMENTAL', label: 'Environmental Law' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property' },
  { value: 'IMMIGRATION', label: 'Immigration Law' },
  { value: 'TAX', label: 'Tax Law' },
  { value: 'BANKRUPTCY', label: 'Bankruptcy Law' },
  { value: 'INSURANCE', label: 'Insurance Law' },
  { value: 'MEDICAL_MALPRACTICE', label: 'Medical Malpractice' },
  { value: 'EDUCATION', label: 'Education Law' },
  { value: 'OTHER', label: 'Other' }
];

const documentTypes = [
  'ID_CARD',
  'INCOME_PROOF',
  'RESIDENCE_PROOF', 
  'COURT_DOCUMENTS',
  'WITNESS_STATEMENTS',
  'PROPERTY_DOCUMENTS',
  'MEDICAL_RECORDS',
  'POLICE_REPORT',
  'PREVIOUS_CASE_DOCUMENTS',
  'FINANCIAL_RECORDS',
  'EMPLOYMENT_RECORDS',
  'EDUCATIONAL_RECORDS',
  'IMMIGRATION_DOCUMENTS',
  'BUSINESS_RECORDS',
  'CONTRACTS',
  'CORRESPONDENCE',
  'PHOTOGRAPHS',
  'VIDEO_EVIDENCE',
  'EXPERT_REPORTS',
  'INSURANCE_DOCUMENTS',
  'OTHER'
];

const documentCategories = [
  { value: 'IDENTIFICATION', label: 'Identification Documents' },
  { value: 'LEGAL', label: 'Legal Documents' },
  { value: 'EVIDENCE', label: 'Evidence Documents' },
  { value: 'WITNESS', label: 'Witness Statements' },
  { value: 'COURT', label: 'Court Documents' },
  { value: 'FINANCIAL', label: 'Financial Documents' },
  { value: 'MEDICAL', label: 'Medical Documents' },
  { value: 'EMPLOYMENT', label: 'Employment Documents' },
  { value: 'EDUCATIONAL', label: 'Educational Documents' },
  { value: 'MULTIMEDIA', label: 'Multimedia Evidence' },
  { value: 'OTHER', label: 'Other Documents' }
];

const caseCategories = {
  FAMILY: {
    label: 'Family Law',
    types: [
      { value: 'DIVORCE', label: 'Divorce' },
      { value: 'CHILD_CUSTODY', label: 'Child Custody' },
      { value: 'CHILD_SUPPORT', label: 'Child Support' },
      { value: 'ADOPTION', label: 'Adoption' },
      { value: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence' },
      { value: 'MARRIAGE_DISPUTE', label: 'Marriage Dispute' },
      { value: 'ALIMONY', label: 'Alimony' },
      { value: 'INHERITANCE', label: 'Inheritance' },
      { value: 'GUARDIANSHIP', label: 'Guardianship' },
      { value: 'PROPERTY_DIVISION', label: 'Property Division' },
      { value: 'PRENUPTIAL_AGREEMENT', label: 'Prenuptial Agreement' },
      { value: 'SURROGACY', label: 'Surrogacy' },
      { value: 'PATERNITY', label: 'Paternity' },
      { value: 'ELDER_LAW', label: 'Elder Law' },
      { value: 'OTHER', label: 'Other Family Matter' }
    ]
  },
  // ... rest of the case categories remain the same as admin
};

interface NewCaseFormProps {
  darkMode?: boolean;
}

interface Office {
  id: string;
  name: string;
  location?: string;
}

interface SuccessOption {
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface FormData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  priority: string;
  
  // Location
  region: string;
  zone: string;
  wereda: string;
  kebele: string;
  houseNumber: string;
  
  // Case Details
  caseType: string;
  caseDescription: string;
  evidenceDescription: string;
  
  // Client
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  
  // Office
  officeId: string;
  
  // Documents
  documents: File[];
}

interface Coordinator {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  office: {
    id: string;
    name: string;
    location: string;
  };
}

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cases: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

const STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Enter the fundamental details of the case',
    icon: Info
  },
  {
    id: 'location',
    title: 'Location Details',
    description: 'Specify the geographical information',
    icon: AlertCircle
  },
  {
    id: 'case-details',
    title: 'Case Details',
    description: 'Provide comprehensive case information',
    icon: AlertCircle
  },
  {
    id: 'client',
    title: 'Client Information',
    description: 'Enter client contact details',
    icon: AlertCircle
  },
  {
    id: 'office',
    title: 'Office Assignment',
    description: 'Select the handling office',
    icon: AlertCircle
  },
  {
    id: 'documents',
    title: 'Documentation',
    description: 'Upload relevant documents',
    icon: Upload
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function NewCase() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showStepHelp, setShowStepHelp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: '',
    region: '',
    zone: '',
    wereda: '',
    kebele: '',
    houseNumber: '',
    caseType: '',
    caseDescription: '',
    evidenceDescription: '',
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    officeId: '',
    documents: [],
  });
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'Case Registration Initiated',
      description: 'Initial case registration process started by coordinator',
      date: new Date(),
      status: 'completed',
      icon: 'DOCUMENT',
      details: {
        notes: 'Case registration process has begun'
      }
    },
    {
      id: '2',
      title: 'Document Verification',
      description: 'Required documents are being verified',
      date: new Date(),
      status: 'current',
      icon: 'VERIFY',
      details: {
        documents: [
          'Client Identification',
          'Case Related Documents',
          'Supporting Evidence'
        ]
      }
    },
    {
      id: '3',
      title: 'Case Assignment',
      description: 'Case will be assigned to the appropriate department',
      date: new Date(),
      status: 'upcoming',
      icon: 'OFFICE',
      details: {
        location: coordinator?.office?.name || 'Pending'
      }
    }
  ]);
  const [offices, setOffices] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'phone'>('name');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch coordinator profile when component mounts
    const fetchCoordinatorProfile = async () => {
      try {
        const response = await fetch('/api/coordinator/profile');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCoordinator(result.data);
          // Pre-fill office information and coordinator details
          if (result.data.office) {
            setFormData(prev => ({
              ...prev,
              officeId: result.data.office.id,
              officeName: result.data.office.name,
              coordinatorId: result.data.id,
              coordinatorName: result.data.user.fullName
            }));
          } else {
            toast({
              title: 'Error',
              description: 'No office assigned to coordinator',
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load coordinator information',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching coordinator profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load coordinator information',
          variant: 'destructive'
        });
      }
    };

    fetchCoordinatorProfile();
  }, [toast]);

  useEffect(() => {
    fetchOffices();
    fetchClients();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await fetch('/api/coordinator/offices');
      const data = await response.json();
      if (data.success) {
        setOffices(data.offices);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch offices',
        variant: 'destructive',
      });
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/coordinator/clients');
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(e.target.files!)]
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'documents') {
          submitData.append(key, value);
        }
      });
      
      formData.documents.forEach((file) => {
        submitData.append('documents', file);
      });

      const response = await fetch('/api/coordinator/cases', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create case');
      }

      toast({
        title: 'Success',
        description: 'Case created successfully',
      });

      router.push('/coordinator/cases');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create case',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/coordinator/clients/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search clients');
      }

      setSearchResults(data.data);
      
      if (data.data.length === 0) {
        setSearchError('No clients found. Would you like to register a new client?');
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Failed to search clients');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to search clients',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    // Check if client has active cases
    const hasActiveCases = client.cases.some(
      (caseItem) => ['ACTIVE', 'PENDING'].includes(caseItem.status)
    );

    if (hasActiveCases) {
      toast({
        title: 'Warning',
        description: 'This client already has active cases and cannot be selected.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.fullName,
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
    }));
  };

  const handleNewClientRegistration = () => {
    router.push('/coordinator/clients/register');
  };

  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={fadeIn}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (currentStep) {
              case 0:
                return (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="title" className="text-base font-semibold">
                          Case Title
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter a clear, descriptive title for the case</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter case title"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="text-base font-semibold">
                          Description
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Provide a detailed description of the case</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter case description"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="category" className="text-base font-semibold">
                            Category
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Select the most appropriate category for the case</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FAMILY">Family</SelectItem>
                            <SelectItem value="CRIMINAL">Criminal</SelectItem>
                            <SelectItem value="CIVIL">Civil</SelectItem>
                            <SelectItem value="PROPERTY">Property</SelectItem>
                            <SelectItem value="LABOR">Labor</SelectItem>
                            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                            <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="priority" className="text-base font-semibold">
                            Priority
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Set the priority level for this case</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => handleInputChange('priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!formData.title || !formData.category && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Required Fields</AlertTitle>
                        <AlertDescription>
                          Please fill in all required fields before proceeding.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );

              case 1:
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-base font-semibold">Region</Label>
                        <Input
                          id="region"
                          value={formData.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          placeholder="Enter region"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zone" className="text-base font-semibold">Zone</Label>
                        <Input
                          id="zone"
                          value={formData.zone}
                          onChange={(e) => handleInputChange('zone', e.target.value)}
                          placeholder="Enter zone"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="wereda" className="text-base font-semibold">Wereda *</Label>
                        <Input
                          id="wereda"
                          value={formData.wereda}
                          onChange={(e) => handleInputChange('wereda', e.target.value)}
                          placeholder="Enter wereda"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="kebele" className="text-base font-semibold">Kebele *</Label>
                        <Input
                          id="kebele"
                          value={formData.kebele}
                          onChange={(e) => handleInputChange('kebele', e.target.value)}
                          placeholder="Enter kebele"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="houseNumber" className="text-base font-semibold">House Number</Label>
                      <Input
                        id="houseNumber"
                        value={formData.houseNumber}
                        onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                        placeholder="Enter house number"
                      />
                    </div>

                    {(!formData.wereda || !formData.kebele) && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Required Fields</AlertTitle>
                        <AlertDescription>
                          Wereda and Kebele are required fields.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );

              case 2:
                return (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="caseType" className="text-base font-semibold">Case Type *</Label>
                      <Input
                        id="caseType"
                        value={formData.caseType}
                        onChange={(e) => handleInputChange('caseType', e.target.value)}
                        placeholder="Enter case type"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caseDescription" className="text-base font-semibold">Case Description *</Label>
                      <Textarea
                        id="caseDescription"
                        value={formData.caseDescription}
                        onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                        placeholder="Enter detailed case description"
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="evidenceDescription" className="text-base font-semibold">Evidence Description</Label>
                      <Textarea
                        id="evidenceDescription"
                        value={formData.evidenceDescription}
                        onChange={(e) => handleInputChange('evidenceDescription', e.target.value)}
                        placeholder="Describe available evidence"
                        className="min-h-[100px]"
                      />
                    </div>

                    {(!formData.caseType || !formData.caseDescription) && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Required Fields</AlertTitle>
                        <AlertDescription>
                          Case type and description are required fields.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );

              case 3:
                return (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Select
                        value={searchType}
                        onValueChange={(value: 'name' | 'phone') => setSearchType(value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Search by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Search by Name</SelectItem>
                          <SelectItem value="phone">Search by Phone</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex-1">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={searchType === 'name' ? "Enter client name..." : "Enter phone number..."}
                          onKeyDown={(e) => e.key === 'Enter' && handleClientSearch()}
                        />
                      </div>

                      <Button 
                        onClick={handleClientSearch}
                        disabled={searching || !searchQuery.trim()}
                      >
                        {searching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Search'
                        )}
                      </Button>
                    </div>

                    {searchError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Results Found</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                          <span>{searchError}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNewClientRegistration}
                          >
                            Register New Client
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {searchResults.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Search Results:</h3>
                        <div className="grid gap-4">
                          {searchResults.map((client: Client) => {
                            const hasActiveCases = client.cases.some(
                              (caseItem) => ['ACTIVE', 'PENDING'].includes(caseItem.status)
                            );

                            return (
                              <Card
                                key={client.id}
                                className={`cursor-pointer transition-colors ${
                                  hasActiveCases ? 'opacity-50' : 'hover:border-primary'
                                }`}
                                onClick={() => !hasActiveCases && handleClientSelect(client)}
                              >
                                <CardContent className="flex items-center justify-between p-4">
                                  <div>
                                    <p className="font-medium">{client.fullName}</p>
                                    <p className="text-sm text-gray-500">{client.phone}</p>
                                    {client.email && (
                                      <p className="text-sm text-gray-500">{client.email}</p>
                                    )}
                                  </div>
                                  {hasActiveCases ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertCircle className="h-5 w-5 text-red-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Client has active cases</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <Check 
                                      className={`h-5 w-5 ${
                                        selectedClient?.id === client.id 
                                          ? 'text-green-500' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedClient && (
                      <Alert>
                        <Check className="h-4 w-4" />
                        <AlertTitle>Client Selected</AlertTitle>
                        <AlertDescription>
                          You have selected {selectedClient.fullName} for this case.
                        </AlertDescription>
                      </Alert>
                    )}

                    {!selectedClient && !searchResults.length && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Search for a Client</AlertTitle>
                        <AlertDescription>
                          Search for an existing client by name or phone number. If the client doesn't exist, you can register a new one.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );

              case 4:
                return (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="office" className="text-base font-semibold">Select Office *</Label>
                      <Select
                        value={formData.officeId}
                        onValueChange={(value) => handleInputChange('officeId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an office" />
                        </SelectTrigger>
                        <SelectContent>
                          {offices.map((office: any) => (
                            <SelectItem key={office.id} value={office.id}>
                              {office.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!formData.officeId && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Required Field</AlertTitle>
                        <AlertDescription>
                          Please select an office to handle this case.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );

              case 5:
                return (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="documents" className="text-base font-semibold">Upload Documents</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Input
                          id="documents"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label htmlFor="documents" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 mb-2 text-gray-400" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Support for multiple files
                            </p>
                          </div>
                        </Label>
                      </div>

                      {formData.documents.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Selected Files:</h4>
                          <ul className="space-y-2">
                            {formData.documents.map((file, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const successOptions: SuccessOption[] = [
    {
      title: 'View Case Details',
      description: "View the details of the case you've just created",
      icon: 'VIEW',
      href: '/coordinator/cases'
    },
    {
      title: 'Register Another Case',
      description: "Start a new case registration process for another client or legal matter that needs attention.",
      icon: 'NEW',
      href: '/coordinator/cases/new'
    },
    {
      title: 'Return to Dashboard',
      description: "Go back to your dashboard to manage other tasks and cases.",
      icon: 'DASHBOARD',
      href: '/coordinator/dashboard'
    }
  ];

  if (!mounted) return null;

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <CheckIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold">Case Successfully Registered</h2>
          <p className="mt-2 text-gray-600">What would you like to do next?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successOptions.map((option) => (
            <button
              key={option.title}
              onClick={() => router.push(option.href)}
              className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <h3 className="font-semibold">{option.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>New Case Registration</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {STEPS[currentStep].description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Timeline Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-xs mt-2 text-center max-w-[80px]">{step.title}</div>
                  </div>
                );
              })}
              {/* Progress line */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-[100px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-[100px]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit'
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="w-[100px]"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 