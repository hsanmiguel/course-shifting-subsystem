import { Card, Button } from '@heroui/react';
import { ShiftingApplication } from '@/types';
import { StatusBadge } from '@/components/atoms/StatusBadge';

interface ApplicationCardProps {
  application: ShiftingApplication;
  onView?: (app: ShiftingApplication) => void;
}

export const ApplicationCard = ({
  application,
  onView,
}: ApplicationCardProps) => {
  return (
    <Card className="mb-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <Card.Content className="gap-4 p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-gray-900">{application.studentName}</p>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-sm text-gray-600">{application.studentEmail}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Courses</p>
              <p className="font-medium text-gray-900">{application.currentCourses}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Desired Courses</p>
              <p className="font-medium text-gray-900">{application.desiredCourses}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Reason</p>
            <p className="text-sm text-gray-700">{application.reason}</p>
          </div>
        </div>

        {onView && (
          <Button size="sm" variant="primary" fullWidth onPress={() => onView(application)}>
            View Details
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};