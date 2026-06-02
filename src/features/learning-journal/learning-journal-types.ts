export type LearningNote = {
  id: string;
  title: string;
  contentHtml: string;
  tags: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LearningFilter = "all" | "active" | "archived";
