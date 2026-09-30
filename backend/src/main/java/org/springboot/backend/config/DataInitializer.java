package org.springboot.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springboot.backend.entity.*;
import org.springboot.backend.entity.enums.*;
import org.springboot.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final AnswerSheetRepository answerSheetRepository;
    private final AnswerRepository answerRepository;
    private final EvaluationRepository evaluationRepository;
    private final ModerationFlagRepository moderationFlagRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedExamAndQuestions();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding demo users...");

            User admin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email("admin@example.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            User examiner = User.builder()
                    .firstName("Prof. Rajesh")
                    .lastName("Sharma")
                    .email("examiner@example.com")
                    .passwordHash(passwordEncoder.encode("examiner123"))
                    .role(Role.EXAMINER)
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            User moderator = User.builder()
                    .firstName("Dr. Anita")
                    .lastName("Verma")
                    .email("moderator@example.com")
                    .passwordHash(passwordEncoder.encode("moderator123"))
                    .role(Role.MODERATOR)
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.saveAll(Arrays.asList(admin, examiner, moderator));
            log.info("Demo users created successfully: admin@example.com, examiner@example.com, moderator@example.com");
        }
    }

    private void seedExamAndQuestions() {
        if (subjectRepository.count() == 0) {
            log.info("Seeding subject and exam data...");

            Subject subject = Subject.builder()
                    .name("Java Programming & Object Oriented Paradigms")
                    .code("CS301")
                    .build();
            subject = subjectRepository.save(subject);

            Exam exam = Exam.builder()
                    .title("B.Tech Semester V - Final University Examination 2026")
                    .subject(subject)
                    .totalMarks(50.0)
                    .status(ExamStatus.ACTIVE)
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build();
            exam = examRepository.save(exam);

            // Seed 5 realistic descriptive questions with model answers and rubrics
            List<Question> questions = new ArrayList<>();

            // Q1: Inheritance
            Question q1 = Question.builder()
                    .exam(exam)
                    .questionNumber(1)
                    .questionText("Explain the concept of Inheritance in Java. Discuss different types of inheritance supported in Java and why multiple inheritance through classes is not permitted.")
                    .maxMarks(10.0)
                    .build();
            Rubric r1 = Rubric.builder()
                    .question(q1)
                    .modelAnswer("Inheritance allows a subclass to acquire properties and methods of a superclass using the 'extends' keyword. It facilitates code reusability and method overriding. Java supports Single, Multilevel, and Hierarchical inheritance with classes. Multiple inheritance with classes is forbidden to avoid the Diamond Problem (ambiguity in method resolution), though it is supported via interfaces.")
                    .criteria("Definition & Purpose (2 marks); Types of Inheritance supported (2 marks); Diamond Problem / Ambiguity explanation (3 marks); Interface alternative & Code example (3 marks)")
                    .keywords("inheritance, extends, superclass, subclass, code reuse, diamond problem, ambiguity, interface")
                    .build();
            q1.setRubric(r1);
            questions.add(q1);

            // Q2: Polymorphism
            Question q2 = Question.builder()
                    .exam(exam)
                    .questionNumber(2)
                    .questionText("Differentiate between Method Overloading and Method Overriding in Java with suitable code snippets. How does JVM achieve dynamic method dispatch?")
                    .maxMarks(10.0)
                    .build();
            Rubric r2 = Rubric.builder()
                    .question(q2)
                    .modelAnswer("Method Overloading occurs in the same class where methods share the same name but differ in parameters (type, number, or sequence). It is resolved at compile time (static polymorphism). Method Overriding occurs between subclass and superclass where method signature remains identical. It is resolved at runtime (dynamic polymorphism) using JVM virtual method table (vtable) and dynamic method dispatch.")
                    .criteria("Difference table/points (3 marks); Method Overloading example (2 marks); Method Overriding example (2 marks); Dynamic Method Dispatch / JVM vtable resolution (3 marks)")
                    .keywords("overloading, overriding, compile-time polymorphism, runtime polymorphism, dynamic method dispatch, vtable, method signature")
                    .build();
            q2.setRubric(r2);
            questions.add(q2);

            // Q3: JVM Memory Model
            Question q3 = Question.builder()
                    .exam(exam)
                    .questionNumber(3)
                    .questionText("Describe the Java Virtual Machine (JVM) Architecture and its primary runtime memory data areas. Explain how Garbage Collection manages memory.")
                    .maxMarks(10.0)
                    .build();
            Rubric r3 = Rubric.builder()
                    .question(q3)
                    .modelAnswer("JVM Architecture includes Class Loader Subsystem, Runtime Data Areas, and Execution Engine. Memory areas comprise: 1) Method Area (class metadata, static variables), 2) Heap Area (objects), 3) JVM Stack (stack frames, local variables), 4) Program Counter (PC) Registers, and 5) Native Method Stacks. Garbage Collection automatically deallocates unreferenced objects using mark-and-sweep or generational GC algorithms.")
                    .criteria("JVM architecture diagram/overview (2 marks); Explanation of 5 memory areas (5 marks); Garbage collection mechanism & Mark-Sweep (3 marks)")
                    .keywords("jvm, heap, stack, method area, pc register, garbage collection, mark and sweep, generational")
                    .build();
            q3.setRubric(r3);
            questions.add(q3);

            // Q4: Exception Handling
            Question q4 = Question.builder()
                    .exam(exam)
                    .questionNumber(4)
                    .questionText("Explain the Exception Handling hierarchy in Java. Distinguish between checked and unchecked exceptions with examples. How does the 'finally' block behave with return statements?")
                    .maxMarks(10.0)
                    .build();
            Rubric r4 = Rubric.builder()
                    .question(q4)
                    .modelAnswer("Throwable is the root class, divided into Exception and Error. Checked exceptions inherit from Exception (excluding RuntimeException) and must be caught or declared (e.g. IOException, SQLException). Unchecked exceptions inherit from RuntimeException (e.g. NullPointerException, ArithmeticException) and occur at runtime. The 'finally' block executes regardless of whether an exception occurs, even if a return statement exists in try/catch (unless System.exit() is called).")
                    .criteria("Throwable hierarchy (2 marks); Checked vs Unchecked differences & examples (4 marks); try-catch-finally semantics (2 marks); finally with return statement behavior (2 marks)")
                    .keywords("throwable, exception, error, checked exception, runtimeexception, unchecked, try, catch, finally, system.exit")
                    .build();
            q4.setRubric(r4);
            questions.add(q4);

            // Q5: Collections Framework
            Question q5 = Question.builder()
                    .exam(exam)
                    .questionNumber(5)
                    .questionText("Compare and contrast ArrayList vs LinkedList, and HashMap vs ConcurrentHashMap in Java. Discuss their internal working and time complexities.")
                    .maxMarks(10.0)
                    .build();
            Rubric r5 = Rubric.builder()
                    .question(q5)
                    .modelAnswer("ArrayList is backed by a dynamic resizable array providing O(1) random access but O(n) worst-case insertions/deletions. LinkedList is a doubly linked list offering O(1) insertions/deletions at ends but O(n) positional lookup. HashMap uses an array of buckets (linked list / red-black tree when threshold >= 8) and is not thread-safe. ConcurrentHashMap achieves thread-safety using fine-grained bucket locks (synchronized blocks on bucket head) without locking the entire map.")
                    .criteria("ArrayList vs LinkedList comparison & time complexity (4 marks); HashMap internal bucket/hashing mechanism (3 marks); ConcurrentHashMap concurrency model & bucket locking (3 marks)")
                    .keywords("arraylist, linkedlist, hashmap, concurrenthashmap, buckets, hashing, thread-safe, time complexity, dynamic array")
                    .build();
            q5.setRubric(r5);
            questions.add(q5);

            questionRepository.saveAll(questions);
            log.info("Saved 5 exam questions with rubrics.");

            // Create a sample seed answer sheet with candidate reference
            seedSampleAnswerSheet(exam, questions);
        }
    }

    private void seedSampleAnswerSheet(Exam exam, List<Question> questions) {
        try {
            // Create a sample document file
            String uploadDir = "uploads/answer-sheets/" + exam.getId();
            Files.createDirectories(Paths.get(uploadDir));
            String sampleFilePath = uploadDir + "/sample_candidate_MP2026CS1042.txt";
            File sampleFile = new File(sampleFilePath);
            if (!sampleFile.exists()) {
                try (FileWriter writer = new FileWriter(sampleFile)) {
                    writer.write("MPOnline Idea & Innovation Hackathon 2026\n");
                    writer.write("Examination: Java Programming (CS301)\n");
                    writer.write("Candidate Reference: MP-2026-CS-1042\n");
                    writer.write("===================================================\n\n");
                    writer.write("Q1. Inheritance in Java:\n");
                    writer.write("Inheritance is an OOP mechanism where one class acquires the properties and methods of another. We use the 'extends' keyword. Java supports single and multilevel inheritance. Multiple inheritance is not allowed with classes to avoid the diamond problem of ambiguity, but can be done with interfaces.\n\n");
                    writer.write("Q2. Method Overloading vs Overriding:\n");
                    writer.write("Overloading occurs within the same class with same method name but different parameter list. It is compile-time polymorphism. Overriding occurs in subclass with same name and same parameter signature. It is runtime polymorphism resolved via dynamic method dispatch.\n\n");
                    writer.write("Q3. JVM Architecture:\n");
                    writer.write("JVM has Method Area, Heap Area, Stack, PC Registers, and Native Method Stack. Heap stores all object instances while Stack holds local variables. Garbage collector frees unreferenced objects automatically.\n\n");
                    writer.write("Q4. Exception Handling:\n");
                    writer.write("Checked exceptions are checked at compile time such as IOException. Unchecked exceptions occur at runtime like NullPointerException. The finally block always executes even if there is a return in try block.\n\n");
                    writer.write("Q5. Collections:\n");
                    writer.write("ArrayList uses dynamic array, faster for read. LinkedList uses nodes. HashMap uses key-value pairs with hashcode.\n");
                }
            }

            AnswerSheet sheet = AnswerSheet.builder()
                    .exam(exam)
                    .candidateReference("MP-2026-CS-1042")
                    .originalFileName("MP-2026-CS-1042_AnswerSheet.pdf")
                    .filePath(sampleFilePath)
                    .processingStatus(ProcessingStatus.EVALUATED)
                    .totalFinalMarks(39.0)
                    .totalAiMarks(39.5)
                    .createdAt(LocalDateTime.now().minusHours(4))
                    .build();
            sheet = answerSheetRepository.save(sheet);

            // Create answers for this sheet
            List<Answer> answers = new ArrayList<>();

            // Q1 Answer
            Answer a1 = Answer.builder()
                    .answerSheet(sheet)
                    .question(questions.get(0))
                    .extractedText("Inheritance is an OOP mechanism where one class acquires the properties and methods of another. We use the 'extends' keyword. Java supports single and multilevel inheritance. Multiple inheritance is not allowed with classes to avoid the diamond problem of ambiguity, but can be done with interfaces.")
                    .ocrConfidence(0.93)
                    .build();
            Evaluation e1 = Evaluation.builder()
                    .answer(a1)
                    .aiSuggestedMarks(8.5)
                    .examinerMarks(8.5)
                    .maxMarks(10.0)
                    .aiConfidence(0.92)
                    .explanation("The definition, keyword usage, and diamond problem reason are clearly stated. Lacks a full code demonstration for full marks.")
                    .matchedConcepts("Definition, extends keyword, Single/Multilevel inheritance, Diamond problem avoidance")
                    .missingConcepts("Detailed code snippet example")
                    .examinerComment("Solid answer, correctly identified ambiguity issue.")
                    .status(EvaluationStatus.EXAMINER_REVIEWED)
                    .build();
            a1.setEvaluation(e1);
            answers.add(a1);

            // Q2 Answer
            Answer a2 = Answer.builder()
                    .answerSheet(sheet)
                    .question(questions.get(1))
                    .extractedText("Overloading occurs within the same class with same method name but different parameter list. It is compile-time polymorphism. Overriding occurs in subclass with same name and same parameter signature. It is runtime polymorphism resolved via dynamic method dispatch.")
                    .ocrConfidence(0.91)
                    .build();
            Evaluation e2 = Evaluation.builder()
                    .answer(a2)
                    .aiSuggestedMarks(8.0)
                    .examinerMarks(8.0)
                    .maxMarks(10.0)
                    .aiConfidence(0.89)
                    .explanation("Accurate differentiation between compile-time and runtime polymorphism and dynamic method dispatch mentioned.")
                    .matchedConcepts("Same class vs subclass, Parameter differentiation, Compile-time vs Runtime polymorphism, Dynamic dispatch")
                    .missingConcepts("Virtual method table (vtable) internal description")
                    .examinerComment("Good explanation.")
                    .status(EvaluationStatus.EXAMINER_REVIEWED)
                    .build();
            a2.setEvaluation(e2);
            answers.add(a2);

            // Q3 Answer
            Answer a3 = Answer.builder()
                    .answerSheet(sheet)
                    .question(questions.get(2))
                    .extractedText("JVM has Method Area, Heap Area, Stack, PC Registers, and Native Method Stack. Heap stores all object instances while Stack holds local variables. Garbage collector frees unreferenced objects automatically.")
                    .ocrConfidence(0.88)
                    .build();
            Evaluation e3 = Evaluation.builder()
                    .answer(a3)
                    .aiSuggestedMarks(7.5)
                    .examinerMarks(7.5)
                    .maxMarks(10.0)
                    .aiConfidence(0.87)
                    .explanation("Listed all 5 runtime data areas accurately and summarized Heap and GC functions.")
                    .matchedConcepts("Method Area, Heap, JVM Stack, PC Registers, Native Stack, Garbage Collection")
                    .missingConcepts("Generational GC breakdown (Eden, Survivor, Old Gen)")
                    .examinerComment("Covered all essentials.")
                    .status(EvaluationStatus.EXAMINER_REVIEWED)
                    .build();
            a3.setEvaluation(e3);
            answers.add(a3);

            // Q4 Answer
            Answer a4 = Answer.builder()
                    .answerSheet(sheet)
                    .question(questions.get(3))
                    .extractedText("Checked exceptions are checked at compile time such as IOException. Unchecked exceptions occur at runtime like NullPointerException. The finally block always executes even if there is a return in try block.")
                    .ocrConfidence(0.89)
                    .build();
            Evaluation e4 = Evaluation.builder()
                    .answer(a4)
                    .aiSuggestedMarks(8.5)
                    .examinerMarks(8.5)
                    .maxMarks(10.0)
                    .aiConfidence(0.91)
                    .explanation("Correct examples given for both checked and unchecked exceptions, with exact behavior of finally block.")
                    .matchedConcepts("Checked vs Unchecked, IOException, NullPointerException, Finally block execution")
                    .missingConcepts("Throwable hierarchy diagram")
                    .examinerComment("Accurate.")
                    .status(EvaluationStatus.EXAMINER_REVIEWED)
                    .build();
            a4.setEvaluation(e4);
            answers.add(a4);

            // Q5 Answer (Demonstrating Quality Control Flag: Low confidence & brief answer)
            Answer a5 = Answer.builder()
                    .answerSheet(sheet)
                    .question(questions.get(4))
                    .extractedText("ArrayList uses dynamic array, faster for read. LinkedList uses nodes. HashMap uses key-value pairs with hashcode.")
                    .ocrConfidence(0.72)
                    .build();
            Evaluation e5 = Evaluation.builder()
                    .answer(a5)
                    .aiSuggestedMarks(7.0)
                    .examinerMarks(6.5)
                    .maxMarks(10.0)
                    .aiConfidence(0.68) // Below 0.70 to trigger LOW_CONFIDENCE flag!
                    .explanation("Answer is brief and omits discussion of ConcurrentHashMap and time complexities.")
                    .matchedConcepts("ArrayList dynamic array, LinkedList nodes, HashMap key-value")
                    .missingConcepts("ConcurrentHashMap concurrency model, Bucket locking, Big-O time complexity")
                    .examinerComment("Very brief; missed ConcurrentHashMap completely.")
                    .status(EvaluationStatus.EXAMINER_REVIEWED)
                    .build();
            a5.setEvaluation(e5);
            answers.add(a5);

            answerRepository.saveAll(answers);

            // Add a Low Confidence Moderation Flag for Q5
            ModerationFlag flag = ModerationFlag.builder()
                    .evaluation(e5)
                    .flagType(ModerationFlagType.LOW_CONFIDENCE)
                    .severity(Severity.MEDIUM)
                    .reason("AI evaluation confidence (68%) is below the configured threshold of 70%. Review recommended.")
                    .resolved(false)
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .build();
            moderationFlagRepository.save(flag);

            log.info("Sample answer sheet MP-2026-CS-1042 seeded with 5 evaluations and 1 moderation flag.");
        } catch (IOException e) {
            log.error("Failed to seed sample answer sheet file: {}", e.getMessage());
        }
    }
}
