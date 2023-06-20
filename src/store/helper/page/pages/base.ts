import { PageType } from '@/d.ts';

export class Page {
  static getTitleByParams: (params: Page['pageParams']) => string;
  public pageType: PageType;
  public pageTitle: string;
  public pageKey: string;
  public pageParams: Record<any, any> = {};
}
