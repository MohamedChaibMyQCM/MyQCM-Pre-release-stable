import { ReportCategory } from "../enum/report-category.enum";
import { ReportSeverity } from "../enum/report-severity.enum";
import { ReportStatus } from "../enum/report-status.enum";

export interface IReportFilters {
  title?: string;
  status?: ReportStatus;
  category?: ReportCategory;
  severity?: ReportSeverity;
  user_id?: string;
  status_in?: ReportStatus[];
  category_in?: ReportCategory[];
  severity_in?: ReportSeverity[];
}
