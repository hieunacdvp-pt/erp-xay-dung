export class CreateAttendanceDto {
  personnelId: number;
  projectId: number;
  date: string;
  status: string; // PRESENT, ABSENT, HALF_DAY
  
  timeIn?: string;
  timeOut?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  photoUrl?: string;
}
