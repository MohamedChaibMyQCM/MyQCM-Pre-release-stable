import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsUUID } from "class-validator";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { StudyField } from "../enums/user-study-field.enum";

export class CreateUserProfileDto {
  @ApiProperty({
    description: "Field of study",
    example: StudyField.general_medicine,
    enum: StudyField,
  })
  @IsEnum(StudyField)
  study_field: StudyField;

  @ApiProperty({
    description: "Year of study",
    example: YearOfStudy.first_year,
    enum: YearOfStudy,
  })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;

  @ApiProperty({
    description: "UUID of the unit",
    example: "e3b0c442-98fc-1c14-9afa-9cfc4b00f7b8",
  })
  @IsUUID("4")
  unit: string;

  @ApiProperty({
    description: "UUID of the university",
    example: "e3b0c442-98fc-1c14-9afa-9cfc4b00f7b8",
  })
  @IsUUID("4")
  university: string;

  @ApiPropertyOptional({
    description: "Date of excpected unit ending",
    example: "2021-01-01",
  })
  @IsDateString()
  ending_date: Date;

  @ApiProperty({
    description: "UUID of the university",
    example: "e3b0c442-98fc-1c14-9afa-9cfc4b00f7b8",
  })
  @IsUUID("4")
  mode: string;
  /*@ApiProperty({
      description: "UUID of the faculty",
      example: "e3b0c442-98fc-1c14-9afa-9cfc4b00f7b8",
    })
    @IsUUID("4")
    faculty: string;
  
  
    @ApiProperty({
      description: "Feedback preference",
      example: FeedbackPreference.detailed_explanations,
      enum: FeedbackPreference,
    })
    @IsEnum(FeedbackPreference)
    feedback_preference: FeedbackPreference;
  
    @ApiProperty({
      description: "Learning style",
      example: LearningStyle.visual_aids,
      enum: LearningStyle,
    })
    @IsEnum(LearningStyle)
    learning_style: LearningStyle;
  
    @ApiProperty({
      description: "Learning pace",
      example: "Moderate",
    })
    @IsString()
    @IsNotEmpty()
    learning_pace: string;
  
    @ApiProperty({
      description: "Study habits",
      example: StudyHabit.frequent_short_sessions,
      enum: StudyHabit,
    })
    @IsEnum(StudyHabit)
    study_habits: StudyHabit;
  
    @ApiProperty({
      description: "Preferred content",
      example: ContentFormat.flashcards,
      enum: ContentFormat,
    })
    @IsEnum(ContentFormat)
    prefered_content: ContentFormat;
  
    @ApiProperty({
      description: "Clinical experience",
      example: ClinicalExperience.yes,
      enum: ClinicalExperience,
    })
    @IsEnum(ClinicalExperience)
    clinical_experience: ClinicalExperience;
  
    @ApiProperty({
      description: "Learning goals",
      example: [LearningGoal.core_concepts, LearningGoal.practical_knowledge],
      enum: LearningGoal,
      isArray: true,
    })
    @IsEnum(LearningGoal)
    @IsNotEmpty()
    learning_goals: LearningGoal;
  
    @ApiProperty({
      description: "Learning path",
      example: LearningPath.free,
      enum: LearningPath,
    })
    @IsEnum(LearningPath)
    learning_path: LearningPath;
  
    @ApiProperty({
      description: "Memory retention",
      example: MemoryRetention.high,
      enum: MemoryRetention,
    })
    @IsEnum(MemoryRetention)
    memory_retention: MemoryRetention;
  
    @ApiProperty({
      description: "Attention span",
      example: AttentionSpan.long,
      enum: AttentionSpan,
    })
    @IsEnum(AttentionSpan)
    attention_span: AttentionSpan;*/
}
