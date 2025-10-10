import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { DateUtils } from "common/utils/date.util";

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any) {
    if (!value || value === "null" || value === "undefined") {
      return null;
    }
    return DateUtils.validateDate(value);
  }
}
