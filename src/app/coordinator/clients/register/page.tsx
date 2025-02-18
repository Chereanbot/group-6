"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, Plus } from "lucide-react";

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
  { value: 'OTHER', label: 'Other' }
];

const documentTypes = [
  { value: 'IDENTIFICATION', label: 'Identification Document', required: true },
];

const formSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(0).max(150),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER']),
  numberOfFamily: z.number().min(0),
  healthStatus: z.enum(['HEALTHY', 'DISABLED', 'CHRONIC_ILLNESS', 'OTHER']),
  phones: z.array(z.string()).min(1),

  // Location Details
  region: z.string().min(1),
  zone: z.string().min(1),
  wereda: z.string().min(1),
  kebele: z.string().min(1),
  houseNumber: z.string().optional(),

  // Case Information
  caseType: z.string().min(1, 'Case type is required'),
  caseCategory: z.string().min(1, 'Case category is required'),
  caseDescription: z.string().min(10, 'Case description must be at least 10 characters'),
  caseDate: z.date(),
  expectedResolutionDate: z.date().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  documents: z.array(z.object({
    type: z.string(),
    file: z.any(),
    notes: z.string().optional()
  })),
  additionalNotes: z.string().optional(),
  hasLegalRepresentation: z.boolean(),
  previousCaseReference: z.string().optional(),
  courtInvolved: z.boolean(),
  courtDetails: z.string().optional(),

  // Office Assignment
  officeId: z.string().min(1)
});

const steps = [
  { id: 'personal', title: 'Personal Information' },
  { id: 'location', title: 'Location Details' },
  { id: 'case', title: 'Case Information' },
  { id: 'office', title: 'Office Assignment' },
  { id: 'preview', title: 'Preview & Submit' },
];

export default function ClientRegistrationPage() {
  const [currentStep, setCurrentStep] = useState('personal');
  const [offices, setOffices] = useState([]);
  const [phoneInputs, setPhoneInputs] = useState(['']);
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<Array<{
    type: string;
    file: File;
    notes: string;
  }>>([]);
  const [caseDate, setCaseDate] = useState<Date>(new Date());
  const [expectedResolutionDate, setExpectedResolutionDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
    fullName: '',
      age: 0,
      sex: 'MALE' as const,
      numberOfFamily: 0,
      healthStatus: 'HEALTHY' as const,
      phones: [''],
      region: '',
      zone: '',
      wereda: '',
      kebele: '',
      houseNumber: '',
      caseType: 'CIVIL' as const,
      caseCategory: 'CIVIL' as const,
      officeId: '',
      hasLegalRepresentation: false,
      courtInvolved: false
    },
  });

  useEffect(() => {
    // Fetch offices for dropdown
    fetch('/api/coordinator/clients/register')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOffices(data.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching offices:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch offices',
          variant: 'destructive',
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all required fields
      const formValues = form.getValues();
      const requiredFields = {
        fullName: formValues.fullName,
        age: formValues.age,
        sex: formValues.sex,
        numberOfFamily: formValues.numberOfFamily,
        healthStatus: formValues.healthStatus,
        phones: formValues.phones,
        region: formValues.region,
        zone: formValues.zone,
        wereda: formValues.wereda,
        kebele: formValues.kebele,
        caseType: formValues.caseType,
        caseCategory: formValues.caseCategory,
        officeId: formValues.officeId
      };

      // Check if any required field is missing
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || (Array.isArray(value) && value.length === 0))
        .map(([key]) => key);

      if (missingFields.length > 0) {
        toast({
          title: "Error",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Check for required document
      const hasIdentification = selectedDocuments.some(
        doc => doc.type === 'IDENTIFICATION' && doc.file
      );

      if (!hasIdentification) {
        toast({
          title: "Error",
          description: "Identification document is required",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      
      // Add basic client information
      formData.append('fullName', formValues.fullName);
      formData.append('phones', JSON.stringify(formValues.phones));
      formData.append('age', formValues.age.toString());
      formData.append('sex', formValues.sex);
      formData.append('numberOfFamily', formValues.numberOfFamily.toString());
      formData.append('healthStatus', formValues.healthStatus);
      
      // Add location details
      formData.append('region', formValues.region);
      formData.append('zone', formValues.zone);
      formData.append('wereda', formValues.wereda);
      formData.append('kebele', formValues.kebele);
      formData.append('houseNumber', formValues.houseNumber || '');
      
      // Add case information
      formData.append('caseType', formValues.caseType);
      formData.append('caseCategory', formValues.caseCategory);
      formData.append('caseDescription', formValues.caseDescription || '');
      formData.append('additionalNotes', formValues.additionalNotes || '');
      
      // Add documents
      formData.append('documents', JSON.stringify(selectedDocuments.map(doc => ({
        type: doc.type,
        notes: doc.notes || doc.type
      }))));

      // Append each file with its type as the key
      selectedDocuments.forEach(doc => {
        if (doc.file) {
          formData.append(doc.type, doc.file);
        }
      });

      const response = await fetch('/api/coordinator/clients/register', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Client registered successfully",
          variant: "default",
          className: "bg-green-500 text-white"
        });
        
        // Reset form
        form.reset();
        setSelectedDocuments([]);
        
        // Redirect to clients list
        router.push('/coordinator/clients');
      } else {
        throw new Error(result.message || 'Failed to register client');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to register client',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPhoneInput = () => {
    setPhoneInputs([...phoneInputs, '']);
  };

  const removePhoneInput = (index: number) => {
    const newPhones = phoneInputs.filter((_, i) => i !== index);
    setPhoneInputs(newPhones);
  };

  const handleDocumentUpload = (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error",
        description: "File size should not exceed 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedDocuments(prev => [...prev, { type, file, notes: '' }]);
  };

  const handleRemoveDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomDocument = () => {
    const customType = `CUSTOM_${Date.now()}`;
    setSelectedDocuments(prev => [...prev, { type: customType, file: null, notes: '' }]);
  };

  const renderCaseInformation = () => (
    <TabsContent value="case" className="space-y-6 animate-in fade-in-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="caseType">Case Type</Label>
            <Select
              onValueChange={(value) => form.setValue('caseType', value)}
              defaultValue={form.getValues('caseType')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                {caseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="caseDescription">Case Description</Label>
            <Textarea
              id="caseDescription"
              placeholder="Provide detailed information about the case..."
              className="min-h-[120px]"
              {...form.register('caseDescription')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Case Date</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => document.getElementById('caseDateCalendar')?.click()}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(caseDate, "PPP")}
                </Button>
                <Calendar
                  id="caseDateCalendar"
                  mode="single"
                  selected={caseDate}
                  onSelect={(date) => {
                    if (date) {
                      setCaseDate(date);
                      form.setValue('caseDate', date);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <Label>Expected Resolution</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => document.getElementById('resolutionDateCalendar')?.click()}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedResolutionDate ? format(expectedResolutionDate, "PPP") : "Select date"}
                </Button>
                <Calendar
                  id="resolutionDateCalendar"
                  mode="single"
                  selected={expectedResolutionDate}
                  onSelect={(date) => {
                    setExpectedResolutionDate(date);
                    form.setValue('expectedResolutionDate', date);
                  }}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Priority Level</Label>
            <Select
              onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => form.setValue('priority', value)}
              defaultValue={form.getValues('priority')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Required Documents</Label>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-4">
                {/* Required Document */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Identification Document</span>
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={(e) => handleDocumentUpload('IDENTIFICATION', e.target.files)}
                        className="text-sm"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Additional Documents */}
                {selectedDocuments.filter(doc => doc.type !== 'IDENTIFICATION').map((doc, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Document Title"
                          value={doc.type.startsWith('CUSTOM_') ? doc.notes || '' : doc.type}
                          onChange={(e) => {
                            const newDocs = [...selectedDocuments];
                            newDocs[index].notes = e.target.value;
                            setSelectedDocuments(newDocs);
                          }}
                          className="text-sm"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const newDocs = [...selectedDocuments];
                              newDocs[index].file = e.target.files[0];
                              setSelectedDocuments(newDocs);
                            }
                          }}
                          className="text-sm"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Additional Document Button */}
                <Button
                  type="button"
                  onClick={handleAddCustomDocument}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 
                    hover:from-indigo-700 hover:to-violet-700 text-white transition-all duration-200"
                >
                  <Plus size={16} />
                  Add Additional Document
                </Button>
              </div>
            </ScrollArea>
          </div>

          <div>
            <Label>Uploaded Documents</Label>
            <div className="mt-2 space-y-2">
              {selectedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{doc.file ? doc.file.name : 'Select a file'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!doc.file && (
                      <Input
                        type="file"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const newDocs = [...selectedDocuments];
                            newDocs[index].file = files[0];
                            setSelectedDocuments(newDocs);
                          }
                        }}
                        className="text-sm w-48"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Additional Case Details</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasLegalRepresentation"
                  checked={form.getValues('hasLegalRepresentation')}
                  onCheckedChange={(checked) => form.setValue('hasLegalRepresentation', checked as boolean)}
                />
                <Label htmlFor="hasLegalRepresentation">Has previous legal representation</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="courtInvolved"
                  checked={form.getValues('courtInvolved')}
                  onCheckedChange={(checked) => form.setValue('courtInvolved', checked as boolean)}
                />
                <Label htmlFor="courtInvolved">Court already involved</Label>
              </div>
            </div>

            {form.getValues('courtInvolved') && (
              <div>
                <Label htmlFor="courtDetails">Court Details</Label>
                <Textarea
                  id="courtDetails"
                  placeholder="Provide details about court involvement..."
                  className="min-h-[80px]"
                  {...form.register('courtDetails')}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any additional information or special considerations..."
            className="min-h-[100px]"
            {...form.register('additionalNotes')}
          />
        </div>
      </div>
    </TabsContent>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-8 px-4 sm:px-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-4xl mx-auto"
      >
        <Card className="border-indigo-200 dark:border-indigo-800 shadow-xl shadow-indigo-100/20 dark:shadow-indigo-900/20 
          backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <CardHeader className="space-y-2 text-center border-b border-indigo-100 dark:border-indigo-800/50 pb-6">
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 
              dark:from-indigo-400 dark:to-violet-400">
                Client Registration
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Please fill in the client's information to register them in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="mb-10">
              <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center',
                      index < steps.length - 1 && 'flex-1'
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                        currentStep === step.id
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white border-transparent'
                          : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {index + 1}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'h-1 flex-1 mx-2 rounded transition-all duration-300',
                          currentStep === step.id
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500'
                            : 'bg-slate-200 dark:bg-slate-700'
                        )}
                      />
                    )}
                  </div>
                ))}
            </div>
              <div className="flex justify-between mt-3">
                {steps.map((step) => (
                  <span
                    key={step.id}
                    className={cn(
                      'text-sm font-medium transition-colors duration-300',
                      currentStep === step.id
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {step.title}
              </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={currentStep} onValueChange={setCurrentStep}>
                <TabsList className="hidden">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="location">Location Details</TabsTrigger>
                  <TabsTrigger value="case">Case Information</TabsTrigger>
                  <TabsTrigger value="office">Office Assignment</TabsTrigger>
                  <TabsTrigger value="preview">Preview & Submit</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="personal" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                          <Input
                            id="fullName"
                            {...form.register('fullName')}
                            className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                              transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-slate-700 dark:text-slate-300">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            {...form.register('age', { valueAsNumber: true })}
                            className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                              transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="sex" className="text-slate-700 dark:text-slate-300">Sex</Label>
                          <Select
                            onValueChange={(value: "MALE" | "FEMALE" | "OTHER") => form.setValue('sex', value)}
                            defaultValue={form.getValues('sex')}
                          >
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 
                              dark:focus:border-indigo-400 transition-colors duration-200">
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="healthStatus" className="text-slate-700 dark:text-slate-300">Health Status</Label>
                          <Select
                            onValueChange={(value: "HEALTHY" | "DISABLED" | "CHRONIC_ILLNESS" | "OTHER") => 
                              form.setValue('healthStatus', value)}
                            defaultValue={form.getValues('healthStatus')}
                          >
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 
                              dark:focus:border-indigo-400 transition-colors duration-200">
                              <SelectValue placeholder="Select health status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HEALTHY">Healthy</SelectItem>
                              <SelectItem value="DISABLED">Disabled</SelectItem>
                              <SelectItem value="CHRONIC_ILLNESS">Chronic Illness</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
          </div>
        </div>

                      <div className="space-y-2">
                        <Label htmlFor="numberOfFamily" className="text-slate-700 dark:text-slate-300">Number of Family Members</Label>
                        <Input
                          id="numberOfFamily"
                          type="number"
                          {...form.register('numberOfFamily', { valueAsNumber: true })}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                            transition-colors duration-200"
                          min="0"
                          placeholder="Enter number of family members"
                        />
        </div>

                      <div className="space-y-4">
                        <Label className="text-slate-700 dark:text-slate-300">Phone Numbers</Label>
                        {phoneInputs.map((phone, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-3"
                          >
                            <Input
                              value={phone}
                              onChange={(e) => {
                                const newPhones = [...phoneInputs];
                                newPhones[index] = e.target.value;
                                setPhoneInputs(newPhones);
                                form.setValue('phones', newPhones);
                              }}
                              placeholder={`Phone ${index + 1}`}
                              className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 
                                dark:focus:border-indigo-400 transition-colors duration-200"
                            />
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removePhoneInput(index)}
                                className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 
                                  transition-colors duration-200"
                              >
                                Remove
                              </Button>
                            )}
                          </motion.div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addPhoneInput}
                          className="mt-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 
                            dark:hover:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 
                            dark:hover:bg-indigo-900/50 transition-all duration-200"
                        >
                          Add Phone
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="region" className="text-slate-700 dark:text-slate-300">Region</Label>
                          <Input
                            id="region"
                            {...form.register('region')}
                            className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                              transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zone" className="text-slate-700 dark:text-slate-300">Zone</Label>
                          <Input
                            id="zone"
                            {...form.register('zone')}
                            className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                              transition-colors duration-200"
                          />
                        </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="wereda" className="text-slate-700 dark:text-slate-300">Wereda</Label>
                          <Input
                            id="wereda"
                            {...form.register('wereda')}
                            className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                              transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kebele" className="text-slate-700 dark:text-slate-300">Kebele</Label>
                          <Input
                            id="kebele"
                            {...form.register('kebele')}
                            className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                              transition-colors duration-200"
                          />
                        </div>
              </div>

                      <div className="space-y-2">
                        <Label htmlFor="houseNumber" className="text-slate-700 dark:text-slate-300">House Number (Optional)</Label>
                        <Input
                          id="houseNumber"
                          {...form.register('houseNumber')}
                          className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                            transition-colors duration-200"
                        />
                      </div>
                    </TabsContent>

                    {renderCaseInformation()}

                    <TabsContent value="office" className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="officeId" className="text-slate-700 dark:text-slate-300">Assigned Office</Label>
                          <Select
                            onValueChange={(value) => form.setValue('officeId', value)}
                            defaultValue={form.getValues('officeId')}
                          >
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-indigo-500 
                              dark:focus:border-indigo-400 transition-colors duration-200">
                              <SelectValue placeholder="Select office" />
                            </SelectTrigger>
                            <SelectContent>
                              {offices.map((office) => (
                                <SelectItem key={office.id} value={office.id}>
                                  {office.name} - {office.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-8">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 
                              dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                              Personal Information
                            </h3>
                            <div className="space-y-3 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 
                              bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Full Name:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('fullName')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Age:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('age')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Sex:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('sex')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Health Status:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('healthStatus')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Number of Family Members:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('numberOfFamily')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Phone Numbers:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('phones').join(', ')}</span>
              </div>
            </div>
          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 
                              dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                              Location Details
                            </h3>
                            <div className="space-y-3 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 
                              bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Region:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('region')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Zone:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('zone')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Wereda:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('wereda')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Kebele:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('kebele')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">House Number:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {form.getValues('houseNumber') || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 
                              dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                              Case Information
                            </h3>
                            <div className="space-y-3 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 
                              bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Case Type:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('caseType')}</span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Category:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{form.getValues('caseCategory')}</span>
                              </div>
                            </div>
              </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 
                              dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                              Office Assignment
                            </h3>
                            <div className="space-y-3 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 
                              bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Office:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {offices.find(o => o.id === form.getValues('officeId'))?.name || 'Not selected'}
                                </span>
                              </div>
                              <div className="grid grid-cols-[120px,1fr] gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Location:</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {offices.find(o => o.id === form.getValues('officeId'))?.location || 'Not selected'}
                                </span>
              </div>
              </div>
            </div>
          </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 
                            dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                            Additional Information
                          </h3>
                          <div className="space-y-4 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 
                            bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <div className="space-y-2">
                              <h4 className="font-medium text-slate-700 dark:text-slate-300">Case Details:</h4>
                              <p className="text-slate-600 dark:text-slate-400">
                                {form.getValues('caseType')} - {form.getValues('caseCategory')}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-slate-700 dark:text-slate-300">Office Assignment:</h4>
                              <p className="text-slate-600 dark:text-slate-400">
                                {offices.find(o => o.id === form.getValues('officeId'))?.name || 'Not selected'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <div className="flex justify-between mt-8">
                        <Button
                type="button"
                          onClick={() => {
                            const currentIndex = steps.findIndex(s => s.id === currentStep);
                            setCurrentStep(steps[currentIndex - 1].id);
                          }}
                          className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 
                            text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 
                            transition-all duration-200"
                        >
                          Previous
                        </Button>
                      {currentStep === 'preview' ? (
                        <Button
                type="submit"
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
                            text-white transition-all duration-200 ml-auto"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            'Submit Registration'
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            const currentIndex = steps.findIndex(s => s.id === currentStep);
                            setCurrentStep(steps[currentIndex + 1].id);
                          }}
                          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 
                            text-white transition-all duration-200"
                        >
                          Next
                        </Button>
                      )}
            </div>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 