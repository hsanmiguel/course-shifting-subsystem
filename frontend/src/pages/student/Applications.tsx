import { Card, Button, Chip, Input, Select, Label, ListBox } from '@heroui/react';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

interface Application {
  id: string;
  courseName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  lastUpdated: string;
}

export default function Applications() {
  const mockApplications: Application[] = [
    {
      id: 'APP-001',
      courseName: 'Advanced Data Structures',
      department: 'Computer Science',
      status: 'approved',
      submittedDate: '2024-01-15',
      lastUpdated: '2024-01-20',
    },
    {
      id: 'APP-002',
      courseName: 'Web Development Principles',
      department: 'Computer Science',
      status: 'pending',
      submittedDate: '2024-02-01',
      lastUpdated: '2024-02-01',
    },
    {
      id: 'APP-003',
      courseName: 'Database Systems',
      department: 'Computer Science',
      status: 'rejected',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-25',
    },
  ];

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <SidebarLayout title="My Applications" userRole="student">
      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <Input
            placeholder="Search applications..."
            className="md:flex-1"
          />
          <Select className="md:w-48">
            <Label>Filter by Status</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All Status">
                  All Status
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="pending" textValue="Pending">
                  Pending
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="approved" textValue="Approved">
                  Approved
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="rejected" textValue="Rejected">
                  Rejected
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Button variant="primary">
            New Application
          </Button>
        </div>

        {/* Applications List */}
        <div className="grid gap-4">
          {mockApplications.map((app) => (
            <Card key={app.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{app.courseName}</h3>
                    <Chip
                      color={getStatusColor(app.status)}
                      size="sm"
                      variant="flat"
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Chip>
                  </div>
                  <p className="text-sm text-gray-500">{app.department}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span>Application ID: {app.id}</span>
                    <span>Submitted: {app.submittedDate}</span>
                    <span>Updated: {app.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                  {app.status === 'pending' && (
                    <Button size="sm" variant="tertiary">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
