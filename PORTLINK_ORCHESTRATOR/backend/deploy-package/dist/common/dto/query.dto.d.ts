export declare enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare class QueryDto {
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    filter?: string;
}
