export interface FeatureCard {
  title: string;
  description: string;
  points: string[];
}

export interface UseCaseCard {
  title: string;
  points: string[];
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}
