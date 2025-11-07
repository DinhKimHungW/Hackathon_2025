import { CreateConflictDto } from './create-conflict.dto';
declare const UpdateConflictDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateConflictDto>>;
export declare class UpdateConflictDto extends UpdateConflictDto_base {
    conflictTime?: string;
    affectedResources?: Record<string, any>;
    suggestedResolution?: Record<string, any>;
}
export {};
