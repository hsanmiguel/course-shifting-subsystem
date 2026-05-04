import { Card, Button, TextField, Input, TextArea, Select, ListBox, Checkbox, Label } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { useState } from 'react';

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Application submitted successfully!');
    }, 2000);
  };

  return (
    <SidebarLayout title="Application Form" userRole="student">
      <div className="max-w-3xl space-y-6">
        {/* Form Section */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField isRequired className="w-full" name="fullName">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter your full name" />
                </TextField>
                <TextField isDisabled className="w-full" name="studentId" value="STU-2021-0001">
                  <Label>Student ID</Label>
                  <Input placeholder="STU-YYYY-0000" />
                </TextField>
                <TextField isRequired className="w-full" name="email" type="email">
                  <Label>Email</Label>
                  <Input placeholder="your.email@university.edu" />
                </TextField>
                <TextField isRequired className="w-full" name="phone">
                  <Label>Phone Number</Label>
                  <Input placeholder="+1 (555) 123-4567" />
                </TextField>
              </div>
            </div>

            {/* Current Program Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Current Program</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select isRequired className="w-full" name="currentDept" placeholder="Select your department">
                  <Label>Current Department</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="cs" textValue="Computer Science">
                        Computer Science
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="eng" textValue="Engineering">
                        Engineering
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="bus" textValue="Business Administration">
                        Business Administration
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="lib" textValue="Liberal Arts">
                        Liberal Arts
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select isRequired className="w-full" name="currentYear" placeholder="Select your current year">
                  <Label>Current Year</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="1" textValue="First Year">
                        First Year
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="2" textValue="Second Year">
                        Second Year
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="3" textValue="Third Year">
                        Third Year
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="4" textValue="Fourth Year">
                        Fourth Year
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
                <TextField isRequired className="w-full" name="gpa" type="number">
                  <Label>Current GPA</Label>
                  <Input placeholder="0.00" step="0.01" min="0" max="4" />
                </TextField>
                <TextField isRequired className="w-full" name="credits" type="number">
                  <Label>Completed Credits</Label>
                  <Input placeholder="0" />
                </TextField>
              </div>
            </div>

            {/* Transfer Program Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Transfer Program Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select isRequired className="w-full" name="desiredDept" placeholder="Select desired department">
                  <Label>Desired Department</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="cs" textValue="Computer Science">
                        Computer Science
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="eng" textValue="Engineering">
                        Engineering
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="bus" textValue="Business Administration">
                        Business Administration
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="lib" textValue="Liberal Arts">
                        Liberal Arts
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="med" textValue="Medicine">
                        Medicine
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
                <TextField isRequired className="w-full" name="targetSemester">
                  <Label>Target Start Semester</Label>
                  <Input placeholder="Fall 2024" />
                </TextField>
              </div>
            </div>

            {/* Motivation Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Application Statement</h3>
              <TextField isRequired className="w-full" name="motivation">
                <Label>Why are you applying for transfer?</Label>
                <TextArea placeholder="Explain your reasons for transferring and your career goals..." rows={5} />
              </TextField>
            </div>

            {/* Documents Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Supporting Documents</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer transition">
                  <p className="text-sm text-gray-600">
                    📎 Drag and drop your documents here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB each)
                  </p>
                </div>
                <div className="space-y-2">
                  <Checkbox defaultSelected>
                    <span className="text-sm">Official transcripts</span>
                  </Checkbox>
                  <Checkbox defaultSelected>
                    <span className="text-sm">Letter of recommendation</span>
                  </Checkbox>
                  <Checkbox>
                    <span className="text-sm">Additional essays</span>
                  </Checkbox>
                </div>
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
        <Card className="p-6 bg-amber-50 border border-amber-200">
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
