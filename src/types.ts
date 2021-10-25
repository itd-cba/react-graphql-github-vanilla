export type PageInfo = {
  endCursor: string;
  hasNextPage: boolean;
};

export type OrganizationType = {
  name: string;
  url: string;
  repository: RepositoryType;
};

export type RepositoryType = {
  name: string;
  url: string;
  issues: IssueList;
};

export type IssueList = {
  edges: IssueListEdge[];
  pageInfo: PageInfo;
  totalCount: number;
};

export type IssueListEdge = {
  node: Issue;
};

export type Issue = {
  id: string;
  title: string;
  url: string;
  reactions: ReactionsList;
};

export type ReactionsList = {
  edges: ReactionsListEdge[];
};

export type ReactionsListEdge = {
  node: Reaction;
};
export type Reaction = {
  id: string;
  content: ReactionsContent;
};

export enum ReactionsContent {
  THUMBS_UP = "👍",
  THUMBS_DOWN = "👎",
  LAUGH = "🤣",
  HOORAY = "🎉",
  CONFUSED = "😕",
  HEART = "💜",
  ROCKET = "🚀",
  EYES = "👀"
}

export type ErrorMessage = {
  data: {
    errors: [GQLError];
  };
};

export type GQLError = {
  message: string;
};

export type SuccessMessage = {
  data: {
    organization: OrganizationType;
  };
};
