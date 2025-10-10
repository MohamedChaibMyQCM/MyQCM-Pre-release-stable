import { ModeDefiner } from "../enums/mode-definier.enum";

export interface ModeFilters {
  name?: string;
  include_qcm_definer?: ModeDefiner;
  include_qcs_definer?: ModeDefiner;
  include_qroc_definer?: ModeDefiner;
  time_limit_definer?: ModeDefiner;
  number_of_questions_definer?: ModeDefiner;
  randomize_questions_order_definer?: ModeDefiner;
  randomize_options_order_definer?: ModeDefiner;
}
