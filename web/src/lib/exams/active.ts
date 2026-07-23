import { cookies } from "next/headers";
import { getExams, type Exam } from "./queries";

export async function getActiveExam(): Promise<Exam | null> {
  const exams = await getExams();
  if (exams.length === 0) return null;

  const cookieStore = await cookies();
  const cookieId = cookieStore.get("active_exam_id")?.value;
  return exams.find((e) => e.id === cookieId) ?? exams[0];
}
