import { Type } from "@nestjs/common";
import { Firestore } from "firebase-admin/firestore";

export abstract class CoreDatabaseTable<T> {
  constructor(
    private readonly name: string,
    private readonly jsonData: Array<T>,
    private readonly loader: Firestore,
  ) {}

  async drop(): Promise<void> {
    this.jsonData.forEach(async (element: any) => {
      await this.loader
        .collection(this.name)
        .doc(element.id.toString())
        .delete();
    });
  }

  async publish(): Promise<void> {
    this.jsonData.forEach(async (element: any) => {
      await this.loader
        .collection(this.name)
        .doc(element.id.toString())
        .create(element);
    });
  }
}

export type CoreDatabaseType = Type<CoreDatabaseTable<any>>;
