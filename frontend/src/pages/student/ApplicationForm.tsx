import { Card, Button, TextField, Input, TextArea, Checkbox, Label } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/services/api-client';
import { SubmissionSuccess } from '@/components/atoms/SubmissionSuccess';
import { SubmissionError } from '@/components/atoms/SubmissionError';
import { SubmissionPending } from '@/components/atoms/SubmissionPending';
import { SubmissionConfirmationDialog } from '@/components/molecules/SubmissionConfirmationDialog';
import { Upload, X } from 'lucide-react';
import type { ShiftingApplication } from '@/types';

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<ShiftingApplication | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    currentDept: '',
    currentYear: '',
    gpa: '',
    credits: '',
    desiredDept: '',
    targetSemester: '',
    motivation: '',
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const fullName = localStorage.getItem('fullName') || '';
    const studentId = localStorage.getItem('studentId') || '';
    const email = localStorage.getItem('email') || '';

    setFormData(prev => ({
      ...prev,
      fullName,
      studentId,
      email,
    }));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      return `${file.name} has invalid format. Allowed: PDF, DOC, DOCX`;
    }
    if (file.size > maxSize) {
      return `${file.name} exceeds 5MB limit`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        newFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId) {
      setError('Student ID is required. Please log in.');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!formData.currentDept.trim()) {
      setError('Current department is required.');
      return;
    }

    if (!formData.desiredDept.trim()) {
      setError('Desired department is required.');
      return;
    }

    if (!formData.motivation.trim()) {
      setError('Reason for transfer is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await apiClient.submitApplication({
        student_id: formData.studentId,
        student_name: formData.fullName.trim(),
        current_program: formData.currentDept.trim(),
        target_program: formData.desiredDept.trim(),
        reason_for_shifting: formData.motivation.trim(),
      });

      setSubmittedApplication(response);
      setShowConfirmation(true);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          fullName: '',
          studentId: localStorage.getItem('studentId') || '',
          email: '',
          phone: '',
          currentDept: '',
          currentYear: '',
          gpa: '',
          credits: '',
          desiredDept: '',
          targetSemester: '',
          motivation: '',
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout title="Application Form" userRole="student">
      <div className="w-full space-y-6">
        {isSubmitting && (
          <SubmissionPending message="Processing your application..." />
        )}
        
        {submitSuccess && (
          <SubmissionSuccess 
            applicationId={submittedApplication?.application_id}
            studentName={submittedApplication?.student_name}
            onDismiss={() => setSubmitSuccess(false)}
          />
        )}
        
        {error && (
          <SubmissionError 
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <SubmissionConfirmationDialog
          isOpen={showConfirmation}
          application={submittedApplication ?? undefined}
          onClose={() => setShowConfirmation(false)}
          onGoToDashboard={() => {
            setShowConfirmation(false);
            window.location.href = '/student';
          }}
        />

        {/* Form Section */}
        <Card className="rounded-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField isRequired className="w-full" name="fullName">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                </TextField>
                <TextField isDisabled className="w-full" name="studentId" value={formData.studentId}>
                  <Label>Student ID</Label>
                  <Input placeholder="STU-YYYY-0000" />
                </TextField>
                <TextField isRequired className="w-full" name="email" type="email">
                  <Label>Email</Label>
                  <Input 
                    placeholder="your.email@university.edu"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </TextField>
                <TextField isRequired className="w-full" name="phone">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </TextField>
              </div>
            </div>

            {/* Current Program Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Current Program</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField isRequired className="w-full" name="currentDept">
                  <Label>Current Department</Label>
                  <Input 
                    placeholder="Enter your current department"
                    value={formData.currentDept}
                    onChange={(e) => handleChange('currentDept', e.target.value)}
                  />
                </TextField>
                <TextField isRequired className="w-full" name="currentYear">
                  <Label>Current Year</Label>
                  <Input 
                    placeholder="e.g., First Year, Second Year"
                    value={formData.currentYear}
                    onChange={(e) => handleChange('currentYear', e.target.value)}
                  />
                </TextField>
                <TextField isRequired className="w-full" name="gpa" type="number">
                  <Label>Current GPA</Label>
                  <Input 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => handleChange('gpa', e.target.value)}
                  />
                </TextField>
                <TextField isRequired className="w-full" name="credits" type="number">
                  <Label>Completed Credits</Label>
                  <Input 
                    placeholder="0"
                    value={formData.credits}
                    onChange={(e) => handleChange('credits', e.target.value)}
                  />
                </TextField>
              </div>
            </div>

            {/* Transfer Program Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Transfer Program Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField isRequired className="w-full" name="desiredDept">
                  <Label>Desired Department</Label>
                  <Input 
                    placeholder="Enter desired department"
                    value={formData.desiredDept}
                    onChange={(e) => handleChange('desiredDept', e.target.value)}
                  />
                </TextField>
                <TextField isRequired className="w-full" name="targetSemester">
                  <Label>Target Start Semester</Label>
                  <Input 
                    placeholder="Fall 2024"
                    value={formData.targetSemester}
                    onChange={(e) => handleChange('targetSemester', e.target.value)}
                  />
                </TextField>
              </div>
            </div>

            {/* Motivation Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Application Statement</h3>
              <TextField isRequired className="w-full" name="motivation">
                <Label>Why are you applying for transfer?</Label>
                <TextArea 
                  placeholder="Explain your reasons for transferring and your career goals..." 
                  rows={5}
                  value={formData.motivation}
                  onChange={(e) => handleChange('motivation', e.target.value)}
                />
              </TextField>
            </div>

            {/* Supporting Documents Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Supporting Documents</h3>
              <div className="space-y-4">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop your documents here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB each)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Uploaded Files ({uploadedFiles.length})
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Upload className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-slate-400 hover:text-red-600 transition flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Agreements Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Acknowledgments</h3>
              <div className="space-y-3">
                <Checkbox isRequired>
                  <span className="text-sm">
                    I confirm that all information provided is true and accurate
                  </span>
                </Checkbox>
                <Checkbox isRequired>
                  <span className="text-sm">
                    I understand the transfer policies and course requirements
                  </span>
                </Checkbox>
                <Checkbox isRequired>
                  <span className="text-sm">
                    I agree to the terms and conditions of the course transfer program
                  </span>
                </Checkbox>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isPending={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Section */}
        <Card className="rounded-md border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Before You Submit</p>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Review all course equivalencies to ensure accuracy</li>
            <li>Ensure all required documents are uploaded</li>
            <li>Double-check your contact information is current</li>
            <li>You can edit your application until the deadline</li>
          </ul>
        </Card>
      </div>
    </SidebarLayout>
  );
}
