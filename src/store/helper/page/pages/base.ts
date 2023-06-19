import { PageType } from '@/d.ts';

export class Page {
  public pageType: PageType;
  public pageTitle: string;
  public pageKey: string;
  public pageParams: Record<any, any> = {};
}
