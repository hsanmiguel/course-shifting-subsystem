import type { Key } from '@heroui/react';

import { Card, Button, TextField, Input, TextArea, Checkbox, Label, FieldError, ListBox, Select } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { useRef, useState } from 'react';
import { apiClient } from '@/services/api-client';
import { authService } from '@/services/auth';
import { SubmissionSuccess } from '@/components/atoms/SubmissionSuccess';
import { SubmissionError } from '@/components/atoms/SubmissionError';
import { SubmissionPending } from '@/components/atoms/SubmissionPending';
import { SubmissionConfirmationDialog } from '@/components/molecules/SubmissionConfirmationDialog';
import { programOptions } from '@/constants/programs';
import type { ShiftingApplication } from '@/types';

function getStudentIdFromToken() {
  const token = apiClient.getAuthToken();
  const [prefix, role, studentId] = token.split(':');
  return prefix === 'dev' && role === 'student' ? studentId : '';
}

function getStudentProfileFromAuth() {
  const user = authService.getCurrentUser();

  return {
    fullName: user?.name || localStorage.getItem('studentName') || '',
    studentId: user?.id || getStudentIdFromToken() || localStorage.getItem('studentId') || '',
    email: user?.email || localStorage.getItem('userEmail') || '',
  };
}

const checkboxControlClass =
  'size-5 shrink-0 overflow-hidden rounded border-2 border-slate-500 bg-white shadow-sm transition before:rounded-[inherit] data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-600 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[focus-visible=true]:ring-offset-2';

const checkboxIndicatorClass =
  'flex size-full items-center justify-center text-white [&>svg]:size-3.5 [&>svg]:stroke-[3]';

const checkboxLabelClass = 'font-medium text-slate-800';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const yearLevelOptions = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
];

const selectPopoverClass = 'z-50 !max-h-72 w-[min(var(--trigger-width),calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain';
const programOptionClass = 'grid grid-cols-[minmax(4.5rem,7.5rem)_1fr] items-start gap-3 whitespace-normal pr-8';
const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENT_COUNT = 5;
const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

type SupportingAttachmentState = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  isImage: boolean;
};

const fieldOrder = [
  'fullName',
  'studentId',
  'email',
  'phone',
  'currentDept',
  'currentYear',
  'gpa',
  'credits',
  'desiredDept',
  'targetSemester',
  'motivation',
  'acknowledgements',
];

const fieldFocusIds: Record<string, string> = {
  fullName: 'full-name',
  studentId: 'student-id',
  email: 'email',
  phone: 'phone',
  currentDept: 'current-program',
  currentYear: 'current-year',
  gpa: 'gpa',
  credits: 'credits',
  desiredDept: 'desired-program',
  targetSemester: 'target-semester',
  motivation: 'motivation',
  acknowledgements: 'information-is-accurate',
};

export default function ApplicationForm() {
  const initialProfile = getStudentProfileFromAuth();
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isAttachmentDropActive, setIsAttachmentDropActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<ShiftingApplication | null>(null);
  const [attachments, setAttachments] = useState<SupportingAttachmentState[]>([]);
  const [documents, setDocuments] = useState({
    officialTranscripts: true,
    recommendationLetter: true,
    additionalEssays: false,
  });
  const [acknowledgements, setAcknowledgements] = useState({
    informationIsAccurate: false,
    understandsTransferPolicies: false,
    agreesToTerms: false,
  });
  const [formData, setFormData] = useState({
    fullName: initialProfile.fullName,
    studentId: initialProfile.studentId,
    email: initialProfile.email,
    phone: '',
    currentDept: '',
    currentYear: '',
    gpa: '',
    credits: '',
    desiredDept: '',
    targetSemester: '',
    motivation: '',
  });

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!formData.studentId.trim()) nextErrors.studentId = 'Student ID is required. Please log in again.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!formData.currentDept.trim()) nextErrors.currentDept = 'Current program is required.';
    if (!formData.currentYear.trim()) nextErrors.currentYear = 'Current year is required.';
    if (!formData.gpa.trim()) nextErrors.gpa = 'Current GPA is required.';
    if (!formData.credits.trim()) nextErrors.credits = 'Completed credits are required.';
    if (!formData.desiredDept.trim()) nextErrors.desiredDept = 'Desired program is required.';
    if (!formData.targetSemester.trim()) nextErrors.targetSemester = 'Target start semester is required.';
    if (!formData.motivation.trim()) nextErrors.motivation = 'Reason for transfer is required.';

    if (
      !acknowledgements.informationIsAccurate ||
      !acknowledgements.understandsTransferPolicies ||
      !acknowledgements.agreesToTerms
    ) {
      nextErrors.acknowledgements = 'Please accept all acknowledgments before submitting.';
    }

    return nextErrors;
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleProgramChange = (field: 'currentDept' | 'desiredDept', value: Key | Key[] | null) => {
    if (Array.isArray(value)) return;
    handleChange(field, value?.toString() ?? '');
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
      reader.readAsDataURL(file);
    });

  const isAllowedAttachment = (file: File) => {
    if (ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
      return true;
    }

    const lowerName = file.name.toLowerCase();
    return ALLOWED_ATTACHMENT_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
  };

  const addAttachments = async (files: File[]) => {
    const incomingFiles = files.filter((file) => file.size > 0);

    if (incomingFiles.length === 0) {
      return;
    }

    const invalidFiles = incomingFiles.filter((file) => !isAllowedAttachment(file));
    if (invalidFiles.length > 0) {
      setAttachmentError('Only PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP, and GIF files are supported.');
      return;
    }

    const oversizedFiles = incomingFiles.filter((file) => file.size > MAX_ATTACHMENT_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      setAttachmentError('Each supporting file must be 5MB or smaller.');
      return;
    }

    const allowedSlots = Math.max(0, MAX_ATTACHMENT_COUNT - attachments.length);
    if (allowedSlots === 0) {
      setAttachmentError(`You can attach up to ${MAX_ATTACHMENT_COUNT} files.`);
      return;
    }

    const filesToAdd = incomingFiles.slice(0, allowedSlots);
    if (filesToAdd.length < incomingFiles.length) {
      setAttachmentError(`Only ${MAX_ATTACHMENT_COUNT} files can be attached at once.`);
    } else {
      setAttachmentError(null);
    }

    const nextAttachments = await Promise.all(
      filesToAdd.map(async (file) => ({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        dataUrl: await readFileAsDataUrl(file),
        isImage: file.type.startsWith('image/'),
      })),
    );

    setAttachments((current) => {
      const merged = [...current];

      for (const attachment of nextAttachments) {
        if (
          merged.some(
            (existing) =>
              existing.fileName === attachment.fileName &&
              existing.sizeBytes === attachment.sizeBytes &&
              existing.mimeType === attachment.mimeType,
          )
        ) {
          continue;
        }

        merged.push(attachment);
      }

      return merged.slice(0, MAX_ATTACHMENT_COUNT);
    });
  };

  const handleAttachmentInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    await addAttachments(files);
  };

  const handleAttachmentDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsAttachmentDropActive(false);
    await addAttachments(Array.from(event.dataTransfer.files ?? []));
  };

  const removeAttachment = (fileName: string, sizeBytes: number) => {
    setAttachments((current) => current.filter((attachment) => !(attachment.fileName === fileName && attachment.sizeBytes === sizeBytes)));
  };

  const handleYearChange = (value: Key | Key[] | null) => {
    if (Array.isArray(value)) return;
    handleChange('currentYear', value?.toString() ?? '');
  };

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstField = fieldOrder.find(field => errors[field]);
    if (!firstField) return;

    requestAnimationFrame(() => {
      const element = document.getElementById(fieldFocusIds[firstField]);

      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (element instanceof HTMLElement && !element.hasAttribute('disabled')) {
        element.focus({ preventScroll: true });
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError('Please complete the highlighted fields before submitting.');
      scrollToFirstError(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setFieldErrors({});

      const response = await apiClient.submitApplication({
        student_id: formData.studentId,
        student_name: formData.fullName.trim(),
        student_email: formData.email.trim() || null,
        phone_number: formData.phone.trim() || null,
        current_program: formData.currentDept.trim(),
        current_year: formData.currentYear.trim() || null,
        target_program: formData.desiredDept.trim(),
        target_semester: formData.targetSemester.trim() || null,
        reason_for_shifting: formData.motivation.trim(),
        self_reported_gpa: formData.gpa || null,
        self_reported_credits: formData.credits || null,
        official_transcripts: documents.officialTranscripts,
        recommendation_letter: documents.recommendationLetter,
        additional_essays: documents.additionalEssays,
        supporting_attachments: attachments.map((attachment) => ({
          file_name: attachment.fileName,
          mime_type: attachment.mimeType,
          size_bytes: attachment.sizeBytes,
          data_url: attachment.dataUrl,
        })),
        information_is_accurate: acknowledgements.informationIsAccurate,
        understands_transfer_policies: acknowledgements.understandsTransferPolicies,
        agrees_to_terms: acknowledgements.agreesToTerms,
      });

      setSubmittedApplication(response);
      setShowConfirmation(true);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        const profile = getStudentProfileFromAuth();

        setFormData({
          fullName: profile.fullName,
          studentId: profile.studentId,
          email: profile.email,
          phone: '',
          currentDept: '',
          currentYear: '',
          gpa: '',
          credits: '',
          desiredDept: '',
          targetSemester: '',
          motivation: '',
        });
        setDocuments({
          officialTranscripts: true,
          recommendationLetter: true,
          additionalEssays: false,
        });
        setAttachments([]);
        setAttachmentError(null);
        setAcknowledgements({
          informationIsAccurate: false,
          understandsTransferPolicies: false,
          agreesToTerms: false,
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
          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField isRequired isInvalid={!!fieldErrors.fullName} className="w-full" name="fullName">
                  <Label>Full Name</Label>
                  <Input 
                    id="full-name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                  {fieldErrors.fullName && <FieldError>{fieldErrors.fullName}</FieldError>}
                </TextField>
                <TextField isDisabled isInvalid={!!fieldErrors.studentId} className="w-full" name="studentId" value={formData.studentId}>
                  <Label>Student ID</Label>
                  <Input id="student-id" placeholder="STU-YYYY-0000" />
                  {fieldErrors.studentId && <FieldError>{fieldErrors.studentId}</FieldError>}
                </TextField>
                <TextField isRequired isInvalid={!!fieldErrors.email} className="w-full" name="email" type="email">
                  <Label>Email</Label>
                  <Input 
                    id="email"
                    placeholder="your.email@gbox.ph"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
                </TextField>
                <TextField isRequired isInvalid={!!fieldErrors.phone} className="w-full" name="phone">
                  <Label>Phone Number</Label>
                  <Input 
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  {fieldErrors.phone && <FieldError>{fieldErrors.phone}</FieldError>}
                </TextField>
              </div>
            </div>

            {/* Current Program Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Current Program</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  isRequired
                  isInvalid={!!fieldErrors.currentDept}
                  className="w-full"
                  name="currentDept"
                  placeholder="Select your current program"
                  value={formData.currentDept || null}
                  onChange={(value) => handleProgramChange('currentDept', value)}
                >
                  <Label>Current Program</Label>
                  <Select.Trigger id="current-program">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className={selectPopoverClass} placement="bottom start">
                    <ListBox>
                      {programOptions.map((program) => (
                        <ListBox.Item
                          key={program.id}
                          id={program.id}
                          textValue={`${program.id} ${program.name}`}
                          className={programOptionClass}
                        >
                          <span className="font-semibold text-slate-950">{program.id}</span>
                          <span className="min-w-0 text-slate-600">{program.name}</span>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  {fieldErrors.currentDept && <FieldError>{fieldErrors.currentDept}</FieldError>}
                </Select>
                <Select
                  isRequired
                  isInvalid={!!fieldErrors.currentYear}
                  className="w-full"
                  name="currentYear"
                  placeholder="Select year level"
                  value={formData.currentYear || null}
                  onChange={handleYearChange}
                >
                  <Label>Current Year</Label>
                  <Select.Trigger id="current-year">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className={selectPopoverClass} placement="bottom start">
                    <ListBox>
                      {yearLevelOptions.map((yearLevel) => (
                        <ListBox.Item key={yearLevel} id={yearLevel} textValue={yearLevel}>
                          {yearLevel}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  {fieldErrors.currentYear && <FieldError>{fieldErrors.currentYear}</FieldError>}
                </Select>
                <TextField isRequired isInvalid={!!fieldErrors.gpa} className="w-full" name="gpa" type="number">
                  <Label>Current GPA</Label>
                  <Input 
                    id="gpa"
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => handleChange('gpa', e.target.value)}
                  />
                  {fieldErrors.gpa && <FieldError>{fieldErrors.gpa}</FieldError>}
                </TextField>
                <TextField isRequired isInvalid={!!fieldErrors.credits} className="w-full" name="credits" type="number">
                  <Label>Completed Credits</Label>
                  <Input 
                    id="credits"
                    placeholder="0"
                    value={formData.credits}
                    onChange={(e) => handleChange('credits', e.target.value)}
                  />
                  {fieldErrors.credits && <FieldError>{fieldErrors.credits}</FieldError>}
                </TextField>
              </div>
            </div>

            {/* Transfer Program Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Transfer Program Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  isRequired
                  isInvalid={!!fieldErrors.desiredDept}
                  className="w-full"
                  name="desiredDept"
                  placeholder="Select desired program"
                  value={formData.desiredDept || null}
                  onChange={(value) => handleProgramChange('desiredDept', value)}
                >
                  <Label>Desired Program</Label>
                  <Select.Trigger id="desired-program">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className={selectPopoverClass} placement="bottom start">
                    <ListBox>
                      {programOptions.map((program) => (
                        <ListBox.Item
                          key={program.id}
                          id={program.id}
                          textValue={`${program.id} ${program.name}`}
                          className={programOptionClass}
                        >
                          <span className="font-semibold text-slate-950">{program.id}</span>
                          <span className="min-w-0 text-slate-600">{program.name}</span>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                  {fieldErrors.desiredDept && <FieldError>{fieldErrors.desiredDept}</FieldError>}
                </Select>
                <TextField isRequired isInvalid={!!fieldErrors.targetSemester} className="w-full" name="targetSemester">
                  <Label>Target Start Semester</Label>
                  <Input 
                    id="target-semester"
                    placeholder="Fall 2024"
                    value={formData.targetSemester}
                    onChange={(e) => handleChange('targetSemester', e.target.value)}
                  />
                  {fieldErrors.targetSemester && <FieldError>{fieldErrors.targetSemester}</FieldError>}
                </TextField>
              </div>
            </div>

            {/* Motivation Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Application Statement</h3>
              <TextField isRequired isInvalid={!!fieldErrors.motivation} className="w-full" name="motivation">
                <Label>Why are you applying for transfer?</Label>
                <TextArea 
                  id="motivation"
                  placeholder="Explain your reasons for transferring and your career goals..." 
                  rows={5}
                  value={formData.motivation}
                  onChange={(e) => handleChange('motivation', e.target.value)}
                />
                {fieldErrors.motivation && <FieldError>{fieldErrors.motivation}</FieldError>}
              </TextField>
            </div>

            {/* Supporting Documents Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Supporting Documents</h3>
              <div className="space-y-4">
                <input
                  ref={attachmentInputRef}
                  className="hidden"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleAttachmentInputChange}
                />
                <div
                  className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition ${
                    isAttachmentDropActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onClick={() => attachmentInputRef.current?.click()}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setIsAttachmentDropActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsAttachmentDropActive(true);
                  }}
                  onDragLeave={() => setIsAttachmentDropActive(false)}
                  onDrop={handleAttachmentDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      attachmentInputRef.current?.click();
                    }
                  }}
                >
                  <p className="text-sm text-gray-600">
                    📎 Drag and drop files here or click to browse
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Accepted formats: PNG, JPG, JPEG, WEBP, GIF, PDF, DOC, DOCX. Max 5MB each, up to 5 files.
                  </p>
                </div>
                {attachmentError && <p className="text-sm text-red-600">{attachmentError}</p>}
                {attachments.length > 0 && (
                  <div className="space-y-3 rounded-md border border-gray-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">Selected attachments</p>
                      <p className="text-xs text-slate-500">{attachments.length} of {MAX_ATTACHMENT_COUNT} attached</p>
                    </div>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div key={`${attachment.fileName}-${attachment.sizeBytes}`} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                              {attachment.isImage ? (
                                <img src={attachment.dataUrl} alt={attachment.fileName} className="h-full w-full object-cover" />
                              ) : (
                                <span>FILE</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{attachment.fileName}</p>
                              <p className="text-xs text-slate-500">
                                {Math.max(1, Math.round(attachment.sizeBytes / 1024))} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                            onClick={() => removeAttachment(attachment.fileName, attachment.sizeBytes)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Checkbox
                    id="official-transcripts"
                    className="items-start gap-3"
                    isSelected={documents.officialTranscripts}
                    onChange={(isSelected) => setDocuments(prev => ({ ...prev, officialTranscripts: isSelected }))}
                  >
                    <Checkbox.Control className={checkboxControlClass}>
                      <Checkbox.Indicator className={checkboxIndicatorClass} />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label className={checkboxLabelClass} htmlFor="official-transcripts">Official transcripts</Label>
                    </Checkbox.Content>
                  </Checkbox>
                  <Checkbox
                    id="recommendation-letter"
                    className="items-start gap-3"
                    isSelected={documents.recommendationLetter}
                    onChange={(isSelected) => setDocuments(prev => ({ ...prev, recommendationLetter: isSelected }))}
                  >
                    <Checkbox.Control className={checkboxControlClass}>
                      <Checkbox.Indicator className={checkboxIndicatorClass} />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label className={checkboxLabelClass} htmlFor="recommendation-letter">Letter of recommendation</Label>
                    </Checkbox.Content>
                  </Checkbox>
                  <Checkbox
                    id="additional-essays"
                    className="items-start gap-3"
                    isSelected={documents.additionalEssays}
                    onChange={(isSelected) => setDocuments(prev => ({ ...prev, additionalEssays: isSelected }))}
                  >
                    <Checkbox.Control className={checkboxControlClass}>
                      <Checkbox.Indicator className={checkboxIndicatorClass} />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label className={checkboxLabelClass} htmlFor="additional-essays">Additional essays</Label>
                    </Checkbox.Content>
                  </Checkbox>
                </div>
              </div>
            </div>

            {/* Agreements Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Acknowledgments</h3>
              <div className="space-y-3">
                <Checkbox
                  id="information-is-accurate"
                  className="items-start gap-3"
                  isSelected={acknowledgements.informationIsAccurate}
                  onChange={(isSelected) => {
                    setAcknowledgements(prev => ({ ...prev, informationIsAccurate: isSelected }));
                    clearFieldError('acknowledgements');
                  }}
                >
                  <Checkbox.Control className={checkboxControlClass}>
                    <Checkbox.Indicator className={checkboxIndicatorClass} />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className={checkboxLabelClass} htmlFor="information-is-accurate">
                      I confirm that all information provided is true and accurate
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  id="understands-transfer-policies"
                  className="items-start gap-3"
                  isSelected={acknowledgements.understandsTransferPolicies}
                  onChange={(isSelected) => {
                    setAcknowledgements(prev => ({ ...prev, understandsTransferPolicies: isSelected }));
                    clearFieldError('acknowledgements');
                  }}
                >
                  <Checkbox.Control className={checkboxControlClass}>
                    <Checkbox.Indicator className={checkboxIndicatorClass} />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className={checkboxLabelClass} htmlFor="understands-transfer-policies">
                      I understand the transfer policies and course requirements
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  id="agrees-to-terms"
                  className="items-start gap-3"
                  isSelected={acknowledgements.agreesToTerms}
                  onChange={(isSelected) => {
                    setAcknowledgements(prev => ({ ...prev, agreesToTerms: isSelected }));
                    clearFieldError('acknowledgements');
                  }}
                >
                  <Checkbox.Control className={checkboxControlClass}>
                    <Checkbox.Indicator className={checkboxIndicatorClass} />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className={checkboxLabelClass} htmlFor="agrees-to-terms">
                      I agree to the terms and conditions of the course transfer program
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                {fieldErrors.acknowledgements && (
                  <p className="text-sm font-medium text-red-600">{fieldErrors.acknowledgements}</p>
                )}
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