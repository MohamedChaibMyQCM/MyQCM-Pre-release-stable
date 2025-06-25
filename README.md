## About

#### MyQCM - Comprehensive MCQ Management and Payment Platform

MyQCM is a platform designed to manage multiple-choice questions (MCQs) for educational institutions and automate payment calculations for freelancers. It helps maintain a structured entry of MCQs and tracks user progress and performance analytics.

## Database schema

```bash
https://drawsql.app/teams/aceiny/diagrams/my-qcm
```

## Api docs

```bash
# API documentation is auto-generated using Swagger and can be accessed at:
/api
```

## Getting Started

### Cloning

```bash
$ git clone https://github.com/aceiny/my_qcm.git
```

### Installation

#### This applies to each one of the folders

```bash
$ npm i -g @nestjs/cli && npm install
```

### Environment Variables

```bash

```

### Running the app

```bash
# development
$ npm run start:dev or nest start --watch

# production mode
$ npm run start:prod or nest start prod
```

## Features

- #### MCQ Entry and Management:
  Freelancers can log in, verify their credentials, and enter multiple-choice questions (MCQs) associated with specific courses, modules, and units.
- #### Automated Payment Calculation:
  The system tracks the number and type of MCQs submitted by freelancers and calculates their payments automatically based on predefined rates.
- #### User Progress Tracking :
  The platform monitors user interactions with MCQs, recording details such as time spent on each question, answers given, and overall accuracy.
- #### Performance Analysis :
  Detailed insights into user performance are generated, including metrics like success rates, average time spent, and difficulty levels of MCQs.
- #### Multi-Level Course Hierarchy :
  Support for organizing content across various levels such as university, faculty, year, unit, module, course, section, and subsection.
- #### Real-Time Reporting :
  Generates detailed reports on both freelancer activity and user performance, facilitating data-driven decisions.
- #### Scalable Infrastructure :
  Built to handle a growing number of users, freelancers, and MCQs without compromising performance.

## AI features

- #### Personalized MCQ Recommendations :
  AI algorithms analyze user performance data to recommend MCQs tailored to the user's strengths and weaknesses. This ensures that users are consistently challenged at an appropriate level, enhancing their learning experience.
- #### Adaptive Learning Pathways :
  Based on user interactions and performance, the AI system dynamically adjusts the difficulty and type of MCQs presented to each user, promoting gradual improvement.
- #### Session Difficulty Configuration :
  Training sessions can specify a desired MCQ difficulty level or rely on the assistant to choose one adaptively.
- #### Performance Evaluation :
  AI tools continuously monitor and evaluate user performance, offering feedback and suggestions for improvement. The system can identify areas where users excel or struggle and adjust content accordingly.
- #### Intelligent Feedback :
  Provides personalized feedback based on user answers, helping them understand their mistakes and learn effectively. The feedback is generated using AI to ensure relevance and accuracy.
- #### Predictive Analysis :
  Uses machine learning models to predict user success and identify potential issues early, enabling proactive support and intervention.

## Security Measures

- #### Strong authentication :
  using Passport.js and guards to control access based on authentication
- #### Encryption :
  Encrypting and hashing passwords
- #### Vulnerability Prevention :
  Leverage security features built into NestJS like Helmet, which helps configure secure HTTP headers to mitigate common attacks.
- #### Input Validation :
  Validate all user-provided data to prevent unexpected inputs or malicious code injection
- #### Rate Limiting :
  Implement rate limiting to prevent brute-force attacks or denial-of-service attempts.

## Technologies Used

- TypeScript
- Node.js
- Nest.js
- class-validator
- postgresql
- typeorm
- uuid
- Redis
- JWT
- Passport js
- bcrypt
- swagger

## License

This project is licensed under a **Proprietary License**.  
The source code is provided under a strict **non-transferable, non-distributable** agreement between Ahmed Yassine Zeraibi and MYQCM Aljazayr.  
Unauthorized distribution or modification is prohibited.

## Contributors

- Ahmed Yassine Zeraibi , aceiny.dev@gmail.com
# MyQcmV3
# MyQcmV3
