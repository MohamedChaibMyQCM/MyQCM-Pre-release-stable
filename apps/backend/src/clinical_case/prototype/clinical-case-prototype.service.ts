import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicalCase } from "../entities/clinical_case.entity";
import { Mcq } from "src/mcq/entities/mcq.entity";
import {
  PrototypeClinicalCaseDto,
  PrototypeClinicalCaseSubmissionResult,
} from "./clinical-case-prototype.dto";
import { FacultyType } from "src/faculty/types/enums/faculty-type.enum";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { PrototypeClinicalCaseSubmitDto } from "./clinical-case-prototype-submit.dto";

const DEMO_CASE_TEMPLATE: PrototypeClinicalCaseDto = {
  id: "demo-case-paris-58yo",
  title: "Douleur thoracique aigue chez un homme de 58 ans",
  description:
    "Cas clinique destine aux etudiants en medecine : prise en charge d'un syndrome coronarien aigu inferieur.",
  scenario:
    "Monsieur L., 58 ans, fumeur actif, consulte aux urgences pour une douleur thoracique constrictive apparue il y a 45 minutes, associee a une dyspnee et des sueurs froides. La tension arterielle est a 145/90 mmHg, la frequence cardiaque a 96 bpm et la saturation en oxygene a 94 % a l'air ambiant.",
  objectives: [
    "Identifier les signes cliniques d'un syndrome coronarien aigu inferieur.",
    "Comprendre la strategie diagnostique initiale aux urgences.",
    "Decrire la prise en charge therapeutique d'un infarctus du myocarde avec sus-decalage du ST.",
  ],
  tags: [
    "Equipe pedagogique",
    "Faculte de medecine de Paris",
    "General Medicine",
    "Fourth Year",
    "Promo 2025",
  ],
  author: "Equipe pedagogique - Faculte de medecine de Paris",
  faculty_type: FacultyType.general_medicine,
  year_of_study: YearOfStudy.fourth_year,
  promo: new Date().getFullYear(),
  mcqs: [
    {
      id: "demo-case-paris-58yo-q1",
      question:
        "Un homme de 58 ans se presente aux urgences pour une douleur thoracique constrictive irradiant vers le bras gauche depuis 45 minutes. Quel est l'examen complementaire prioritaire a realiser a l'admission ?",
      type: "qcm",
      estimated_time: 90,
      difficulty: "medium",
      quiz_type: "theorique",
      options: [
        { id: "demo-case-paris-58yo-q1-o1", content: "Radiographie thoracique", is_correct: false },
        { id: "demo-case-paris-58yo-q1-o2", content: "Dosage de la troponine ultrasensible", is_correct: false },
        { id: "demo-case-paris-58yo-q1-o3", content: "Electrocardiogramme 12 derivations", is_correct: true },
        { id: "demo-case-paris-58yo-q1-o4", content: "Echographie cardiaque transthoracique", is_correct: false },
      ],
      answer: null,
      explanation:
        "Devant toute douleur thoracique suspecte, l'ECG 12 derivations doit etre realise en urgence afin de diagnostiquer un syndrome coronarien aigu.",
    },
    {
      id: "demo-case-paris-58yo-q2",
      question:
        "L'electrocardiogramme met en evidence un sus-decalage du segment ST en DII, DIII et aVF. Quelle est la prise en charge therapeutique qui doit etre initiee sans delai ?",
      type: "qcm",
      estimated_time: 90,
      difficulty: "medium",
      quiz_type: "theorique",
      options: [
        {
          id: "demo-case-paris-58yo-q2-o1",
          content: "Administration d'un thrombolytique IV en service",
          is_correct: false,
        },
        {
          id: "demo-case-paris-58yo-q2-o2",
          content: "Catheterisme coronaire en salle d'hemodynamique",
          is_correct: true,
        },
        {
          id: "demo-case-paris-58yo-q2-o3",
          content: "Traitement fibrinolytique a domicile",
          is_correct: false,
        },
        {
          id: "demo-case-paris-58yo-q2-o4",
          content: "Prescription d'un repos strict et surveillance",
          is_correct: false,
        },
      ],
      answer: null,
      explanation:
        "Un infarctus inferieur avec sus-decalage du ST releve d'une revascularisation en urgence par angioplastie primaire.",
    },
    {
      id: "demo-case-paris-58yo-q3",
      question:
        "Parmi les facteurs de risque suivants, lequel explique le mieux la physiopathologie de cet infarctus du myocarde ?",
      type: "qcm",
      estimated_time: 90,
      difficulty: "medium",
      quiz_type: "theorique",
      options: [
        { id: "demo-case-paris-58yo-q3-o1", content: "Diabete de type 1 equilibre", is_correct: false },
        { id: "demo-case-paris-58yo-q3-o2", content: "Tabagisme actif a 20 paquets-annees", is_correct: true },
        { id: "demo-case-paris-58yo-q3-o3", content: "Asthme allergique depuis l'enfance", is_correct: false },
        { id: "demo-case-paris-58yo-q3-o4", content: "Hypothyroidie traitee", is_correct: false },
      ],
      answer: null,
      explanation:
        "Le tabagisme reste un facteur de risque majeur de maladie coronarienne par son action sur l'endothelium et l'atherosclerose.",
    },
    {
      id: "demo-case-paris-58yo-q4",
      question:
        "A l'arrivee dans le service de cardiologie, le patient recoit aspirine, ticagrelor et heparine non fractionnee. Quel est l'objectif principal de cette association ?",
      type: "qcm",
      estimated_time: 90,
      difficulty: "medium",
      quiz_type: "theorique",
      options: [
        {
          id: "demo-case-paris-58yo-q4-o1",
          content: "Soulager rapidement la douleur thoracique",
          is_correct: false,
        },
        {
          id: "demo-case-paris-58yo-q4-o2",
          content: "Dissoudre mecaniquement le thrombus coronarien",
          is_correct: false,
        },
        {
          id: "demo-case-paris-58yo-q4-o3",
          content: "Limiter l'extension du thrombus avant l'angioplastie",
          is_correct: true,
        },
        {
          id: "demo-case-paris-58yo-q4-o4",
          content: "Prevenir la survenue d'un choc cardiogenique",
          is_correct: false,
        },
      ],
      answer: null,
      explanation:
        "La double anti-agregation plaquettaire et l'anticoagulation limitent l'extension du thrombus avant la revascularisation.",
    },
    {
      id: "demo-case-paris-58yo-q5",
      question:
        "Quarante-huit heures apres l'angioplastie, le patient presente un souffle holosystolique apexien avec signes d'insuffisance cardiaque gauche. Quelle complication suspectez-vous en priorite ?",
      type: "qcm",
      estimated_time: 90,
      difficulty: "medium",
      quiz_type: "theorique",
      options: [
        {
          id: "demo-case-paris-58yo-q5-o1",
          content: "Rupture du septum interventriculaire",
          is_correct: false,
        },
        {
          id: "demo-case-paris-58yo-q5-o2",
          content: "Infarctus du ventricule droit",
          is_correct: false,
        },
        {
          id: "demo-case-paris-58yo-q5-o3",
          content: "Rupture de muscle papillaire",
          is_correct: true,
        },
        {
          id: "demo-case-paris-58yo-q5-o4",
          content: "Dissection aortique",
          is_correct: false,
        },
      ],
      answer: null,
      explanation:
        "La rupture d'un muscle papillaire apres infarctus inferieur provoque une insuffisance mitrale aigue avec souffle holosystolique.",
    },
  ],
};

const cloneDemoCase = (): PrototypeClinicalCaseDto => ({
  ...DEMO_CASE_TEMPLATE,
  objectives: [...DEMO_CASE_TEMPLATE.objectives],
  tags: [...DEMO_CASE_TEMPLATE.tags],
  mcqs: DEMO_CASE_TEMPLATE.mcqs.map((mcq) => ({
    ...mcq,
    options: mcq.options.map((option) => ({ ...option })),
  })),
});

@Injectable()
export class ClinicalCasePrototypeService {
  constructor(
    @InjectRepository(ClinicalCase)
    private readonly clinicalCaseRepository: Repository<ClinicalCase>,
    @InjectRepository(Mcq)
    private readonly mcqRepository: Repository<Mcq>,
  ) {}

  async getPrototype(caseId: string): Promise<PrototypeClinicalCaseDto> {
    return this.resolveClinicalCase(caseId);
  }

  async submit(
    caseId: string,
    payload: PrototypeClinicalCaseSubmitDto,
  ): Promise<PrototypeClinicalCaseSubmissionResult> {
    const clinicalCase = await this.resolveClinicalCase(caseId);
    const question = clinicalCase.mcqs.find((mcq) => mcq.id === payload.mcq);

    if (!question) {
      throw new NotFoundException("MCQ introuvable dans ce cas clinique.");
    }

    const correctOptions = question.options
      .filter((option) => option.is_correct)
      .map((option) => ({ id: option.id, is_correct: true }));

    if (payload.is_skipped) {
      return {
        success_ratio: 0,
        selected_options: [],
        correct_options: correctOptions,
        options: question.options.map((option) => ({ ...option })),
        explanation: question.explanation ?? null,
        question: question.question,
        response: null,
        answer: question.answer ?? null,
      };
    }

    const selectedIds =
      payload.response_options?.map((entry) => entry.option) ?? [];

    const selectedOptions = question.options
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => ({ id: option.id, is_correct: option.is_correct }));

    const allCorrect =
      selectedOptions.length === correctOptions.length &&
      selectedOptions.every((entry) => entry.is_correct);

    return {
      success_ratio: allCorrect ? 1 : 0,
      selected_options: selectedOptions,
      correct_options: correctOptions,
      options: question.options.map((option) => ({ ...option })),
      explanation: question.explanation ?? null,
      question: question.question,
      response: payload.response ?? null,
      answer: question.answer ?? null,
    };
  }

  private async resolveClinicalCase(
    caseId: string,
  ): Promise<PrototypeClinicalCaseDto> {
    if (caseId === "demo") {
      return cloneDemoCase();
    }

    const clinicalCase = await this.clinicalCaseRepository.findOne({
      where: { id: caseId },
    });

    if (!clinicalCase) {
      throw new NotFoundException("Clinical case not found");
    }

    const mcqs = await this.mcqRepository.find({
      where: {
        clinical_case: { id: clinicalCase.id },
      },
      relations: ["options"],
      order: {
        createdAt: "ASC",
      },
    });

    return {
      id: clinicalCase.id,
      title: clinicalCase.title,
      description: clinicalCase.description,
      scenario: clinicalCase.scenario,
      objectives: clinicalCase.objectives ?? [],
      tags: clinicalCase.tags ?? [],
      author: clinicalCase.author,
      faculty_type: clinicalCase.faculty_type ?? FacultyType.general_medicine,
      year_of_study: clinicalCase.year_of_study ?? YearOfStudy.first_year,
      promo: clinicalCase.promo,
      mcqs: mcqs.map((mcq) => ({
        id: mcq.id,
        question: mcq.question,
        type: mcq.type,
        estimated_time: mcq.estimated_time ?? 60,
        difficulty: mcq.difficulty,
        quiz_type: mcq.quiz_type,
        options:
          mcq.options?.map((option) => ({
            id: option.id,
            content: option.content,
            is_correct: option.is_correct,
          })) ?? [],
        answer: mcq.answer ?? null,
        explanation: mcq.explanation ?? null,
      })),
    };
  }
}
