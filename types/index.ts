export type Course = {
  id: string;
  user_id: string;
  course_name: string;
  color: string;
  emoji: string;
  created_at: string;
  notes?: Note[];
};

export type Note = {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  content?: string;
  summary?: string;
  status: "pending" | "processing" | "done" | "error";
  created_at: string;
  flashcards?: Flashcard[];
};

export type Flashcard = {
  id: string;
  note_id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
};
