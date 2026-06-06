export declare class CreateAttendanceDto {
    personnelId: number;
    projectId: number;
    date: string;
    status: string;
    timeIn?: string;
    timeOut?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    photoUrl?: string;
}
