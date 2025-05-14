// ========== 0. UTILITY: NOTIFICATION SERVICE ==========
class NotificationService {
    private static instance: NotificationService;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    sendNotification(recipient: Person, subject: string, message: string): void {
        console.log(`\n--- 📢 NOTIFICATION ---
To: ${recipient.name} (${recipient.email})
Subject: ${subject}
Message: ${message}
-----------------------\n`);
    }

    broadcastNotification(recipients: Person[], subject: string, message: string): void {
        console.log(`\n--- 📢 BROADCAST NOTIFICATION ---
Subject: ${subject}
Message: ${message}
Recipients: ${recipients.map(r => r.name).join(', ')}
-------------------------------\n`);
    }
}

// ========== 1. PERSON HIERARCHY (Abstraction, Inheritance) ==========
abstract class Person {
    constructor(
        public personId: string,
        public name: string,
        public email: string,
        public dateOfBirth: Date
    ) {}

    abstract getRole(): string; // Polymorphic method

    getProfile(): string {
        return `ID: ${this.personId}, Name: ${this.name}, Email: ${this.email}, DOB: ${this.dateOfBirth.toLocaleDateString()}, Role: ${this.getRole()}`;
    }

    receiveNotification(subject: string, message: string): void {
        NotificationService.getInstance().sendNotification(this, subject, message);
    }
}

class Student extends Person {
    public enrolledCourses: Map<string, Enrollment> = new Map(); // courseId -> Enrollment

    constructor(personId: string, name: string, email: string, dateOfBirth: Date, public studentId: string, public major: string) {
        super(personId, name, email, dateOfBirth);
    }

    getRole(): string {
        return "Student";
    }

    enroll(course: Course): Enrollment | null {
        if (this.enrolledCourses.has(course.courseId)) {
            console.warn(`${this.name} is already enrolled in ${course.courseName}.`);
            return this.enrolledCourses.get(course.courseId)!;
        }
        if (course.addStudent(this)) {
            const enrollment = new Enrollment(this, course);
            this.enrolledCourses.set(course.courseId, enrollment);
            this.receiveNotification("Course Enrollment", `You have successfully enrolled in ${course.courseName}.`);
            return enrollment;
        }
        return null;
    }

    submitAssessment(courseId: string, assessmentId: string, submissionContent: any): void {
        const enrollment = this.enrolledCourses.get(courseId);
        if (enrollment) {
            enrollment.submitAssessment(assessmentId, submissionContent);
        } else {
            console.warn(`Student ${this.name} not enrolled in course ID ${courseId}.`);
        }
    }

    viewGrades(courseId: string): void {
        const enrollment = this.enrolledCourses.get(courseId);
        if (enrollment) {
            console.log(`\n--- Grades for ${this.name} in ${enrollment.course.courseName} ---`);
            enrollment.getGrades().forEach(grade => {
                console.log(`- ${grade.assessment.title}: ${grade.score !== undefined ? grade.score.toFixed(2) + '%' : 'Not Graded'} (Weight: ${grade.assessment.weight * 100}%)`);
            });
            console.log(`Final Grade: ${enrollment.calculateFinalGrade()?.toFixed(2) ?? 'Pending'}%`);
            console.log(`--------------------------------------------------`);
        } else {
            console.warn(`Student ${this.name} not enrolled in course ID ${courseId}.`);
        }
    }
}

class Professor extends Person {
    public teachingCourses: Course[] = [];

    constructor(personId: string, name: string, email: string, dateOfBirth: Date, public facultyId: string, public department: string) {
        super(personId, name, email, dateOfBirth);
    }

    getRole(): string {
        return "Professor";
    }

    assignCourse(course: Course): void {
        if (!this.teachingCourses.find(c => c.courseId === course.courseId)) {
            this.teachingCourses.push(course);
            course.assignProfessor(this);
            this.receiveNotification("Course Assignment", `You have been assigned to teach ${course.courseName}.`);
        }
    }

    gradeAssessment(student: Student, courseId: string, assessmentId: string, score: number): void {
        const course = this.teachingCourses.find(c => c.courseId === courseId);
        if (!course) {
            console.warn(`Professor ${this.name} is not teaching course ID ${courseId}.`);
            return;
        }
        const enrollment = student.enrolledCourses.get(courseId);
        if (enrollment) {
            enrollment.recordGrade(assessmentId, score);
            student.receiveNotification("Grade Update", `Your grade for assessment '${assessmentId}' in ${course.courseName} has been updated.`);
        } else {
            console.warn(`Student ${student.name} not found in course ID ${courseId} for grading.`);
        }
    }

    addAssessmentToCourse(course: Course, assessment: Assessment): void {
        if (this.teachingCourses.includes(course)) {
            course.addAssessment(assessment);
            this.receiveNotification("Course Update", `New assessment '${assessment.title}' added to ${course.courseName}.`);
        } else {
            console.warn(`${this.name} cannot add assessment. Not teaching ${course.courseName}.`);
        }
    }
}

class Admin extends Person {
    constructor(personId: string, name: string, email: string, dateOfBirth: Date, public adminId: string) {
        super(personId, name, email, dateOfBirth);
    }

    getRole(): string {
        return "Administrator";
    }

    createCourse(courseId: string, courseName: string, credits: number): Course {
        const course = new Course(courseId, courseName, credits);
        this.receiveNotification("System Update", `Course '${courseName}' (ID: ${courseId}) has been created.`);
        return course;
    }

    registerUser(user: Person): void {
        console.log(`Admin ${this.name} registered user: ${user.name} (ID: ${user.personId}, Role: ${user.getRole()}).`);
        user.receiveNotification("Account Creation", "Your university account has been created.");
    }
}

// ========== 2. ASSESSMENT INTERFACE & IMPLEMENTATIONS (Polymorphism) ==========
interface Assessment {
    assessmentId: string;
    title: string;
    description: string;
    dueDate: Date;
    weight: number; 

    submit(studentId: string, content: any): void;
    grade(studentId: string, score: number): void; // Score typically out of 100
    getDetails(): string;
    isSubmittedBy(studentId: string): boolean;
    getSubmission(studentId: string): any | undefined;
    getGrade(studentId: string): number | undefined;
}

class Quiz implements Assessment {
    private submissions: Map<string, { content: any, score?: number }> = new Map(); // studentId -> submission
    constructor(
        public assessmentId: string,
        public title: string,
        public description: string,
        public dueDate: Date,
        public weight: number,
        public timeLimitMinutes: number
    ) {}

    submit(studentId: string, content: any): void {
        if (new Date() > this.dueDate) {
            console.warn(`Quiz "${this.title}" (ID: ${this.assessmentId}) due date has passed. Submission by ${studentId} not accepted.`);
            NotificationService.getInstance().sendNotification(
                { name: studentId, email: '', personId: studentId } as Student, // Hack for notification recipient
                "Submission Failed",
                `The due date for quiz "${this.title}" has passed. Your submission was not recorded.`
            );
            return;
        }
        this.submissions.set(studentId, { content });
        console.log(`Quiz "${this.title}" submitted by Student ${studentId}.`);
    }

    grade(studentId: string, score: number): void {
        const submission = this.submissions.get(studentId);
        if (submission) {
            submission.score = Math.max(0, Math.min(score, 100)); 
            console.log(`Quiz "${this.title}" for Student ${studentId} graded: ${submission.score}%.`);
        } else {
            console.warn(`No submission found for Student ${studentId} for Quiz "${this.title}".`);
        }
    }

    getDetails(): string {
        return `Type: Quiz
Title: ${this.title} (ID: ${this.assessmentId})
Description: ${this.description}
Due: ${this.dueDate.toLocaleString()}
Weight: ${this.weight * 100}%
Time Limit: ${this.timeLimitMinutes} mins`;
    }
    isSubmittedBy(studentId: string): boolean { return this.submissions.has(studentId); }
    getSubmission(studentId: string): any | undefined { return this.submissions.get(studentId)?.content; }
    getGrade(studentId: string): number | undefined { return this.submissions.get(studentId)?.score; }
}

class Assignment implements Assessment {
    private submissions: Map<string, { content: any, score?: number }> = new Map();
    constructor(
        public assessmentId: string,
        public title: string,
        public description: string,
        public dueDate: Date,
        public weight: number,
        public submissionFormat: string
    ) {}

    submit(studentId: string, content: any): void {
        if (new Date() > this.dueDate) {
            console.warn(`Assignment "${this.title}" due date has passed. Submission by ${studentId} not accepted.`);
             NotificationService.getInstance().sendNotification(
                { name: studentId, email: '', personId: studentId } as Student,
                "Submission Failed",
                `The due date for assignment "${this.title}" has passed. Your submission was not recorded.`
            );
            return;
        }
        this.submissions.set(studentId, { content });
        console.log(`Assignment "${this.title}" (Format: ${this.submissionFormat}) submitted by Student ${studentId}.`);
    }

    grade(studentId: string, score: number): void {
        const submission = this.submissions.get(studentId);
        if (submission) {
            submission.score = Math.max(0, Math.min(score, 100));
            console.log(`Assignment "${this.title}" for Student ${studentId} graded: ${submission.score}%.`);
        } else {
            console.warn(`No submission found for Student ${studentId} for Assignment "${this.title}".`);
        }
    }

    getDetails(): string {
        return `Type: Assignment
Title: ${this.title} (ID: ${this.assessmentId})
Description: ${this.description}
Due: ${this.dueDate.toLocaleString()}
Weight: ${this.weight * 100}%
Format: ${this.submissionFormat}`;
    }
    isSubmittedBy(studentId: string): boolean { return this.submissions.has(studentId); }
    getSubmission(studentId: string): any | undefined { return this.submissions.get(studentId)?.content; }
    getGrade(studentId: string): number | undefined { return this.submissions.get(studentId)?.score; }
}

class Project implements Assessment {
    private submissions: Map<string, { content: any, score?: number }> = new Map();
    constructor(
        public assessmentId: string,
        public title: string,
        public description: string,
        public dueDate: Date,
        public weight: number,
        public isGroupProject: boolean
    ) {}

    submit(studentId: string, content: any): void {
         if (new Date() > this.dueDate) {
            console.warn(`Project "${this.title}" due date has passed. Submission by ${studentId} not accepted.`);
            NotificationService.getInstance().sendNotification(
                { name: studentId, email: '', personId: studentId } as Student,
                "Submission Failed",
                `The due date for project "${this.title}" has passed. Your submission was not recorded.`
            );
            return;
        }
        this.submissions.set(studentId, { content });
        console.log(`Project "${this.title}" (${this.isGroupProject ? 'Group' : 'Individual'}) submitted by Student ${studentId}.`);
    }

    grade(studentId: string, score: number): void {
        const submission = this.submissions.get(studentId);
        if (submission) {
            submission.score = Math.max(0, Math.min(score, 100));
            console.log(`Project "${this.title}" for Student ${studentId} graded: ${submission.score}%.`);
        } else {
            console.warn(`No submission found for Student ${studentId} for Project "${this.title}".`);
        }
    }

    getDetails(): string {
        return `Type: Project
Title: ${this.title} (ID: ${this.assessmentId})
Description: ${this.description}
Due: ${this.dueDate.toLocaleString()}
Weight: ${this.weight * 100}%
Type: ${this.isGroupProject ? 'Group' : 'Individual'}`;
    }
    isSubmittedBy(studentId: string): boolean { return this.submissions.has(studentId); }
    getSubmission(studentId: string): any | undefined { return this.submissions.get(studentId)?.content; }
    getGrade(studentId: string): number | undefined { return this.submissions.get(studentId)?.score; }
}

// ========== 3. COURSE CONTENT (Composite Pattern) ==========
interface CourseContentComponent {
    title: string;
    display(indent?: string): void; // For displaying structure
    getAssessments?(): Assessment[]; // For getting assessments in this component
}

class Lecture implements CourseContentComponent {
    constructor(public title: string, public durationMinutes: number, public videoUrl?: string, public notes?: string) {}

    display(indent: string = ""): void {
        console.log(`${indent}- Lecture: ${this.title} (${this.durationMinutes} mins)`);
        if (this.videoUrl) console.log(`${indent}  Video: ${this.videoUrl}`);
        if (this.notes) console.log(`${indent}  Notes: ${this.notes.substring(0,30)}...`);
    }
}

class Module implements CourseContentComponent {
    private children: CourseContentComponent[] = [];
    private moduleAssessments: Assessment[] = [];

    constructor(public title: string) {}

    add(component: CourseContentComponent | Assessment): void {
        if ('assessmentId' in component) { // It's an Assessment
            this.moduleAssessments.push(component as Assessment);
            // this.children.push({ title: (component as Assessment).title, display: (indent = "") => console.log(`${indent}- Assessment Item: ${(component as Assessment).title}`) });
        } else { // It's a CourseContentComponent
             this.children.push(component as CourseContentComponent);
        }
    }

    remove(component: CourseContentComponent | Assessment): void {
        if ('assessmentId' in component) {
            this.moduleAssessments = this.moduleAssessments.filter(a => a.assessmentId !== (component as Assessment).assessmentId);
        } else {
            this.children = this.children.filter(child => child !== component);
        }
    }

    display(indent: string = ""): void {
        console.log(`${indent}+ Module: ${this.title}`);
        this.children.forEach(child => child.display(indent + "  "));
        this.moduleAssessments.forEach(assessment => {
            console.log(`${indent}  * Assessment: ${assessment.title} (ID: ${assessment.assessmentId}, Weight: ${assessment.weight * 100}%)`);
        });
    }

    getAssessments(): Assessment[] {
        let assessments: Assessment[] = [...this.moduleAssessments];
        this.children.forEach(child => {
            if (child.getAssessments) {
                assessments = assessments.concat(child.getAssessments());
            }
        });
        return assessments;
    }
}


// ========== 4. COURSE CLASS ==========
class Course {
    public enrolledStudents: Map<string, Student> = new Map(); // studentId -> Student
    public professor?: Professor;
    public schedule: string = "To be announced";
    public content: CourseContentComponent[] = []; // Root content items (e.g., modules)
    private assessments: Map<string, Assessment> = new Map(); // assessmentId -> Assessment

    constructor(public courseId: string, public courseName: string, public credits: number) {}

    assignProfessor(prof: Professor): void {
        this.professor = prof;
        console.log(`Professor ${prof.name} assigned to ${this.courseName}.`);
    }

    addStudent(student: Student): boolean {
        if (this.enrolledStudents.has(student.studentId)) {
            return false; // Already enrolled
        }
        this.enrolledStudents.set(student.studentId, student);
        console.log(`${student.name} successfully enrolled in ${this.courseName}. Capacity: ${this.enrolledStudents.size}`);
        // Potentially notify professor
        if (this.professor) {
            NotificationService.getInstance().sendNotification(this.professor, "New Enrollment", `${student.name} has enrolled in your course ${this.courseName}.`);
        }
        return true;
    }

    addContent(component: CourseContentComponent): void {
        this.content.push(component);
        if (component.getAssessments) { // If the component (like a Module) can provide assessments
            component.getAssessments().forEach(asm => {
                if (!this.assessments.has(asm.assessmentId)) {
                    this.assessments.set(asm.assessmentId, asm);
                }
            });
        }
    }

    addAssessment(assessment: Assessment): void {
        if (!this.assessments.has(assessment.assessmentId)) {
            this.assessments.set(assessment.assessmentId, assessment);
            console.log(`Assessment "${assessment.title}" added to ${this.courseName}.`);
            // Notify enrolled students
            const studentList = Array.from(this.enrolledStudents.values());
            if (studentList.length > 0) {
                 NotificationService.getInstance().broadcastNotification(studentList, "New Assessment", `A new assessment '${assessment.title}' has been added to ${this.courseName}. Due: ${assessment.dueDate.toLocaleDateString()}`);
            }
        } else {
            console.warn(`Assessment with ID ${assessment.assessmentId} already exists in ${this.courseName}.`);
        }
    }

    getAssessment(assessmentId: string): Assessment | undefined {
        return this.assessments.get(assessmentId);
    }

    getAllAssessments(): Assessment[] {
        // Collect assessments from explicitly added ones and those within content modules
        const allAssessmentsMap = new Map<string, Assessment>();
        this.assessments.forEach(asm => allAssessmentsMap.set(asm.assessmentId, asm));
        this.content.forEach(component => {
            if (component.getAssessments) {
                component.getAssessments().forEach(asm => {
                    if (!allAssessmentsMap.has(asm.assessmentId)) {
                         allAssessmentsMap.set(asm.assessmentId, asm);
                    }
                });
            }
        });
        return Array.from(allAssessmentsMap.values());
    }

    setSchedule(newSchedule: string): void {
        this.schedule = newSchedule;
        const studentList = Array.from(this.enrolledStudents.values());
        if (studentList.length > 0) {
             NotificationService.getInstance().broadcastNotification(studentList, "Schedule Update", `The schedule for ${this.courseName} has been updated: ${this.schedule}`);
        }
    }

    displayCourseContent(): void {
        console.log(`\n--- Content for ${this.courseName} (ID: ${this.courseId}) ---`);
        console.log(`Professor: ${this.professor?.name || 'Not Assigned'}`);
        console.log(`Schedule: ${this.schedule}`);
        console.log(`Credits: ${this.credits}`);
        console.log(`Content Structure:`);
        this.content.forEach(item => item.display("  "));
        console.log(`\nCourse Assessments (Summary):`);
        this.getAllAssessments().forEach(asm => console.log(`  - ${asm.title} (ID: ${asm.assessmentId}, Weight: ${asm.weight*100}%)`));
        console.log(`------------------------------------------------`);
    }
}

// ========== 5. ENROLLMENT CLASS (Encapsulation of Grading Logic) ==========
interface GradeRecord {
    assessment: Assessment;
    submissionContent?: any;
    score?: number; // Percentage score
    submissionDate?: Date;
}

class Enrollment {
    private grades: Map<string, GradeRecord> = new Map(); // assessmentId -> GradeRecord

    constructor(public student: Student, public course: Course) {
        // Initialize grade records for all assessments in the course at enrollment time
        this.course.getAllAssessments().forEach(asm => {
            this.grades.set(asm.assessmentId, { assessment: asm });
        });
    }

    submitAssessment(assessmentId: string, submissionContent: any): void {
        const assessment = this.course.getAssessment(assessmentId);
        if (assessment) {
            assessment.submit(this.student.studentId, submissionContent); // Let assessment handle its own submission logic
            const gradeRecord = this.grades.get(assessmentId);
            if (gradeRecord) {
                gradeRecord.submissionContent = submissionContent;
                gradeRecord.submissionDate = new Date();
                this.student.receiveNotification("Submission Received", `Your submission for '${assessment.title}' in ${this.course.courseName} has been received.`);
            }
        } else {
            console.warn(`Assessment ID ${assessmentId} not found in course ${this.course.courseName}.`);
        }
    }

    recordGrade(assessmentId: string, score: number): void {
        const assessment = this.course.getAssessment(assessmentId);
        if (assessment) {
            assessment.grade(this.student.studentId, score); // Assessment updates its internal grade
            const gradeRecord = this.grades.get(assessmentId);
            if (gradeRecord) {
                gradeRecord.score = assessment.getGrade(this.student.studentId); // Get score from assessment
            } else { // If assessment was added after enrollment, create record
                 this.grades.set(assessmentId, { assessment: assessment, score: score });
            }
        } else {
            console.warn(`Cannot record grade. Assessment ID ${assessmentId} not found in course ${this.course.courseName}.`);
        }
    }

    getGrades(): GradeRecord[] {
        // Ensure all current course assessments are in the grades map
        this.course.getAllAssessments().forEach(asm => {
            if (!this.grades.has(asm.assessmentId)) {
                this.grades.set(asm.assessmentId, { assessment: asm });
            } else { // Refresh score from assessment object in case it was graded directly
                const gradeRecord = this.grades.get(asm.assessmentId)!;
                gradeRecord.score = asm.getGrade(this.student.studentId);
            }
        });
        return Array.from(this.grades.values());
    }

    calculateFinalGrade(): number | null {
        let totalWeightedScore = 0;
        let totalWeightAchieved = 0;
        let allGraded = true;

        const currentGrades = this.getGrades();
        if (currentGrades.length === 0) return null; // No assessments yet

        for (const record of currentGrades) {
            if (record.score !== undefined) {
                totalWeightedScore += record.score * record.assessment.weight;
                totalWeightAchieved += record.assessment.weight;
            } else {
                allGraded = false; // If any assessment is not graded, final grade might be provisional
            }
        }

        if (totalWeightAchieved === 0 && !allGraded) return null; // Nothing graded yet
        if (totalWeightAchieved === 0 && allGraded && currentGrades.length > 0) return 0; // All assessments have 0 weight? Or no scores yet.

        // If not all items are graded but some are, calculate based on what's available
        if (totalWeightAchieved > 0) {
            return totalWeightedScore / totalWeightAchieved; // This gives average of graded items, scaled by their contribution
        }
        return allGraded ? 0 : null; // If all graded and total weight is 0, then 0. Otherwise null if nothing has weight.
    }
}


// ========== SAMPLE USAGE ==========
console.log("===== University LMS Initialization =====\n");
const notificationService = NotificationService.getInstance();

// --- 1. Create Users ---
const adminEve = new Admin("A001", "Eve Adamson", "eve@uni.edu", new Date(1980, 0, 1), "ADM001");
const profAlan = new Professor("P001", "Dr. Alan Turing", "alan.turing@uni.edu", new Date(1912, 5, 23), "FAC001", "Computer Science");
const profAda = new Professor("P002", "Dr. Ada Lovelace", "ada.lovelace@uni.edu", new Date(1815, 11, 10), "FAC002", "Mathematics");
const studentBob = new Student("S001", "Bob Byte", "bob.byte@uni.edu", new Date(2003, 3, 15), "SID001", "Computer Science");
const studentAlice = new Student("S002", "Alice Algorithm", "alice.algo@uni.edu", new Date(2004, 7, 22), "SID002", "Data Science");

adminEve.registerUser(profAlan);
adminEve.registerUser(profAda);
adminEve.registerUser(studentBob);
adminEve.registerUser(studentAlice);
console.log(profAlan.getProfile());
console.log(studentBob.getProfile());
console.log("\n");

// --- 2. Admin Creates Courses ---
console.log("===== Admin Creates Courses =====");
const cs101 = adminEve.createCourse("CS101", "Introduction to Programming", 3);
const ma202 = adminEve.createCourse("MA202", "Calculus II", 4);
const ds301 = adminEve.createCourse("DS301", "Machine Learning Basics", 3);
console.log("\n");

// --- 3. Professors Assigned & Manage Courses ---
console.log("===== Professors Manage Courses =====");
profAlan.assignCourse(cs101);
profAda.assignCourse(ma202);
profAlan.assignCourse(ds301); // Alan teaches two courses

cs101.setSchedule("Mon, Wed 10:00 - 11:30 AM, Room C1");
ma202.setSchedule("Tue, Thu 1:00 - 2:30 PM, Room M5");

// --- 4. Course Content & Assessments (Composite & Polymorphism) ---
// For CS101
const cs101quiz1 = new Quiz("CS101Q1", "Basic Syntax Quiz", "Quiz on variables and loops", new Date(2025, 8, 15, 23, 59), 0.2, 30);
const cs101assign1 = new Assignment("CS101A1", "First Program", "Write a simple calculator", new Date(2025, 8, 30, 23, 59), 0.3, "Python Script (.py)");
const cs101project = new Project("CS101P1", "Text Adventure Game", "Create a simple text-based game", new Date(2025, 9, 30, 23, 59), 0.5, false);

profAlan.addAssessmentToCourse(cs101, cs101quiz1);
profAlan.addAssessmentToCourse(cs101, cs101assign1);
// Let's add the project via a module
const cs101Module1 = new Module("Module 1: Fundamentals");
cs101Module1.add(new Lecture("L1.1: Intro to Programming", 60, "http://uni.edu/cs101/l1.1"));
cs101Module1.add(new Lecture("L1.2: Variables & Data Types", 75, "http://uni.edu/cs101/l1.2"));
cs101Module1.add(cs101quiz1); // Quiz associated with Module 1

const cs101Module2 = new Module("Module 2: Control Flow & Functions");
cs101Module2.add(new Lecture("L2.1: Loops and Conditionals", 90));
cs101Module2.add(cs101assign1); // Assignment in Module 2

const cs101Module3 = new Module("Module 3: Final Project");
cs101Module3.add(cs101project);

cs101.addContent(cs101Module1);
cs101.addContent(cs101Module2);
cs101.addContent(cs101Module3);

cs101.displayCourseContent();

// --- 5. Students Enroll & Interact ---
console.log("===== Students Enroll & Interact =====");
const bobCs101Enrollment = studentBob.enroll(cs101);
const aliceCs101Enrollment = studentAlice.enroll(cs101);
const aliceMa202Enrollment = studentAlice.enroll(ma202); // Alice enrolls in another course

console.log(`CS101 Enrolled Students: ${Array.from(cs101.enrolledStudents.keys()).join(', ')}`);
console.log("\n");

// Students submit assessments
studentBob.submitAssessment("CS101", "CS101Q1", { q1: "A", q2: "C" });
studentBob.submitAssessment("CS101", "CS101A1", "print('Hello World')");
studentAlice.submitAssessment("CS101", "CS101Q1", { q1: "B", q2: "C" }); // Alice also submits
// Alice submits assignment late
const lateDueDate = new Date(cs101assign1.dueDate);
lateDueDate.setDate(lateDueDate.getDate() + 2); // 2 days after due date
const originalNow = Date.now; // Save original Date.now
(globalThis as any).Date.now = () => lateDueDate.getTime(); // Simulate time passing for submission
studentAlice.submitAssessment("CS101", "CS101A1", "late_submission.py");
(globalThis as any).Date.now = originalNow; // Restore Date.now
console.log("\n");


// --- 6. Professors Grade Assessments ---
console.log("===== Professors Grade Assessments =====");
profAlan.gradeAssessment(studentBob, "CS101", "CS101Q1", 85);
profAlan.gradeAssessment(studentBob, "CS101", "CS101A1", 92);
// Bob submits project, then prof grades it
studentBob.submitAssessment("CS101", "CS101P1", "Final game project files");
profAlan.gradeAssessment(studentBob, "CS101", "CS101P1", 78);


profAlan.gradeAssessment(studentAlice, "CS101", "CS101Q1", 90);
// Alice's assignment was submitted late, might get 0 or penalty (handled by submit logic, grading is separate)
// If submission failed, grade won't apply to a non-existent submission.
// Let's assume for demo, even if submitted late, the system accepted it 
profAlan.gradeAssessment(studentAlice, "CS101", "CS101A1", 60); // Lower grade due to lateness (manual penalty)
console.log("\n");


// --- 7. Students View Grades (Encapsulation of Calculation) ---
console.log("===== Students View Grades =====");
studentBob.viewGrades("CS101");
studentAlice.viewGrades("CS101"); // Alice's project not submitted/graded yet
studentAlice.viewGrades("MA202"); // No assessments/grades yet for MA202 for Alice

// Alice submits her project
studentAlice.submitAssessment("CS101", "CS101P1", "Alice's awesome game");
profAlan.gradeAssessment(studentAlice, "CS101", "CS101P1", 95);
studentAlice.viewGrades("CS101"); // View updated grades for Alice in CS101
console.log("\n");

// --- 8. Notifications (Demonstrated throughout) ---
// e.g., studentBob receives notification about grade for CS101Q1.
// e.g., profAlan received notification about studentBob enrolling.

// Example: Course content update notification
const newLecture = new Lecture("L2.2: Advanced Functions", 60, "http://uni.edu/cs101/l2.2");
cs101Module2.add(newLecture); 
// Manually trigger a broadcast for this type of change if desired
// NotificationService.getInstance().broadcastNotification(
//     Array.from(cs101.enrolledStudents.values()),
//     "Course Content Update",
//     `New lecture "${newLecture.title}" added to Module 2 in ${cs101.courseName}.`
// );
cs101.displayCourseContent();


console.log("===== University LMS Demo End =====\n");